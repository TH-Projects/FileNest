const enums = require('../Queue/enums');
const socketEnums = require('./enums');
const connectionStorage = require('./connectionStorage');
const addMessage = require('../Queue/addMessage');
const removeMessages = require('../Queue/removeMessage');
const logger = require('../logger');

// This function is called up when a message is received.
const receiveMessage = (fastify, jsonMessage, ws) => {
    const message = JSON.stringify(jsonMessage);
    switch (jsonMessage.syncOperation) {
        case enums.syncOperation.ADD:
            addMessage(jsonMessage.messages, jsonMessage.clients);
            break;
        case enums.syncOperation.REMOVE:
            removeMessages(jsonMessage.client);
            break;
        case socketEnums.operation.ADDCONNECTION:
            const connections = Array.isArray(jsonMessage.clients) ? jsonMessage.clients : [jsonMessage.clients]
            for (let connection of connections) {
                if(connection.type !== socketEnums.connectionTypes.BROKER){
                    connectionStorage.addSharedConnection(
                        connection.client,
                        connection.type
                    );
                }
            }
            break;
        case socketEnums.operation.REMOVECONNECTION:
            const connectionsToRemove = Array.isArray(jsonMessage.clients) ? jsonMessage.clients : [jsonMessage.clients];
            for (let connection of connectionsToRemove) {
                connectionStorage.removeSharedConnection(
                    connection.client
                );
            }
            break;
        default:
            logger.warn('receiveMessage', `Unknown sync operation: ${jsonMessage.syncOperation}`, { clientAddress: ws.clientAddress });
            break;
    }
}

module.exports = receiveMessage;