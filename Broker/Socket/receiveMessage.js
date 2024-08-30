const enums = require('../Queue/enums');
const socketEnums = require('./enums');
const connectionStorage = require('./connectionStorage');
const addMessage = require('../Queue/addMessage');
const removeMessages = require('../Queue/removeMessage');

// This function is called up when a message is received.
function receiveMessage (fastify, message, ws) {
    console.log('Nachricht: ' + message);
    const jsonMessage = JSON.parse(message);
    switch (jsonMessage.syncOperation) {
        case enums.syncOperation.ADD:
            addMessage(jsonMessage.messages, jsonMessage.clients);
            break;
        case enums.syncOperation.REMOVE:
            removeMessages(jsonMessage.client);
            break;
        case socketEnums.operation.ADDCONNECTION:
            console.log('Adding connection to storage' + message);
            const connections = Array.isArray(jsonMessage.clients) ? jsonMessage.clients : [jsonMessage.clients]
            for (let connection of connections) {
                connectionStorage.addSharedConnection(
                    connection.client,
                    connection.type
                );
            }
            break;
        case socketEnums.operation.REMOVECONNECTION:
            console.log('Removing connection from storage' + message);
            const connectionsToRemove = Array.isArray(jsonMessage.clients) ? jsonMessage.clients : [jsonMessage.clients];
            for (let connection of connectionsToRemove) {
                connectionStorage.removeSharedConnection(
                    connection.client
                );
            }
            break;
        default:
            console.log('Unknown operation: ' + jsonMessage.syncOperation);
            break;
    }
}
module.exports = receiveMessage;