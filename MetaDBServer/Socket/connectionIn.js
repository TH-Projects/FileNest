const WebSocket = require('ws');
const connectionStorage = require('./connectionStorage');
const receiveMessage = require('./receiveMessage');

// Connections from other instances
const connectionIn = (fastify) =>{
    const wss = new WebSocket.Server({ server: fastify.server });

    // Handle incoming connections
    wss.on('connection', (ws, req) => {
        connectionStorage.setConnection(ws);

        // Handle incoming messages
        ws.on('message', (message) => {
            receiveMessage(fastify, message);
        });

        // Handle closing connections
        ws.on('close', () => {
            connectionStorage.removeConnection();
        });
    });
}
module.exports = connectionIn;