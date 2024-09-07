const syncConnectionsWithBrokers = require('./syncConnectionsWithBrokers');
const connectionStorage = require('./connectionStorage');

// Open a connection
function open (fastify, ws, type, connOut = false) {
    fastify.log.info('Connected to: ' + ws.clientAddress);
    if(connOut){
        const connections = connectionStorage.getAllConnections();
        syncConnectionsWithBrokers(fastify, connectionStorage, connections);
    }
}

module.exports = open;