const WebSocket = require('ws');
const connectionStorage = require('./connectionStorage');
const receiveMessage = require('./receiveMessage');

// Connections from other instances
function connectionIn (fastify){
    const wss = new WebSocket.Server({ server: fastify.server });
    // WebSocket-Verbindungshandler
    wss.on('connection', (ws, req) => {
        connectionStorage.setConnection(ws);

        ws.on('message', (message) => {
            receiveMessage(fastify, message);
        });

        ws.on('close', () => {
            connectionStorage.removeConnection();
        });
    });
}
module.exports = connectionIn;