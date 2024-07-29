const WebSocket = require('ws');
const close = require('./closeConnection');
const open = require('./openConnection');
const receive = require('./receiveMessage');
const send = require('./SendMessage');
const enums = require('./enums');

// Connections to other instances
function connectionOut(fastify, url, type = enums.connectionTypes.BROKER) {
    const ws = new WebSocket(url);
    Object.defineProperty(ws, 'clientAddress', {
        value: url,
        writable: true
    });

    ws.on('open', () => {
        open(fastify, ws, type);
    });

    ws.on('message', (message) => {
        receive(fastify, message, ws);
    });

    ws.on('close', () => {
        close(fastify, ws);
    });

    ws.on('error', (err) => {
        fastify.log.error(err);
    });
}
module.exports = connectionOut;