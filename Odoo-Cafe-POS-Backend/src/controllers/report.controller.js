const reportService = require('../services/report.service');

/**
 * Get daily sales
 * GET /api/reports/daily-sales?branchId=xxx&date=2026-01-24
 */
const getDailySales = async (req, res, next) => {
    try {
        const { branchId, date } = req.query;
        const report = await reportService.getDailySales(branchId, date);
        res.json(report);
    } catch (error) {
        next(error);
    }
};

/**
 * Get sales by date range
 * GET /api/reports/sales-range?branchId=xxx&startDate=2026-01-01&endDate=2026-01-31
 */
const getSalesByRange = async (req, res, next) => {
    try {
        const { branchId, startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }
        
        const report = await reportService.getSalesByRange(branchId, startDate, endDate);
        res.json(report);
    } catch (error) {
        next(error);
    }
};

/**
 * Get top selling products
 * GET /api/reports/top-products?branchId=xxx&limit=10
 */
const getTopProducts = async (req, res, next) => {
    try {
        const { branchId, limit } = req.query;
        const products = await reportService.getTopProducts(branchId, parseInt(limit) || 10);
        res.json(products);
    } catch (error) {
        next(error);
    }
};

/**
 * Get order count by status
 * GET /api/reports/orders-by-status?branchId=xxx
 */
const getOrdersByStatus = async (req, res, next) => {
    try {
        const { branchId } = req.query;
        const statusCounts = await reportService.getOrdersByStatus(branchId);
        res.json(statusCounts);
    } catch (error) {
        next(error);
    }
};

/**
 * Get hourly sales breakdown
 * GET /api/reports/hourly-sales?branchId=xxx&date=2026-01-24
 */
const getHourlySales = async (req, res, next) => {
    try {
        const { branchId, date } = req.query;
        const hourlyData = await reportService.getHourlySales(branchId, date);
        res.json(hourlyData);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDailySales,
    getSalesByRange,
    getTopProducts,
    getOrdersByStatus,
    getHourlySales,
};
