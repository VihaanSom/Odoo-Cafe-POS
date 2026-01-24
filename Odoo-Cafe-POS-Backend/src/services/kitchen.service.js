const prisma = require('../config/prisma');
const { ORDER_STATUS, MESSAGES } = require('../utils/constants');

/**
 * Get all active orders for Kitchen Display System
 * Returns orders with status CREATED or IN_PROGRESS
 */
const getActiveOrders = async (branchId) => {
    const where = {
        status: { in: [ORDER_STATUS.CREATED, ORDER_STATUS.IN_PROGRESS] }
    };
    
    if (branchId) {
        where.branchId = branchId;
    }
    
    return prisma.order.findMany({
        where,
        include: {
            orderItems: {
                include: {
                    product: true
                }
            },
            table: true,
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    });
};

/**
 * Get orders by status
 */
const getOrdersByStatus = async (status, branchId) => {
    const where = { status };
    if (branchId) where.branchId = branchId;
    
    return prisma.order.findMany({
        where,
        include: {
            orderItems: {
                include: { product: true }
            },
            table: true
        },
        orderBy: { createdAt: 'asc' }
    });
};

/**
 * Get ready orders (for serving)
 */
const getReadyOrders = async (branchId) => {
    return getOrdersByStatus(ORDER_STATUS.READY, branchId);
};

/**
 * Update order status with validation
 */
const updateOrderStatus = async (orderId, newStatus) => {
    // Define valid status transitions
    const validTransitions = {
        [ORDER_STATUS.CREATED]: [ORDER_STATUS.IN_PROGRESS],
        [ORDER_STATUS.IN_PROGRESS]: [ORDER_STATUS.READY],
        [ORDER_STATUS.READY]: [ORDER_STATUS.COMPLETED]
    };
    
    // Fetch current order
    const order = await prisma.order.findUnique({
        where: { id: orderId }
    });
    
    if (!order) {
        const error = new Error(MESSAGES.ORDER_NOT_FOUND);
        error.statusCode = 404;
        throw error;
    }
    
    // Check if transition is valid
    const allowedTransitions = validTransitions[order.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
        const error = new Error(`${MESSAGES.INVALID_STATUS_TRANSITION}: ${order.status} → ${newStatus}`);
        error.statusCode = 400;
        throw error;
    }
    
    // Update the order
    return prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
        include: {
            orderItems: {
                include: { product: true }
            },
            table: true
        }
    });
};

/**
 * Mark order as in progress (kitchen starts cooking)
 */
const startOrder = async (orderId) => {
    return updateOrderStatus(orderId, ORDER_STATUS.IN_PROGRESS);
};

/**
 * Mark order as ready (kitchen finished cooking)
 */
const markOrderReady = async (orderId) => {
    return updateOrderStatus(orderId, ORDER_STATUS.READY);
};

module.exports = {
    getActiveOrders,
    getOrdersByStatus,
    getReadyOrders,
    updateOrderStatus,
    startOrder,
    markOrderReady,
};
