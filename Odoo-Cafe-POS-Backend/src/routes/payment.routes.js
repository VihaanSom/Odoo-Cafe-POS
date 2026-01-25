const express = require('express');
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

// Process Payment
router.post('/', paymentController.processPayment);

// Get All Payments
router.get('/', paymentController.getAll);

// Generate Receipt
router.post('/orders/:id/receipt', paymentController.generateReceipt);

module.exports = router;
