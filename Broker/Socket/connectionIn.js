const WebSocket = require('ws');
const receive = require('./receiveMessage');
const close = require('./closeConnection');
const open = require('./openConnection');
const enums = require('./enums');

// Connections from other instances
function connectionIn (fastify){
    const wss = new WebSocket.Server({ server: fastify.server });
    // WebSocket-Verbindungshandler
    wss.on('connection', (ws, req) => {
        Object.defineProperty(ws, 'clientAddress', {
            value: ws._socket.remoteAddress + ':' + ws._socket.remotePort,
            writable: true
        });
        open(fastify, ws, enums.connectionTypes.BROKER);

        ws.on('message', (message) => {
            receive(fastify, message, ws);
        });

        ws.on('close', () => {
            close(fastify, ws);
        });
    });
}
module.exports = connectionIn;