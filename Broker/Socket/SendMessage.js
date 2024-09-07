const WebSocket = require('ws');
const getConnections = require('../Queue/getConnections');
const enums = require('../Queue/enums');
const removeMessage = require('../Queue/removeMessage');

// Sends a message to all connected clients
function sendMessage (fastify, message, wsList, publish = false) {
    wsList.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(message));
                console.log('Message sent to ' + ws.clientAddress + ': ' + JSON.stringify(message));
                if(publish){
                    remove(fastify, ws.clientAddress);
                }
            }
            catch (e) {
                console.log('Error sending message to ' + ws.clientAddress + ': ' + e);
            }
        }
        else {
            console.log('Client not connected');
        }
    });
}

// remove messages between brokers
function remove(fastify, clientAddress) {
    removeMessage(clientAddress);
    sendMessage(
        fastify,
        {syncOperation: enums.syncOperation.REMOVE, client: clientAddress},
        getConnections());
}

module.exports = sendMessage;