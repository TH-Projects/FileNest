const file = require('../DB/files');

// Remove the meta info for a file
async function removeMetaInfo(fastify) {
    fastify.delete('/removeMetaInfo', async (request, reply) => {
        const { file_id } = request.body;
        console.log('INSIDE DELETE FILE IN DB SERVER');
        if (!file_id) {
            return reply.code(400).send('file_id not provided');
        }
        console.log('file_id', file_id);
        
        const result = await file.deleteFile(file_id);
        if (!result.success) {
            return reply.code(500).send(result);
        }

        return reply.send(result);
    });
}

module.exports = removeMetaInfo;
