const sessionService = require('../services/session.service');

/**
 * POST /api/sessions/open
 * Open a new POS session
 */
const openSession = async (req, res, next) => {
    try {
        const { terminalId } = req.body;

        if (!terminalId) {
            return res.status(400).json({ message: 'Terminal ID is required' });
        }

        const session = await sessionService.openSession(terminalId, req.user.id);
        res.status(201).json({ session });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/sessions/:id/close
 * Close an existing POS session
 */
const closeSession = async (req, res, next) => {
    try {
        const { id } = req.params;
        const session = await sessionService.closeSession(id);
        res.json({ session });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/sessions/:id
 * Get session by ID
 */
const getSessionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const session = await sessionService.getSessionById(id);
        res.json({ session });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/sessions/active
 * Get all active sessions
 */
const getActiveSessions = async (req, res, next) => {
    try {
        const sessions = await sessionService.getActiveSessions();
        res.json({ sessions });
    } catch (error) {
        next(error);
    }
};
/**
 * GET /api/sessions/current
 * Get current active session for a terminal
 */
const getCurrentSession = async (req, res, next) => {
    try {
        const { terminalId } = req.query;

        if (!terminalId) {
            return res.status(400).json({ message: 'Terminal ID is required' });
        }

        const session = await sessionService.getCurrentSession(terminalId);

        if (!session) {
            return res.status(404).json({ message: 'No active session found for this terminal' });
        }

        res.json({ session });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    openSession,
    closeSession,
    getSessionById,
    getActiveSessions,
    getCurrentSession
};
