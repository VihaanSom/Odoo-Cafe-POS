const branchService = require('../services/branch.service');

/**
 * Create branch
 * POST /api/branches
 */
const create = async (req, res, next) => {
    try {
        const { name, address } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Branch name is required' });
        }
        
        const branch = await branchService.createBranch({ name, address });
        res.status(201).json(branch);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all branches
 * GET /api/branches
 */
const getAll = async (req, res, next) => {
    try {
        const branches = await branchService.getAllBranches();
        res.json(branches);
    } catch (error) {
        next(error);
    }
};

/**
 * Get branch by ID
 * GET /api/branches/:id
 */
const getById = async (req, res, next) => {
    try {
        const branch = await branchService.getBranchById(req.params.id);
        
        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' });
        }
        
        res.json(branch);
    } catch (error) {
        // Handle Prisma invalid UUID error
        if (error.code === 'P2023') {
            return res.status(404).json({ message: 'Branch not found' });
        }
        next(error);
    }
};

/**
 * Update branch
 * PUT /api/branches/:id
 */
const update = async (req, res, next) => {
    try {
        // Check if branch exists first
        const existing = await branchService.getBranchById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Branch not found' });
        }
        
        const { name, address } = req.body;
        const branch = await branchService.updateBranch(req.params.id, { name, address });
        res.json(branch);
    } catch (error) {
        // Handle Prisma invalid UUID or not found errors
        if (error.code === 'P2023' || error.code === 'P2025') {
            return res.status(404).json({ message: 'Branch not found' });
        }
        next(error);
    }
};

/**
 * Delete branch
 * DELETE /api/branches/:id
 */
const remove = async (req, res, next) => {
    try {
        // Check if branch exists first
        const existing = await branchService.getBranchById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Branch not found' });
        }
        
        await branchService.deleteBranch(req.params.id);
        res.status(204).send();
    } catch (error) {
        // Handle Prisma invalid UUID or not found errors
        if (error.code === 'P2023' || error.code === 'P2025') {
            return res.status(404).json({ message: 'Branch not found' });
        }
        next(error);
    }
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    remove,
};

