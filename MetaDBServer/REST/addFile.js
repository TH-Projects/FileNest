const file = require('../DB/files');

async function addFile(fastify) {
    fastify.post('/addFile', async (request, reply) => {
        const data = request.body;
        const etag = data?.etag;
        const name = data?.name
        const file_type = data?.file_type
        const size = data?.size
        const last_modify = data?.last_modify
        const owner_id = data?.owner_id
        const minIOServer = data?.minIOServer;
        if(!file_id) {
            return reply.code(400).send('file_id not provided');
        }
        if(!etag) {
            return reply.code(400).send('etag not provided');
        }
        if(!name) {
            return reply.code(400).send('name not provided');
        }
        if(!file_type) {
            return reply.code(400).send('file_type not provided');
        }
        if(!size) {
            return reply.code(400).send('size not provided');
        }
        if(!last_modify) {
            return reply.code(400).send('last_modify not provided');
        }
        if(!owner_id) {
            return reply.code(400).send('owner_id not provided');
        }
        if(!minIOServer) {
            return reply.code(400).send('minIOServer not provided');
        }
        const result = await file.addFile(etag, name, file_type, size, last_modify, owner_id, minIOServer);
        if(!result.success){
            return reply.code(500).send({success:"false", error:result.message});
        }
        return reply.send({success:"true", file_id:result.message});
    });
}

module.exports = addFile;