const connectionStore = require('../Socket/connectionStorage');

// Get all couples
async function getCouples (fastify) {
    fastify.get('/getCouples', (request, reply) => {
        reply.send(JSON.stringify([...connectionStore.connectionStorage, ...connectionStore.sharedConnections]));
        return;
    });
}

module.exports = getCouples;