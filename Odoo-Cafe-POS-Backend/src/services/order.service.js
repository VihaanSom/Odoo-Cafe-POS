const prisma = require('../config/prisma');
const { MESSAGES, ORDER_STATUS, ORDER_TYPE, TABLE_STATUS } = require('../utils/constants');

/**
 * Create a new Order
 * Supports initial items addition for "Place Order" with local cart
 */
const createOrder = async (data, userId) => {
    const { branchId, sessionId, tableId, orderType, customerName } = data;

    // 1. Validate Session
    const session = await prisma.posSession.findUnique({
        where: { id: sessionId },
    });

    if (!session) {
        const error = new Error(MESSAGES.SESSION_NOT_FOUND);
        error.statusCode = 404;
        throw error;
    }

    if (session.closedAt) {
        const error = new Error(MESSAGES.SESSION_ALREADY_CLOSED);
        error.statusCode = 400;
        throw error;
    }

    // 2. Validate & Handle DINE_IN vs TAKEAWAY
    if (orderType === ORDER_TYPE.DINE_IN) {
        if (!tableId) {
            const error = new Error(MESSAGES.TABLE_ID_REQUIRED);
            error.statusCode = 400;
            throw error;
        }

        // Check if table exists
        const table = await prisma.table.findUnique({ where: { id: tableId } });
        if (!table) {
            const error = new Error(MESSAGES.TABLE_NOT_FOUND);
            error.statusCode = 404;
            throw error;
        }

        // Check if table is free (Concurrency check)
        if (table.status !== 'FREE') {
            const error = new Error('Table is already occupied');
            error.statusCode = 409; // Conflict
            throw error;
        }

        // Update Table Status to OCCUPIED
        await prisma.table.update({
            where: { id: tableId },
            data: { status: TABLE_STATUS.OCCUPIED },
        });
    }

    // 3. Handle Initial Items (if provided)
    const finalTableId = orderType === ORDER_TYPE.DINE_IN ? tableId : null;
    let itemsData = [];
    let initialTotal = 0;

    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        // Fetch prices for all products
        const productIds = data.items.map(item => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } }
        });

        // Map items to create data
        for (const item of data.items) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const lineTotal = Number(product.price) * item.quantity;
                initialTotal += lineTotal;
                itemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtTime: product.price
                });
            }
        }
    }

    // 4. Create Order with Items (if any)
    const order = await prisma.order.create({
        data: {
            branchId,
            sessionId,
            tableId: finalTableId,
            orderType,
            status: ORDER_STATUS.CREATED,
            totalAmount: initialTotal,
            createdBy: userId,
            orderItems: {
                create: itemsData
            }
        },
        include: {
            table: true,
            orderItems: true
        }
    });

    return order;
};

/**
 * Add Items to Order (Batch)
 * Replaces singular addOrderItem
 */
const addOrderItems = async (orderId, items) => {
    // items = [{ productId, quantity }]

    if (!items || items.length === 0) {
        throw new Error('No items provided');
    }

    // 1. Fetch products to get prices
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
    });

    // 2. Transaction
    return await prisma.$transaction(async (tx) => {
        let totalIncrement = 0;
        const createdItems = [];

        for (const item of items) {
            const product = products.find(p => p.id === item.productId);
            if (!product) continue; // Skip invalid products

            const lineTotal = Number(product.price) * item.quantity;
            totalIncrement += lineTotal;

            const newItem = await tx.orderItem.create({
                data: {
                    orderId,
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtTime: product.price
                }
            });
            createdItems.push(newItem);
        }

        // Update Order Total
        const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: {
                totalAmount: { increment: totalIncrement }
            },
            include: { orderItems: { include: { product: true } } }
        });

        return { createdItems, order: updatedOrder };
    });
};

/**
 * Send Order to Kitchen
 */
const sendToKitchen = async (orderId) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true }
    });

    if (!order) {
        const error = new Error(MESSAGES.ORDER_NOT_FOUND);
        error.statusCode = 404;
        throw error;
    }

    if (order.orderItems.length === 0) {
        const error = new Error('Cannot send empty order to kitchen');
        error.statusCode = 400;
        throw error;
    }

    return { message: 'Order sent to kitchen successfully', orderId };
};

/**
 * Get Order Details
 */
const getOrderById = async (orderId) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            table: true,
            orderItems: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!order) {
        const error = new Error(MESSAGES.ORDER_NOT_FOUND);
        error.statusCode = 404;
        throw error;
    }

    return order;
};

/**
 * Get Active Order for a Table (DINE_IN)
 */
const getActiveOrderByTable = async (tableId) => {
    const order = await prisma.order.findFirst({
        where: {
            tableId,
            orderType: ORDER_TYPE.DINE_IN,
            status: {
                not: ORDER_STATUS.COMPLETED
            }
        },
        include: {
            orderItems: {
                include: {
                    product: true
                }
            },
            table: true
        }
    });

    return order;
};

module.exports = {
    createOrder,
    addOrderItems,
    sendToKitchen,
    getOrderById,
    getActiveOrderByTable
};
