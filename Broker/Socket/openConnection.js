const syncConnectionsWithBrokers = require('./syncConnectionsWithBrokers');
const connectionStorage = require('./connectionStorage');
const enums = require('./enums');
// Open a connection
function open (fastify, ws, type) {
    fastify.log.info('Connected to: ' + ws.clientAddress);
    const connections = connectionStorage.getAllConnections();
    syncConnectionsWithBrokers(fastify, connectionStorage, connections);
}
module.exports = open;