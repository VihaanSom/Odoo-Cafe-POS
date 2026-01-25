const customerService = require('../services/customer.service');

/**
 * Create customer
 * POST /api/customers
 */
const create = async (req, res, next) => {
    try {
        const { name, email, phone, address } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Customer name is required' });
        }

        const customer = await customerService.createCustomer({
            name,
            email,
            phone,
            address
        });
        res.status(201).json(customer);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Email or phone already exists' });
        }
        next(error);
    }
};

/**
 * Get all customers
 * GET /api/customers
 */
const getAll = async (req, res, next) => {
    try {
        const { name, phone, email } = req.query;
        const customers = await customerService.getAllCustomers({ name, phone, email });
        res.json(customers);
    } catch (error) {
        next(error);
    }
};

/**
 * Get customer by ID
 * GET /api/customers/:id
 */
const getById = async (req, res, next) => {
    try {
        const customer = await customerService.getCustomerById(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json(customer);
    } catch (error) {
        if (error.code === 'P2023') {
            return res.status(404).json({ message: 'Customer not found' });
        }
        next(error);
    }
};

/**
 * Update customer
 * PUT /api/customers/:id
 */
const update = async (req, res, next) => {
    try {
        const existing = await customerService.getCustomerById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const { name, email, phone, address, totalSales } = req.body;
        const customer = await customerService.updateCustomer(req.params.id, {
            name,
            email,
            phone,
            address,
            totalSales
        });
        res.json(customer);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Email or phone already exists' });
        }
        if (error.code === 'P2023' || error.code === 'P2025') {
            return res.status(404).json({ message: 'Customer not found' });
        }
        next(error);
    }
};

/**
 * Delete customer
 * DELETE /api/customers/:id
 */
const remove = async (req, res, next) => {
    try {
        const existing = await customerService.getCustomerById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await customerService.deleteCustomer(req.params.id);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2023' || error.code === 'P2025') {
            return res.status(404).json({ message: 'Customer not found' });
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
