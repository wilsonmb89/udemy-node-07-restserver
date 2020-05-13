require('./config/config');
const server = require('./server/server');

server.startServer(process.env.PORT);