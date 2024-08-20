const files = require('../DB/files');

async function getFiles(fastify) {
    fastify.get('/getFiles', async (request, reply) => {
        const result = await files.getFiles();
        if(!result.success){
            return reply.code(500).send({success:"false", error:result.message});
        }
        return reply.send({success:"true", files:result.message});
    });
}

module.exports = getFiles;