const prisma = require('../config/prisma');

/**
 * Create a new floor
 */
const createFloor = async ({ branchId, name }) => {
    return prisma.floor.create({
        data: { branchId, name },
        include: { branch: true }
    });
};

/**
 * Get all floors (optionally filter by branch)
 */
const getAllFloors = async (branchId) => {
    const where = branchId ? { branchId } : {};
    return prisma.floor.findMany({
        where,
        include: { branch: true, tables: true },
        orderBy: { name: 'asc' }
    });
};

/**
 * Get floor by ID
 */
const getFloorById = async (id) => {
    return prisma.floor.findUnique({
        where: { id },
        include: { branch: true, tables: true }
    });
};

/**
 * Get floor layout for a branch (floors with tables)
 */
const getFloorLayout = async (branchId) => {
    return prisma.floor.findMany({
        where: { branchId },
        include: { 
            tables: {
                orderBy: { tableNumber: 'asc' }
            }
        },
        orderBy: { name: 'asc' }
    });
};

/**
 * Update floor
 */
const updateFloor = async (id, { name }) => {
    return prisma.floor.update({
        where: { id },
        data: { name },
        include: { branch: true }
    });
};

/**
 * Delete floor
 */
const deleteFloor = async (id) => {
    return prisma.floor.delete({
        where: { id }
    });
};

module.exports = {
    createFloor,
    getAllFloors,
    getFloorById,
    getFloorLayout,
    updateFloor,
    deleteFloor,
};
