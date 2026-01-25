let io = null;

module.exports = {
    /**
     * Initialize Socket.IO
     */
    init: (httpServer) => {
        // Import socket.io here to avoid require issues if not installed yet
        const { Server } = require('socket.io');

        io = new Server(httpServer, {
            cors: {
                origin: '*', // Configure this appropriately for production
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            },
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        return io;
    },

    /**
     * Get IO instance
     */
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    },
};
