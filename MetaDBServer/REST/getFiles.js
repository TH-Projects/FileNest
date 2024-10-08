const files = require('../DB/files');

// Get all files
const getFiles = async (fastify) => {
    fastify.get('/getFiles', async (request, reply) => {
        const result = await files.getFiles();
        if(!result.success){
            return reply.code(500).send(result);
        }
        return reply.code(200).send(result);
    });
}

module.exports = getFiles;