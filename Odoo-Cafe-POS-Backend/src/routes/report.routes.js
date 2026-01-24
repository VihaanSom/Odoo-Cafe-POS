const express = require('express');
const reportController = require('../controllers/report.controller');

const router = express.Router();

// GET /api/reports/daily-sales - Get today's sales summary
router.get('/daily-sales', reportController.getDailySales);

// GET /api/reports/sales-range - Get sales for date range
router.get('/sales-range', reportController.getSalesByRange);

// GET /api/reports/top-products - Get top selling products
router.get('/top-products', reportController.getTopProducts);

// GET /api/reports/orders-by-status - Get order count by status
router.get('/orders-by-status', reportController.getOrdersByStatus);

// GET /api/reports/hourly-sales - Get hourly sales breakdown
router.get('/hourly-sales', reportController.getHourlySales);

module.exports = router;
