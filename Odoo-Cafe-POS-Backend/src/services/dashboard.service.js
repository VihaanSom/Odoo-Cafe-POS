const prisma = require('../config/prisma');
const { ORDER_STATUS } = require('../utils/constants');

/**
 * Get Dashboard Statistics
 */
const getDashboardStats = async (userId) => {
    // 1. Get User terminal to find branch
    const terminal = await prisma.posTerminal.findFirst({
        where: { userId: userId },
        select: { branchId: true }
    });

    const branchId = terminal?.branchId;

    // 2. Get Last Closing Date
    const lastSession = await prisma.posSession.findFirst({
        where: {
            terminal: { userId: userId },
            closedAt: { not: null }
        },
        orderBy: { closedAt: 'desc' },
        select: { closedAt: true }
    });

    // 3. Get Today's Sales
    let todaySalesValue = 0;
    if (branchId) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const sales = await prisma.order.aggregate({
            where: {
                branchId: branchId,
                status: ORDER_STATUS.COMPLETED,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            _sum: {
                totalAmount: true
            }
        });
        todaySalesValue = Number(sales._sum.totalAmount || 0);
    }

    // 4. Current active session info for duration
    const activeSession = await prisma.posSession.findFirst({
        where: {
            terminal: { userId: userId },
            closedAt: null
        },
        select: { openedAt: true }
    });

    return {
        lastClosingDate: lastSession ? lastSession.closedAt : null,
        todaySales: todaySalesValue,
        activeSessionOpenedAt: activeSession ? activeSession.openedAt : null
    };
};

module.exports = {
    getDashboardStats
};
