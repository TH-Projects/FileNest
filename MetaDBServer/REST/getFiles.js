const files = require('../DB/files');

async function getFiles(fastify) {
    fastify.get('/getFiles', async (request, reply) => {
        return reply.send(JSON.stringify(await files.getFiles()));
    });
}

module.exports = getFiles;