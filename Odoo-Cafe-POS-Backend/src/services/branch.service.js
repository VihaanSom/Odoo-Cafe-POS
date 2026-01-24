const prisma = require('../config/prisma');
const { MESSAGES } = require('../utils/constants');

/**
 * Check if branch name already exists
 */
const getBranchByName = async (name) => {
    return prisma.branch.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
    });
};

/**
 * Create a new branch
 */
const createBranch = async ({ name, address }) => {
    // Check for duplicate name
    const existing = await getBranchByName(name);
    if (existing) {
        const error = new Error('Branch name already exists');
        error.statusCode = 409;
        throw error;
    }
    
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
