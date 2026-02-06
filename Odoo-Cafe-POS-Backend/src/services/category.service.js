const prisma = require('../config/prisma');

/**
 * Check if category name already exists in a branch
 */
const getCategoryByNameInBranch = async (branchId, name) => {
    return prisma.category.findFirst({
        where: { 
            branchId, 
            name: { equals: name, mode: 'insensitive' } 
        }
    });
};

/**
 * Check if branch exists
 */
const branchExists = async (branchId) => {
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    return !!branch;
};

/**
 * Create a new category
 */
const createCategory = async ({ branchId, name }) => {
    // Check if branch exists
    const exists = await branchExists(branchId);
    if (!exists) {
        const error = new Error('Branch not found');
        error.statusCode = 404;
        throw error;
    }
    
    // Check for duplicate name within branch
    const existing = await getCategoryByNameInBranch(branchId, name);
    if (existing) {
        const error = new Error('Category name already exists in this branch');
        error.statusCode = 409;
        throw error;
    }
    
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
    // Check if category has products
    const productCount = await prisma.product.count({
        where: { categoryId: id }
    });
    
    if (productCount > 0) {
        const error = new Error(
            `Cannot delete category. ${productCount} product(s) are assigned to this category. Please reassign or delete them first.`
        );
        error.statusCode = 400;
        throw error;
    }
    
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
