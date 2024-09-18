const syncConnectionsWithBrokers = require('./syncConnectionsWithBrokers');
const connectionStorage = require('./connectionStorage');
const publish = require('../Queue/publish');
const queue = require('../Queue/queue');
const enums = require('./enums');

// Open a connection
const open = (fastify, ws, type, connOut = false) => {
    fastify.log.info('Connected to: ' + ws.clientAddress);
    if(connOut){
        const connections = connectionStorage.getAllConnections();
        syncConnectionsWithBrokers(fastify, connectionStorage, connections);
    }
    if(type !== enums.connectionTypes.BROKER){
        publish(queue.queue);
    }
}

module.exports = open;