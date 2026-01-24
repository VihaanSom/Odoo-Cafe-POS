const prisma = require('../config/prisma');
const { TABLE_STATUS } = require('../utils/constants');

/**
 * Create a new table
 */
const createTable = async ({ floorId, tableNumber }) => {
    return prisma.table.create({
        data: { 
            floorId, 
            tableNumber,
            status: TABLE_STATUS.FREE 
        },
        include: { floor: true }
    });
};

/**
 * Get all tables (optionally filter by floor)
 */
const getAllTables = async (floorId) => {
    const where = floorId ? { floorId } : {};
    return prisma.table.findMany({
        where,
        include: { floor: true },
        orderBy: { tableNumber: 'asc' }
    });
};

/**
 * Get table by ID
 */
const getTableById = async (id) => {
    return prisma.table.findUnique({
        where: { id },
        include: { floor: true }
    });
};

/**
 * Update table
 */
const updateTable = async (id, { tableNumber, status }) => {
    const data = {};
    if (tableNumber !== undefined) data.tableNumber = tableNumber;
    if (status !== undefined) data.status = status;
    
    return prisma.table.update({
        where: { id },
        data,
        include: { floor: true }
    });
};

/**
 * Update table status
 */
const updateTableStatus = async (id, status) => {
    return prisma.table.update({
        where: { id },
        data: { status },
        include: { floor: true }
    });
};

/**
 * Delete table
 */
const deleteTable = async (id) => {
    return prisma.table.delete({
        where: { id }
    });
};

module.exports = {
    createTable,
    getAllTables,
    getTableById,
    updateTable,
    updateTableStatus,
    deleteTable,
};
