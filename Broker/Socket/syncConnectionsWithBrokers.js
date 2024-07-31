const enums = require('./enums');
const sendMessage = require('./SendMessage');

function syncConnectionsWithBrokers(fastify, connectionStorage, address, type) {
    const brokers = connectionStorage.getConnectionsByType(enums.connectionTypes.BROKER);
    for (let broker of brokers) {
        sendMessage(
            fastify,
            {syncOperation: enums.operation.ADDCONNECTION, type: type, client: address},
            [broker.ws]
        );
    }
}

module.exports = syncConnectionsWithBrokers;