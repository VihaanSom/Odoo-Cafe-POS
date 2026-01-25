const paymentSettingsService = require('../services/payment-settings.service');

/**
 * GET /api/payment-settings/terminal/:terminalId
 */
const getByTerminalId = async (req, res, next) => {
    try {
        const { terminalId } = req.params;
        const settings = await paymentSettingsService.getTerminalSettings(terminalId);
        res.json(settings);
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/payment-settings/terminal/:terminalId
 */
const update = async (req, res, next) => {
    try {
        const { terminalId } = req.params;
        const settings = await paymentSettingsService.updateTerminalSettings(terminalId, req.body);
        res.json(settings);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getByTerminalId,
    update
};
