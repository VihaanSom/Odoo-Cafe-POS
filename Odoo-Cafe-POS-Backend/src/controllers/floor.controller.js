const floorService = require('../services/floor.service');

/**
 * Create floor
 * POST /api/floors
 */
const create = async (req, res, next) => {
    try {
        const { branchId, name } = req.body;
        
        if (!branchId) {
            return res.status(400).json({ message: 'Branch ID is required' });
        }
        if (!name) {
            return res.status(400).json({ message: 'Floor name is required' });
        }
        
        const floor = await floorService.createFloor({ branchId, name });
        res.status(201).json(floor);
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(404).json({ message: 'Branch not found' });
        }
        next(error);
    }
};

/**
 * Get all floors
 * GET /api/floors?branchId=xxx
 */
const getAll = async (req, res, next) => {
    try {
        const { branchId } = req.query;
        const floors = await floorService.getAllFloors(branchId);
        res.json(floors);
    } catch (error) {
        next(error);
    }
};

/**
 * Get floor by ID
 * GET /api/floors/:id
 */
const getById = async (req, res, next) => {
    try {
        const floor = await floorService.getFloorById(req.params.id);
        
        if (!floor) {
            return res.status(404).json({ message: 'Floor not found' });
        }
        
        res.json(floor);
    } catch (error) {
        if (error.code === 'P2023') {
            return res.status(404).json({ message: 'Floor not found' });
        }
        next(error);
    }
};

/**
 * Get floor layout for a branch
 * GET /api/floors/:branchId/layout
 */
const getLayout = async (req, res, next) => {
    try {
        const layout = await floorService.getFloorLayout(req.params.branchId);
        res.json(layout);
    } catch (error) {
        if (error.code === 'P2023') {
            return res.status(404).json({ message: 'Branch not found' });
        }
        next(error);
    }
};

/**
 * Update floor
 * PUT /api/floors/:id
 */
const update = async (req, res, next) => {
    try {
        const existing = await floorService.getFloorById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Floor not found' });
        }
        
        const { name } = req.body;
        const floor = await floorService.updateFloor(req.params.id, { name });
        res.json(floor);
    } catch (error) {
        if (error.code === 'P2023' || error.code === 'P2025') {
            return res.status(404).json({ message: 'Floor not found' });
        }
        next(error);
    }
};

/**
 * Delete floor
 * DELETE /api/floors/:id
 */
const remove = async (req, res, next) => {
    try {
        const existing = await floorService.getFloorById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Floor not found' });
        }
        
        await floorService.deleteFloor(req.params.id);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2023' || error.code === 'P2025') {
            return res.status(404).json({ message: 'Floor not found' });
        }
        next(error);
    }
};

module.exports = {
    create,
    getAll,
    getById,
    getLayout,
    update,
    remove,
};
