const cluster = require('../DB/cluster');

async function addMinIOServer(fastify) {
    fastify.post('/addMinIOServer', async (request, reply) => {
        const data = request.body;
        const address = data?.address;
        const cluster_id = data?.cluster_id;
        if(!address) {
            return reply.code(400).send('address not provided');
        }
        if(!cluster_id) {
            return reply.code(400).send('cluster_id not provided');
        }
        const result = await cluster.addCluster(address, cluster_id);
        if(!result.success){
            return reply.code(500).send(result);
        }
        return reply.send(result);
    });
}

module.exports = addMinIOServer;