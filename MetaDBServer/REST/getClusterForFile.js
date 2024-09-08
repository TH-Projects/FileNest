const files = require('../DB/files');

// Get the cluster for a file
const getClusterForFile = async (fastify) => {
    fastify.get('/getClusterForFile', async (request, reply) => {
        const file_id = request.query?.file_id;
        if(!file_id) {
            return reply.code(400).send('file_id not provided');
        }
        const result = await files.getClusterForFile(file_id);
        if(!result.success){
            return reply.code(500).send(result);
        }
        return reply.send(result);
    });
}

module.exports = getClusterForFile;