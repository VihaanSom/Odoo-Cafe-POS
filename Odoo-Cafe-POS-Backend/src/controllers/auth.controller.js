const authService = require('../services/auth.service');

const signup = async (req, res, next) => {
    try {
        const { user, token } = await authService.signup(req.body);
        res.status(201).json({ user, token });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.login(email, password);
        res.json({ user, token });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await authService.getMe(req.user.id);
        res.json({ user });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    signup,
    login,
    getMe
};
