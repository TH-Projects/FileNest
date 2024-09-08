const connectionStorage = require('./connectionStorage');
const syncConnectionsWithBrokers = require('./syncConnectionsWithBrokers');
const enums = require('./enums');

// Close the connection of the client.
const close =  (fastify, ws) => {
    const wsEntry = connectionStorage.removeConnection(ws);
    if(wsEntry){
        console.log('Removing connection from storage' + wsEntry);
        syncConnectionsWithBrokers(fastify, connectionStorage, {client: ws.clientAddress, type: wsEntry.type}, enums.operation.REMOVECONNECTION);
    }
    fastify.log.info('Closed connection to: ' + ws.clientAddress);
}
module.exports = close;