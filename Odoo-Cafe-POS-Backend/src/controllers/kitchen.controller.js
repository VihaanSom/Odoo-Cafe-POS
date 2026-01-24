const kitchenService = require('../services/kitchen.service');
const { ORDER_STATUS } = require('../utils/constants');

/**
 * Get active orders for Kitchen Display
 * GET /api/kitchen/orders
 */
const getActiveOrders = async (req, res, next) => {
    try {
        const { branchId } = req.query;
        const orders = await kitchenService.getActiveOrders(branchId);
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

/**
 * Get ready orders (for serving staff)
 * GET /api/kitchen/ready
 */
const getReadyOrders = async (req, res, next) => {
    try {
        const { branchId } = req.query;
        const orders = await kitchenService.getReadyOrders(branchId);
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

/**
 * Update order status
 * PATCH /api/kitchen/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        
        // Validate status value
        if (!Object.values(ORDER_STATUS).includes(status)) {
            return res.status(400).json({ 
                message: `Invalid status. Must be one of: ${Object.values(ORDER_STATUS).join(', ')}` 
            });
        }
        
        const order = await kitchenService.updateOrderStatus(req.params.id, status);
        res.json(order);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error.code === 'P2023') {
            return res.status(404).json({ message: 'Order not found' });
        }
        next(error);
    }
};

/**
 * Start cooking an order
 * POST /api/kitchen/orders/:id/start
 */
const startOrder = async (req, res, next) => {
    try {
        const order = await kitchenService.startOrder(req.params.id);
        res.json(order);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error.code === 'P2023') {
            return res.status(404).json({ message: 'Order not found' });
        }
        next(error);
    }
};

/**
 * Mark order as ready
 * POST /api/kitchen/orders/:id/ready
 */
const markOrderReady = async (req, res, next) => {
    try {
        const order = await kitchenService.markOrderReady(req.params.id);
        res.json(order);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error.code === 'P2023') {
            return res.status(404).json({ message: 'Order not found' });
        }
        next(error);
    }
};

module.exports = {
    getActiveOrders,
    getReadyOrders,
    updateOrderStatus,
    startOrder,
    markOrderReady,
};
