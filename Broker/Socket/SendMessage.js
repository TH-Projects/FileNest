const WebSocket = require('ws');
const getConnections = require('../Queue/getConnections');
const enums = require('../Queue/enums');
const removeMessage = require('../Queue/removeMessage');
const logger = require('../logger');

// Sends a message to all connected clients
const sendMessage = (fastify, message, wsList, publish = false) => {
    wsList.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(message));
                logger.info('sendMessage', `Message sent to ${ws.clientAddress}`);
                if(publish){
                    remove(fastify, ws.clientAddress);
                }
            }
            catch (e) {
                logger.error('sendMessage', `Failed to send message to ${ws.clientAddress}`, e);
            }
        }
        else {
            logger.warn('sendMessage', `Client not connected: ${ws.clientAddress}`);
        }
    });
}

// remove messages between brokers
const remove = (fastify, clientAddress) => {
    removeMessage(clientAddress);
    sendMessage(
        fastify,
        {syncOperation: enums.syncOperation.REMOVE, client: clientAddress},
        getConnections());
}

module.exports = sendMessage;