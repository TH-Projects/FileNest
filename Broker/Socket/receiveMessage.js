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
            connectionStorage.addSharedConnection(
                jsonMessage.client,
                jsonMessage.type
            );
            break;
        default:
            console.log('Unknown operation: ' + jsonMessage.syncOperation);
            break;
    }
}
module.exports = receiveMessage;