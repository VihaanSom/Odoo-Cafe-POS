const express = require('express');
const terminalController = require('../controllers/terminal.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Terminals require auth
router.use(authMiddleware);

router.post('/', terminalController.createTerminal);
router.get('/', terminalController.getAllTerminals);
router.get('/:id', terminalController.getTerminalById);

module.exports = router;
