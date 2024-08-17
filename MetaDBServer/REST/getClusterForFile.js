const files = require('../DB/files');

async function getClusterForFile(fastify) {
    fastify.get('/getFiles', async (request, reply) => {
        const file_id = request.query?.file_id;
        if(!file_id) {
            return reply.code(400).send('file_id not provided');
        }
        const result = await files.getClusterForFile(file_id);
        if(!result.success){
            return reply.code(500).send({success:"false", error:result.message});
        }
        return reply.send({success:"true", files:result.message});
    });
}

module.exports = getClusterForFile;