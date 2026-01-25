const dashboardService = require('../services/dashboard.service');

const getStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const stats = await dashboardService.getDashboardStats(userId);
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStats
};
