const cluster = require('../DB/cluster');

async function addCluster(fastify) {
    fastify.post('/addCluster', async (request, reply) => {
        const data = request.body;
        const start_node_id = data?.start_node_id;
        const end_node_id = data?.end_node_id;
        if(!start_node_id) {
            return reply.code(400).send('start_node_id not provided');
        }
        if(!end_node_id) {
            return reply.code(400).send('end_node_id not provided');
        }
        const result = await cluster.addCluster(start_node_id, end_node_id);
        if(!result.success){
            return reply.code(500).send({success:"false", error:result.message});
        }
        return reply.send({success:"true", cluster_id:result.message});
    });
}

module.exports = addCluster;