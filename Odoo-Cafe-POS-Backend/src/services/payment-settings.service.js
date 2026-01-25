const prisma = require('../config/prisma');

/**
 * Get or create payment settings for a terminal
 */
const getTerminalSettings = async (terminalId) => {
    let settings = await prisma.paymentSettings.findUnique({
        where: { terminalId }
    });

    if (!settings) {
        // Create default settings if they don't exist
        settings = await prisma.paymentSettings.create({
            data: {
                terminalId,
                useCash: true,
                useDigital: true,
                useUpi: false,
                upiId: ''
            }
        });
    }

    return settings;
};

/**
 * Update payment settings for a terminal
 */
const updateTerminalSettings = async (terminalId, data) => {
    return await prisma.paymentSettings.upsert({
        where: { terminalId },
        update: {
            useCash: data.useCash,
            useDigital: data.useDigital,
            useUpi: data.useUpi,
            upiId: data.upiId,
            upiName: data.upiName,
            merchantCode: data.merchantCode
        },
        create: {
            terminalId,
            useCash: data.useCash ?? true,
            useDigital: data.useDigital ?? true,
            useUpi: data.useUpi ?? false,
            upiId: data.upiId || ''
        }
    });
};

module.exports = {
    getTerminalSettings,
    updateTerminalSettings
};
