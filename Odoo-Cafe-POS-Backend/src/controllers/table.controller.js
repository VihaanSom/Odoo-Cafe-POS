const tableService = require('../services/table.service');
const { TABLE_STATUS } = require('../utils/constants');


/**
 * Create table
 * POST /api/tables
 */
const create = async (req, res, next) => {
    try {
        const { floorId, tableNumber } = req.body;

        if (!floorId) {
            return res.status(400).json({ message: 'Floor ID is required' });
        }
        if (tableNumber === undefined || tableNumber === null) {
            return res.status(400).json({ message: 'Table number is required' });
        }

        const table = await tableService.createTable({ floorId, tableNumber });
        res.status(201).json(table);
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(404).json({ message: 'Floor not found' });
        }
        next(error);
    }
};

/**
 * Get all tables
 * GET /api/tables?floorId=xxx
 */
const getAll = async (req, res, next) => {
    try {
        const { floorId } = req.query;
        const tables = await tableService.getAllTables(floorId);
        res.json(tables);
    } catch (error) {
        next(error);
    }
};

/**
 * Get table by ID
 * GET /api/tables/:id
 */
const getById = async (req, res, next) => {
    try {
        const table = await tableService.getTableById(req.params.id);

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        res.json(table);
    } catch (error) {
        if (error.code === 'P2023') {
            return res.status(404).json({ message: 'Table not found' });
        }
        next(error);
    }
};

/**
 * Update table
 * PUT /api/tables/:id
 */
const update = async (req, res, next) => {
    try {
        const existing = await tableService.getTableById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const { tableNumber, status } = req.body;

        // Validate status if provided
        if (status && !Object.values(TABLE_STATUS).includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${Object.values(TABLE_STATUS).join(', ')}`
            });
        }

        const table = await tableService.updateTable(req.params.id, { tableNumber, status });
        res.json(table);
    } catch (error) {
        if (error.code === 'P2023' || error.code === 'P2025') {
            return res.status(404).json({ message: 'Table not found' });
        }
        next(error);
    }
};



/**
 * Update table status only
 * PATCH /api/tables/:id/status
 */
const updateStatus = async (req, res, next) => {
    try {
        const existing = await tableService.getTableById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const { status } = req.body;

        if (!status || !Object.values(TABLE_STATUS).includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${Object.values(TABLE_STATUS).join(', ')}`
            });
        }

        const table = await tableService.updateTableStatus(req.params.id, status);

        // Emit Socket Event
        try {
            const io = socketUtil.getIO();
            io.emit('table:updated', table);
        } catch (e) {
            console.error('Socket emit error:', e);
        }

        res.json(table);
    } catch (error) {
        if (error.code === 'P2023' || error.code === 'P2025') {
            return res.status(404).json({ message: 'Table not found' });
        }
        next(error);
    }
};

/**
 * Delete table
 * DELETE /api/tables/:id
 */
const remove = async (req, res, next) => {
    try {
        const existing = await tableService.getTableById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Table not found' });
        }

        await tableService.deleteTable(req.params.id);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2023' || error.code === 'P2025') {
            return res.status(404).json({ message: 'Table not found' });
        }
        next(error);
    }
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    updateStatus,
    remove,
};
