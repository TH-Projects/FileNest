const file = require('../DB/files');

async function deleteFile(fastify) {
    fastify.post('/deleteFile', async (request, reply) => {
        const data = request.body;
        const file_id = data?.file_id;
        if(!file_id) {
            return reply.code(400).send('file_id not provided');
        }
        const result = await file.deleteFile(file_id);
        if(!result.success){
            return reply.code(500).send({success:"false", error:result.message});
        }
        return reply.send({success:"true", affectedRows:result.message});
    });
}

module.exports = deleteFile;