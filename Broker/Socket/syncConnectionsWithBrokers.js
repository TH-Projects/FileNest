const enums = require('./enums');
const sendMessage = require('./SendMessage');
const os = require('os');
require('dotenv').config();

// Sync the connections with the brokers
function syncConnectionsWithBrokers(fastify, connectionStorage, clients, syncOperation = enums.operation.ADDCONNECTION) {
    if(!clients || clients.length === 0){
        return;
    }
    if(!Array.isArray(clients)){
        clients = [clients];
    }
    if(!clients.find(client => client === 'ws://' + os.hostname() + ':' + process.env.PORT_BROKER)){
        clients.push({
            client: 'ws://' + os.hostname() + ':' + process.env.PORT_BROKER,
            type: enums.connectionTypes.BROKER
        });
    }
    const brokers = connectionStorage.getConnectionsByType(enums.connectionTypes.BROKER);

    // Send the message to all brokers
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