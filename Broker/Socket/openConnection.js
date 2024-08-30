const syncConnectionsWithBrokers = require('./syncConnectionsWithBrokers');
const connectionStorage = require('./connectionStorage');
const enums = require('./enums');
// Open a connection
function open (fastify, ws, type) {
    fastify.log.info('Connected to: ' + ws.clientAddress);
    connectionStorage.addConnection(ws, type);
    if(type !== enums.connectionTypes.BROKER) {
        console.log('Sharing: ' + ws.clientAddress)
        syncConnectionsWithBrokers(fastify, connectionStorage, {client: ws.clientAddress, type: type});
    }
}
module.exports = open;