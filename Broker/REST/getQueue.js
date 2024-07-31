const queue = require('../Queue/queue.js');
async function getQueue (fastify) {
    fastify.get('/getQueue', (request, reply) => {
        reply.send(JSON.stringify(queue.queue));
        return;
    });
}
module.exports = getQueue;