const app = require('./app');
const config = require('./config/env');
const socketUtil = require('./utils/socket');

const PORT = config.port;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.IO
socketUtil.init(server);
