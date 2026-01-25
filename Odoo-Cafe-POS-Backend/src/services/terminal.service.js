const prisma = require('../config/prisma');

/**
 * Create a new POS terminal
 */
const createTerminal = async (data) => {
    const { terminalName, branchId, userId } = data;

    // Validate inputs
    if (!terminalName) {
        const error = new Error('Terminal name is required');
        error.statusCode = 400;
        throw error;
    }

    // Optional: Check if branch exists if branchId is provided
    if (branchId) {
        const branch = await prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch) {
            const error = new Error('Branch not found');
            error.statusCode = 404;
            throw error;
        }
    }

    const terminal = await prisma.posTerminal.create({
        data: {
            terminalName,
            branchId,
            userId,
        },
        include: {
            branch: true,
            user: true,
        },
    });

    return terminal;
};

/**
 * Get all terminals
 */
const getAllTerminals = async () => {
    return await prisma.posTerminal.findMany({
        include: {
            branch: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            posSessions: {
                orderBy: {
                    openedAt: 'desc'
                },
                take: 1
            }
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

/**
 * Get terminal by ID
 */
const getTerminalById = async (id) => {
    const terminal = await prisma.posTerminal.findUnique({
        where: { id },
        include: {
            branch: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
        },
    });

    if (!terminal) {
        const error = new Error('Terminal not found');
        error.statusCode = 404;
        throw error;
    }

    return terminal;
};

module.exports = {
    createTerminal,
    getAllTerminals,
    getTerminalById,
};
