const prisma = require('../config/prisma');
const passwordUtils = require('../utils/password');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { MESSAGES } = require('../utils/constants');

const signup = async (data) => {
    const { name, email, password } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        const error = new Error(MESSAGES.USER_ALREADY_EXISTS);
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await passwordUtils.hashPassword(password);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '24h' });

    return { user: userWithoutPassword, token };
};

const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        const error = new Error(MESSAGES.USER_NOT_FOUND);
        error.statusCode = 401;
        throw error;
    }

    const isValidPassword = await passwordUtils.comparePassword(password, user.password);
    if (!isValidPassword) {
        const error = new Error(MESSAGES.INVALID_PASSWORD);
        error.statusCode = 401;
        throw error;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '24h' });

    return { user: userWithoutPassword, token };
};

const getMe = async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        const error = new Error(MESSAGES.USER_NOT_FOUND);
        error.statusCode = 404;
        throw error;
    };
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

module.exports = {
    signup,
    login,
    getMe
};
