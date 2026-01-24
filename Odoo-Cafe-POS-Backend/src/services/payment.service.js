const prisma = require('../config/prisma');
const { MESSAGES, PAYMENT_STATUS, ORDER_STATUS, TABLE_STATUS, ORDER_TYPE } = require('../utils/constants');

/**
 * Process Payment
 */
const processPayment = async (data) => {
    const { orderId, amount, method, transactionReference } = data;

    // 1. Fetch Order with items for validation
    const order = await prisma.order.findUnique({
        where: { id: orderId }
    });

    if (!order) {
        throw new Error(MESSAGES.ORDER_NOT_FOUND);
    }

    if (order.status === ORDER_STATUS.COMPLETED) {
        throw new Error('Order is already paid/completed');
    }

    // 2. Transaction
    return await prisma.$transaction(async (tx) => {
        // Create Payment
        const payment = await tx.payment.create({
            data: {
                orderId,
                amount,
                method,
                status: PAYMENT_STATUS.COMPLETED,
                transactionReference
            }
        });

        // Update Order Status
        await tx.order.update({
            where: { id: orderId },
            data: { status: ORDER_STATUS.COMPLETED }
        });

        // If Dine In, Free the Table
        if (order.orderType === ORDER_TYPE.DINE_IN && order.tableId) {
            await tx.table.update({
                where: { id: order.tableId },
                data: { status: TABLE_STATUS.FREE }
            });
        }

        return payment;
    });
};

/**
 * Generate Receipt
 */
const generateReceipt = async (orderId) => {
    // 1. Fetch Full Order Details
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            orderItems: {
                include: { product: true }
            },
            table: true,
            branch: true,
            session: true,
            payments: true,
            creator: true // User who created order
        }
    });

    if (!order) {
        throw new Error(MESSAGES.ORDER_NOT_FOUND);
    }

    // Generate Receipt Number
    const receiptNumber = `RCPT-${Date.now()}`;

    // 2. Save Receipt to Database
    await prisma.receipt.create({
        data: {
            orderId,
            receiptNumber
        }
    });

    // 3. Return Receipt Data
    const receiptData = {
        receiptNumber,
        date: new Date(),
        branchId: order.branchId, // Or details if fetched
        orderId: order.id,
        items: order.orderItems.map(item => ({
            name: item.product.name,
            qty: item.quantity,
            price: item.priceAtTime,
            total: Number(item.priceAtTime) * item.quantity
        })),
        totalAmount: order.totalAmount,
        payments: order.payments,
        table: order.table ? order.table.tableNumber : 'Takeaway'
    };

    return receiptData;
};

module.exports = {
    processPayment,
    generateReceipt
};
