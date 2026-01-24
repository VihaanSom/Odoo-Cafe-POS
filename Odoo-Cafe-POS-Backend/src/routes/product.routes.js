const express = require('express');
const productController = require('../controllers/product.controller');

const router = express.Router();

// POST /api/products - Create product
router.post('/', productController.create);

// GET /api/products - Get all products (optional ?branchId, ?categoryId, ?isActive filters)
router.get('/', productController.getAll);

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getById);

// PUT /api/products/:id - Update product
router.put('/:id', productController.update);

// DELETE /api/products/:id - Delete product
router.delete('/:id', productController.remove);

module.exports = router;
