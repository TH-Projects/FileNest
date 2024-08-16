const bucket = require('../DB/bucket');

async function getFiles(fastify) {
    fastify.get('/getBucketForFile', async (request, reply) => {
        const etag = request.query?.etag;
        const owner_id = request.query?.owner_id;
        if(!etag) {
            return reply.code(400).send('etag not provided');
        }
        if(!owner_id) {
            return reply.code(400).send('owner_id not provided');
        }
        return reply.send(JSON.stringify(await bucket.getBucketForFile(etag, owner_id)));
    });
}

module.exports = getFiles;