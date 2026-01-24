const terminalService = require('../services/terminal.service');

const createTerminal = async (req, res, next) => {
    try {
        const terminal = await terminalService.createTerminal(req.body);
        res.status(201).json({ terminal });
    } catch (error) {
        next(error);
    }
};

const getAllTerminals = async (req, res, next) => {
    try {
        const terminals = await terminalService.getAllTerminals();
        res.json({ terminals });
    } catch (error) {
        next(error);
    }
};

const getTerminalById = async (req, res, next) => {
    try {
        const terminal = await terminalService.getTerminalById(req.params.id);
        res.json({ terminal });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTerminal,
    getAllTerminals,
    getTerminalById,
};
