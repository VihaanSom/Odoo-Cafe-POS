const prisma = require('../config/prisma');

/**
 * Create a new branch
 */
const createBranch = async ({ name, address }) => {
    return prisma.branch.create({
        data: { name, address }
    });
};

/**
 * Get all branches
 */
const getAllBranches = async () => {
    return prisma.branch.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * Get branch by ID
 */
const getBranchById = async (id) => {
    return prisma.branch.findUnique({
        where: { id }
    });
};

/**
 * Update branch
 */
const updateBranch = async (id, { name, address }) => {
    return prisma.branch.update({
        where: { id },
        data: { name, address }
    });
};

/**
 * Delete branch
 */
const deleteBranch = async (id) => {
    return prisma.branch.delete({
        where: { id }
    });
};

module.exports = {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch,
};
