const express = require('express');
const authRoutes = require('./auth.routes');

// Dev A routes (uncomment when ready)
const branchRoutes = require('./branch.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const floorRoutes = require('./floor.routes');
const tableRoutes = require('./table.routes');
const kitchenRoutes = require('./kitchen.routes');
const reportRoutes = require('./report.routes');

// Dev B routes (uncomment when ready)
// const sessionRoutes = require('./session.routes');
// const orderRoutes = require('./order.routes');
// const paymentRoutes = require('./payment.routes');

const router = express.Router();

// Auth
router.use('/auth', authRoutes);

// Dev A: Master Data
router.use('/branches', branchRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/floors', floorRoutes);
router.use('/tables', tableRoutes);
router.use('/kitchen', kitchenRoutes);
router.use('/reports', reportRoutes);

// Dev B: Orders & Payments
// router.use('/sessions', sessionRoutes);
// router.use('/orders', orderRoutes);
// router.use('/payments', paymentRoutes);

module.exports = router;
