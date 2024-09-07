const minIOServerDB = require('../DB/minIOServer');

// Get the minIO server for upload
async function minIOServerForUpload(fastify) {
    fastify.get('/minIOServerForUpload', async (request, reply) => {
        const result = await minIOServerDB.getMinIOServerForUpload();
        if(!result.success){
            return reply.code(500).send(result);
        }
        return reply.send(result);
    });
}

module.exports = minIOServerForUpload;