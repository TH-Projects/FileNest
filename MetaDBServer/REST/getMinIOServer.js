const minIOServerDB = require('../DB/minIOServer');

// Get the minIO server for a cluster
async function minIOServer(fastify) {
    fastify.get('/minIOServer', async (request, reply) => {
        const cluster_id = request.query?.cluster_id;
        if(!cluster_id) {
            return reply.code(400).send('cluster_id not provided');
        }
        const result = await minIOServerDB.getMinIOServerByCluster(cluster_id);
        if(!result.success){
            return reply.code(500).send(result);
        }
        return reply.send(result);
    });
}

module.exports = minIOServer;