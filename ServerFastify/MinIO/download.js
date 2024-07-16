let minioClient = require('./MinIOClient');
async function download (fastify) {
    fastify.get('/download', async (request, reply) => {
        const bucketName = 'test';
        const objectName = 'data';

        try {
            const dataStream = await minioClient.getObject(bucketName, objectName);
            return reply.send(dataStream);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send(err.message);
        }
    });
}
module.exports = download;