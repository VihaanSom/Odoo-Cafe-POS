const paymentService = require('../services/payment.service');

const processPayment = async (req, res, next) => {
    try {
        const payment = await paymentService.processPayment(req.body);
        res.status(201).json({ payment });
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
    processPayment,
    generateReceipt
};
