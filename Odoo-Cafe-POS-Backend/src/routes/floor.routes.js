const express = require('express');
const floorController = require('../controllers/floor.controller');

const router = express.Router();

// POST /api/floors - Create floor
router.post('/', floorController.create);

// GET /api/floors - Get all floors (optional ?branchId filter)
router.get('/', floorController.getAll);

// GET /api/floors/:branchId/layout - Get floor layout with tables
router.get('/:branchId/layout', floorController.getLayout);

// GET /api/floors/:id - Get floor by ID
router.get('/:id', floorController.getById);

// PUT /api/floors/:id - Update floor
router.put('/:id', floorController.update);

// DELETE /api/floors/:id - Delete floor
router.delete('/:id', floorController.remove);

module.exports = router;
