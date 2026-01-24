const prisma = require('../config/prisma');
const { MESSAGES } = require('../utils/constants');

/**
 * Open a new POS session for a terminal
 */
const openSession = async (terminalId) => {
    // Check if terminal exists
    const terminal = await prisma.posTerminal.findUnique({
        where: { id: terminalId }
    });

    if (!terminal) {
        const error = new Error('Terminal not found');
        error.statusCode = 404;
        throw error;
    }

    // Check if there is already an open session for this terminal
    const existingSession = await prisma.posSession.findFirst({
        where: {
            terminalId,
            closedAt: null
        }
    });

    if (existingSession) {
        const error = new Error('Terminal already has an active session');
        error.statusCode = 400;
        throw error;
    }

    // Create new session
    const session = await prisma.posSession.create({
        data: {
            terminalId,
            totalSales: 0
        },
        include: {
            terminal: true
        }
    });

    return session;
};

/**
 * Close an existing POS session
 */
const closeSession = async (sessionId) => {
    // Check if session exists
    const session = await prisma.posSession.findUnique({
        where: { id: sessionId }
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

    // Calculate total sales from orders in this session
    const salesAggregate = await prisma.order.aggregate({
        where: { sessionId },
        _sum: { totalAmount: true }
    });

    const totalSales = salesAggregate._sum.totalAmount || 0;

    // Close the session
    const closedSession = await prisma.posSession.update({
        where: { id: sessionId },
        data: {
            closedAt: new Date(),
            totalSales
        },
        include: {
            terminal: true
        }
    });

    return closedSession;
};

/**
 * Get session by ID
 */
const getSessionById = async (sessionId) => {
    const session = await prisma.posSession.findUnique({
        where: { id: sessionId },
        include: {
            terminal: true,
            orders: {
                include: {
                    orderItems: true
                }
            }
        }
    });

    if (!session) {
        const error = new Error(MESSAGES.SESSION_NOT_FOUND);
        error.statusCode = 404;
        throw error;
    }

    return session;
};

/**
 * Get all active (open) sessions
 */
const getActiveSessions = async () => {
    const sessions = await prisma.posSession.findMany({
        where: { closedAt: null },
        include: {
            terminal: true
        }
    });

    return sessions;
};

module.exports = {
    openSession,
    closeSession,
    getSessionById,
    getActiveSessions
};
