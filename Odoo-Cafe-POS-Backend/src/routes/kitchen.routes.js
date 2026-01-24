const express = require('express');
const kitchenController = require('../controllers/kitchen.controller');

const router = express.Router();

// GET /api/kitchen/orders - Get active orders (CREATED, IN_PROGRESS)
router.get('/orders', kitchenController.getActiveOrders);

// GET /api/kitchen/ready - Get ready orders for serving
router.get('/ready', kitchenController.getReadyOrders);

// PATCH /api/kitchen/orders/:id/status - Update order status
router.patch('/orders/:id/status', kitchenController.updateOrderStatus);

// POST /api/kitchen/orders/:id/start - Start cooking (CREATED -> IN_PROGRESS)
router.post('/orders/:id/start', kitchenController.startOrder);

// POST /api/kitchen/orders/:id/ready - Mark as ready (IN_PROGRESS -> READY)
router.post('/orders/:id/ready', kitchenController.markOrderReady);

module.exports = router;
