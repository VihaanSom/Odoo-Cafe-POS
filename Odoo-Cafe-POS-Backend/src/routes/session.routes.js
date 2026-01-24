const express = require('express');
const sessionController = require('../controllers/session.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// All session routes require authentication
router.use(authMiddleware);

// Open a new session
router.post('/open', sessionController.openSession);

// Get all active sessions
router.get('/active', sessionController.getActiveSessions);

// Get current session for a terminal
router.get('/current', sessionController.getCurrentSession);

// Get session by ID
router.get('/:id', sessionController.getSessionById);

// Close a session
router.post('/:id/close', sessionController.closeSession);

module.exports = router;
