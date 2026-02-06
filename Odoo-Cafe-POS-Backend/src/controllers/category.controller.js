const categoryService = require('../services/category.service');

/**
 * Create category
 * POST /api/categories
 */
const create = async (req, res, next) => {
    try {
        const { branchId, name } = req.body;
        
        if (!branchId) {
            return res.status(400).json({ message: 'Branch ID is required' });
        }
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        
        const category = await categoryService.createCategory({ branchId, name });
        res.status(201).json(category);
    } catch (error) {
        // Handle custom errors with statusCode (404 for branch not found, 409 for duplicate)
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        // Handle Prisma foreign key error (invalid branchId)
        if (error.code === 'P2003') {
            return res.status(404).json({ message: 'Branch not found' });
        }
        next(error);
    }
};

/**
 * Get all categories
 * GET /api/categories?branchId=xxx
 */
const getAll = async (req, res, next) => {
    try {
        const { branchId } = req.query;
        const categories = await categoryService.getAllCategories(branchId);
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

/**
 * Get category by ID
 * GET /api/categories/:id
 */
const getById = async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        res.json(category);
    } catch (error) {
        if (error.code === 'P2023') {
            return res.status(404).json({ message: 'Category not found' });
        }
        next(error);
    }
};

/**
 * Update category
 * PUT /api/categories/:id
 */
const update = async (req, res, next) => {
    try {
        const existing = await categoryService.getCategoryById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        const { name } = req.body;
        const category = await categoryService.updateCategory(req.params.id, { name });
        res.json(category);
    } catch (error) {
        if (error.code === 'P2023' || error.code === 'P2025') {
            return res.status(404).json({ message: 'Category not found' });
        }
        next(error);
    }
};

/**
 * Delete category
 * DELETE /api/categories/:id
 */
const remove = async (req, res, next) => {
    try {
        const existing = await categoryService.getCategoryById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        await categoryService.deleteCategory(req.params.id);
        res.status(204).send();
    } catch (error) {
        // Handle custom error from service
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        // Handle Prisma errors
        if (error.code === 'P2023' || error.code === 'P2025') {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (error.code === 'P2003') {
            return res.status(400).json({ 
                message: 'Cannot delete category with existing products' 
            });
        }
        next(error);
    }
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    remove,
};
