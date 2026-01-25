const express = require('express');
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Orders require auth
router.use(authMiddleware);

// Create new order (can include initial items)
router.post('/', orderController.createOrder);

// Get all orders
router.get('/', orderController.getAllOrders);

// Get active order for table (View Bill) - MUST be before /:id
router.get('/table/:tableId/active', orderController.getActiveOrderByTable);

// Get order details
router.get('/:id', orderController.getOrderById);

// Add items to order (Batch)
router.post('/:id/items', orderController.addOrderItems);

// Send to kitchen (Notification only)
router.post('/:id/send', orderController.sendToKitchen);

// Generate Receipt
router.post('/:id/receipt', orderController.generateReceipt);

module.exports = router;
