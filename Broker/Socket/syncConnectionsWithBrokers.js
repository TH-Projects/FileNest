const enums = require('./enums');
const sendMessage = require('./SendMessage');

function syncConnectionsWithBrokers(fastify, connectionStorage, clients, syncOperation = enums.operation.ADDCONNECTION) {
    const brokers = connectionStorage.getConnectionsByType(enums.connectionTypes.BROKER);
    for (let broker of brokers) {
        sendMessage(
            fastify,
            {
                syncOperation: syncOperation,
                clients: clients
            },
            [broker.ws]
        );
    }
}

module.exports = syncConnectionsWithBrokers;