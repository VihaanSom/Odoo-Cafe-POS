const express = require('express');
const tableController = require('../controllers/table.controller');

const router = express.Router();

// POST /api/tables - Create table
router.post('/', tableController.create);

// GET /api/tables - Get all tables (optional ?floorId filter)
router.get('/', tableController.getAll);

// GET /api/tables/:id - Get table by ID
router.get('/:id', tableController.getById);

// PUT /api/tables/:id - Update table
router.put('/:id', tableController.update);

// PATCH /api/tables/:id/status - Update table status only
router.patch('/:id/status', tableController.updateStatus);

// DELETE /api/tables/:id - Delete table
router.delete('/:id', tableController.remove);

module.exports = router;
