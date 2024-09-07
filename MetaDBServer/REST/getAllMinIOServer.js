const minIOServerDB = require('../DB/minIOServer');

// Get all minIO servers
async function allMinIOServer(fastify) {
    fastify.get('/allMinIOServer', async (request, reply) => {
        const result = await minIOServerDB.getAllMinIOServer();
        if(!result.success){
            return reply.code(500).send(result);
        }
        return reply.send(result);
    });
}

module.exports = allMinIOServer;