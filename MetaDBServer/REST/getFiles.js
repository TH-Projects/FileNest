const files = require('../DB/files');

async function getFiles(fastify) {
    fastify.get('/getFiles', async (request, reply) => {
        const result = await files.getFiles();
        if(!result.success){
            return reply.code(500).send(result);
        }
        return reply.code(200).send(result);
    });
}

module.exports = getFiles;