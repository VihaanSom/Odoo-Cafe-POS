const express = require('express');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

// POST /api/categories - Create category
router.post('/', categoryController.create);

// GET /api/categories - Get all categories (optional ?branchId filter)
router.get('/', categoryController.getAll);

// GET /api/categories/:id - Get category by ID
router.get('/:id', categoryController.getById);

// PUT /api/categories/:id - Update category
router.put('/:id', categoryController.update);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', categoryController.remove);

module.exports = router;
