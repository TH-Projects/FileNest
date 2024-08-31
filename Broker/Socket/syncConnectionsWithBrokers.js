const enums = require('./enums');
const sendMessage = require('./SendMessage');
const os = require('os');
require('dotenv').config();

function syncConnectionsWithBrokers(fastify, connectionStorage, clients, syncOperation = enums.operation.ADDCONNECTION) {
    if(!clients || clients.length === 0){
        return;
    }
    clients.push({
        client: 'ws://' + os.hostname() + ':' + process.env.PORT_BROKER,
        type: enums.connectionTypes.BROKER
    });
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