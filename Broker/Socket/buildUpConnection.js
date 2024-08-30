const connectionOut = require('./connectionOut');

async function buildUpConnection(fastify, clientList) {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await sleep(1000);
    for (let client of clientList) {
        connectionOut(fastify, client);
    }
}

module.exports = buildUpConnection;