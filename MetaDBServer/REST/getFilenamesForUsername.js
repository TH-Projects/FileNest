const files = require('../DB/files');

async function getFilenamesForUsername(fastify) {
    fastify.get('/getFilenamesForUsername', async (request, reply) => {
        const username = request.query?.username;
        const result = await files.getFilenamesForUsername(username);
        if(!result.success){
            return reply.code(500).send(result);
        }
        return reply.code(200).send(result);
    });
}

module.exports = getFilenamesForUsername;