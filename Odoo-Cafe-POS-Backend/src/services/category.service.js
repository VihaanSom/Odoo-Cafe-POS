const prisma = require('../config/prisma');

/**
 * Create a new category
 */
const createCategory = async ({ branchId, name }) => {
    return prisma.category.create({
        data: { branchId, name }
    });
};

/**
 * Get all categories (optionally filter by branch)
 */
const getAllCategories = async (branchId) => {
    const where = branchId ? { branchId } : {};
    return prisma.category.findMany({
        where,
        include: { branch: true },
        orderBy: { name: 'asc' }
    });
};

/**
 * Get category by ID
 */
const getCategoryById = async (id) => {
    return prisma.category.findUnique({
        where: { id },
        include: { branch: true }
    });
};

/**
 * Update category
 */
const updateCategory = async (id, { name }) => {
    return prisma.category.update({
        where: { id },
        data: { name }
    });
};

/**
 * Delete category
 */
const deleteCategory = async (id) => {
    return prisma.category.delete({
        where: { id }
    });
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
