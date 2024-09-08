const connectionStorage = require('../Socket/connectionStorage');
const enums = require('../Socket/enums');
const sendMessage = require('../Socket/SendMessage');
const fastify = require('fastify')();

// Publish messages to clients
const publish = (queue) => {
    console.log('Publishing');
    const connectedClients = connectionStorage.getConnectionsWithoutType(enums.connectionTypes.BROKER);
    const connectedClientAddresses = connectedClients.map(entry => entry.ws.clientAddress);
    const entries = getEntriesByClientAddresses(connectedClients, connectedClientAddresses, queue);
    for (let entry of entries) {
        sendMessage(fastify,{messages: entry.messages}, [entry.client], true)
    }
}

// Get all messages for a client
const getEntriesByClientAddresses =(connectedClients, connectedClientAddresses, queue) => {
    return queue
        .filter((queueObject) => connectedClientAddresses.includes(queueObject.clientAddress))
        .map((queueObject) => {
            const ws = connectedClients.find((entry) => entry.ws.clientAddress === queueObject.clientAddress).ws;
            return {client: ws, messages: queueObject.messages};
        });
}

module.exports = publish;