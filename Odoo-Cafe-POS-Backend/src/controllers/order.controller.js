const orderService = require('../services/order.service');
const paymentService = require('../services/payment.service');

const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id; // From auth middleware
        // Helper: if frontend sends "items" in body, service handles it now
        const orderData = req.body || {};
        const order = await orderService.createOrder(orderData, userId);
        res.status(201).json({ order });
    } catch (error) {
        next(error);
    }
};

const addOrderItems = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { items } = req.body; // Expecting array: [{ productId, quantity }]

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Items array is required' });
        }

        const result = await orderService.addOrderItems(id, items);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const sendToKitchen = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await orderService.sendToKitchen(id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await orderService.getOrderById(id);
        res.json({ order });
    } catch (error) {
        next(error);
    }
};

const getActiveOrderByTable = async (req, res, next) => {
    try {
        const { tableId } = req.params;
        const order = await orderService.getActiveOrderByTable(tableId);

        if (!order) {
            return res.status(404).json({ message: 'No active order found for this table' });
        }

        res.json({ order });
    } catch (error) {
        next(error);
    }
};

const generateReceipt = async (req, res, next) => {
    try {
        const { id } = req.params;
        const receipt = await paymentService.generateReceipt(id);
        res.json({ receipt });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    addOrderItems,
    sendToKitchen,
    getOrderById,
    getActiveOrderByTable,
    generateReceipt
};
