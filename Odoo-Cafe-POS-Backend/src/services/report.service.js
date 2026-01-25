const prisma = require('../config/prisma');
const { ORDER_STATUS } = require('../utils/constants');

/**
 * Get daily sales summary
 */
const getDailySales = async (branchId, date) => {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const where = {
        status: ORDER_STATUS.COMPLETED,
        createdAt: {
            gte: targetDate,
            lt: nextDay
        }
    };

    if (branchId) where.branchId = branchId;

    const result = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        _count: true,
        where
    });

    return {
        date: targetDate.toISOString().split('T')[0],
        totalSales: result._sum.totalAmount || 0,
        orderCount: result._count || 0
    };
};

/**
 * Get sales by date range
 */
const getSalesByRange = async (branchId, startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const where = {
        status: ORDER_STATUS.COMPLETED,
        createdAt: { gte: start, lte: end }
    };

    if (branchId) where.branchId = branchId;

    // Get all orders for breakdown
    const orders = await prisma.order.findMany({
        where,
        select: { createdAt: true, totalAmount: true }
    });

    let totalSales = 0;
    const dailyBreakdown = {};

    orders.forEach(order => {
        const amount = parseFloat(order.totalAmount) || 0;
        totalSales += amount;

        const dateKey = order.createdAt.toISOString().split('T')[0];
        if (!dailyBreakdown[dateKey]) {
            dailyBreakdown[dateKey] = { date: dateKey, sales: 0, orders: 0 };
        }
        dailyBreakdown[dateKey].sales += amount;
        dailyBreakdown[dateKey].orders += 1;
    });

    return {
        startDate: startDate,
        endDate: endDate,
        totalSales: totalSales,
        orderCount: orders.length,
        dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => a.date.localeCompare(b.date))
    };
};

/**
 * Get top selling products
 */
const getTopProducts = async (branchId, limit = 10) => {
    const where = {};
    if (branchId) {
        where.order = { branchId };
    }

    const products = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        where,
        orderBy: { _sum: { quantity: 'desc' } },
        take: limit
    });

    // Fetch product details
    const productIds = products.map(p => p.productId).filter(Boolean);
    const productDetails = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, price: true }
    });

    const productMap = new Map(productDetails.map(p => [p.id, p]));

    return products.map(p => ({
        product: productMap.get(p.productId) || { id: p.productId },
        totalQuantity: p._sum.quantity || 0
    }));
};

/**
 * Get order count by status
 */
const getOrdersByStatus = async (branchId) => {
    const where = branchId ? { branchId } : {};

    const statuses = await prisma.order.groupBy({
        by: ['status'],
        _count: true,
        where
    });

    return statuses.map(s => ({
        status: s.status,
        count: s._count
    }));
};

/**
 * Get hourly sales for a day
 */
const getHourlySales = async (branchId, date) => {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const where = {
        status: ORDER_STATUS.COMPLETED,
        createdAt: { gte: targetDate, lt: nextDay }
    };

    if (branchId) where.branchId = branchId;

    const orders = await prisma.order.findMany({
        where,
        select: {
            createdAt: true,
            totalAmount: true
        }
    });

    // Group by hour
    const hourlyData = {};
    for (let i = 0; i < 24; i++) {
        hourlyData[i] = { hour: i, sales: 0, orders: 0 };
    }

    orders.forEach(order => {
        const hour = new Date(order.createdAt).getHours();
        hourlyData[hour].sales += parseFloat(order.totalAmount) || 0;
        hourlyData[hour].orders += 1;
    });

    return Object.values(hourlyData);
};

module.exports = {
    getDailySales,
    getSalesByRange,
    getTopProducts,
    getOrdersByStatus,
    getHourlySales,
};
