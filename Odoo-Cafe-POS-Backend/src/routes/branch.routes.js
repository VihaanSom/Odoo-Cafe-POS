const express = require('express');
const branchController = require('../controllers/branch.controller');

const router = express.Router();

// POST /api/branches - Create branch
router.post('/', branchController.create);

// GET /api/branches - Get all branches
router.get('/', branchController.getAll);

// GET /api/branches/:id - Get branch by ID
router.get('/:id', branchController.getById);

// PUT /api/branches/:id - Update branch
router.put('/:id', branchController.update);

// DELETE /api/branches/:id - Delete branch
router.delete('/:id', branchController.remove);

module.exports = router;
