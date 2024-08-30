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
    console.log('Syncing connections with brokers: ' + JSON.stringify(clients));
    console.log('ToBuffer: ' + Buffer.from(JSON.stringify(clients)).toString());
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