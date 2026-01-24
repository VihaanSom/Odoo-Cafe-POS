const productService = require('../services/product.service');

/**
 * Create product
 * POST /api/products
 */
const create = async (req, res, next) => {
    try {
        const { branchId, categoryId, name, price } = req.body;
        
        if (!branchId) {
            return res.status(400).json({ message: 'Branch ID is required' });
        }
        if (!name) {
            return res.status(400).json({ message: 'Product name is required' });
        }
        if (price === undefined || price === null) {
            return res.status(400).json({ message: 'Product price is required' });
        }
        
        const product = await productService.createProduct({ branchId, categoryId, name, price });
        res.status(201).json(product);
    } catch (error) {
        // Handle Prisma foreign key error (invalid branchId or categoryId)
        if (error.code === 'P2003') {
            return res.status(404).json({ message: 'Branch or Category not found' });
        }
        next(error);
    }
};

/**
 * Get all products
 * GET /api/products?branchId=xxx&categoryId=xxx&isActive=true
 */
const getAll = async (req, res, next) => {
    try {
        const { branchId, categoryId, isActive } = req.query;
        const products = await productService.getAllProducts({ branchId, categoryId, isActive });
        res.json(products);
    } catch (error) {
        next(error);
    }
};

/**
 * Get product by ID
 * GET /api/products/:id
 */
const getById = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        if (error.code === 'P2023') {
            return res.status(404).json({ message: 'Product not found' });
        }
        next(error);
    }
};

/**
 * Update product
 * PUT /api/products/:id
 */
const update = async (req, res, next) => {
    try {
        const existing = await productService.getProductById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const { name, price, categoryId, isActive } = req.body;
        const product = await productService.updateProduct(req.params.id, { name, price, categoryId, isActive });
        res.json(product);
    } catch (error) {
        if (error.code === 'P2023' || error.code === 'P2025') {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (error.code === 'P2003') {
            return res.status(404).json({ message: 'Category not found' });
        }
        next(error);
    }
};

/**
 * Delete product
 * DELETE /api/products/:id
 */
const remove = async (req, res, next) => {
    try {
        const existing = await productService.getProductById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        await productService.deleteProduct(req.params.id);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2023' || error.code === 'P2025') {
            return res.status(404).json({ message: 'Product not found' });
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
