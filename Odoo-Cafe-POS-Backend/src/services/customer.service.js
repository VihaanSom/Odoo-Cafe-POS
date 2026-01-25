const prisma = require('../config/prisma');

/**
 * Create a new customer
 */
const createCustomer = async ({ name, email, phone, address }) => {
    return prisma.customer.create({
        data: {
            name,
            email,
            phone,
            address,
            totalSales: 0
        }
    });
};

/**
 * Get all customers
 */
const getAllCustomers = async (query = {}) => {
    const { name, phone, email } = query;
    const where = {};

    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (phone) where.phone = { contains: phone };
    if (email) where.email = { contains: email, mode: 'insensitive' };

    return prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * Get customer by ID
 */
const getCustomerById = async (id) => {
    return prisma.customer.findUnique({
        where: { id },
        include: { orders: true }
    });
};

/**
 * Update customer
 */
const updateCustomer = async (id, data) => {
    return prisma.customer.update({
        where: { id },
        data
    });
};

/**
 * Delete customer
 */
const deleteCustomer = async (id) => {
    return prisma.customer.delete({
        where: { id }
    });
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
};
