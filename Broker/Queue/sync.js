const sendMessage = require('../Socket/SendMessage');
const fastify = require('fastify')();
const enums = require('./enums');
const addMessage = require('./addMessage');
const getConnections = require('./getConnections');

// add messages between brokers
const add = (clientAddresses, messages) => {
    const message = {syncOperation: enums.syncOperation.ADD, clients: clientAddresses, messages: messages};
    sendMessage(
        fastify,
        message,
        getConnections());
    addMessage(message.messages, message.clients);
}

module.exports = {
    add
}