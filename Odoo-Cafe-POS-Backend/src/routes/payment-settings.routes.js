const express = require('express');
const paymentSettingsController = require('../controllers/payment-settings.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Required auth for all settings routes
router.use(authMiddleware);

router.get('/terminal/:terminalId', paymentSettingsController.getByTerminalId);
router.put('/terminal/:terminalId', paymentSettingsController.update);

module.exports = router;
