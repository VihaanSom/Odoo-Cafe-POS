const prisma = require('../config/prisma');

/**
 * Create a new product
 */
const createProduct = async ({ branchId, categoryId, name, price }) => {
    return prisma.product.create({
        data: { 
            branchId, 
            categoryId, 
            name, 
            price,
            isActive: true 
        },
        include: { category: true, branch: true }
    });
};

/**
 * Get all products (optionally filter by branch and/or category)
 */
const getAllProducts = async ({ branchId, categoryId, isActive }) => {
    const where = {};
    if (branchId) where.branchId = branchId;
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    return prisma.product.findMany({
        where,
        include: { category: true, branch: true },
        orderBy: { name: 'asc' }
    });
};

/**
 * Get product by ID
 */
const getProductById = async (id) => {
    return prisma.product.findUnique({
        where: { id },
        include: { category: true, branch: true }
    });
};

/**
 * Update product
 */
const updateProduct = async (id, { name, price, categoryId, isActive }) => {
    const data = {};
    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = price;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (isActive !== undefined) data.isActive = isActive;
    
    return prisma.product.update({
        where: { id },
        data,
        include: { category: true, branch: true }
    });
};

/**
 * Delete product
 */
const deleteProduct = async (id) => {
    return prisma.product.delete({
        where: { id }
    });
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};
