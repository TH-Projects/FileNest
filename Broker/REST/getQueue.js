const queue = require('../Queue/queue.js');

// Get the queue
const getQueue = async (fastify) => {
    fastify.get('/getQueue', (request, reply) => {
        reply.send(JSON.stringify(queue.queue));
        return;
    });
}

module.exports = getQueue;