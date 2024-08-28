let minioClient = require('./MinIOClient');

async function download(fastify) {
    fastify.get('/download/:filename', async (request, reply) => {
        const bucketName = 'test';
        const objectName = request.params.filename;

        console.log('Downloading file from MinIO bucket:', objectName);

        try {
            const dataStream = await minioClient.getObject(bucketName, objectName);

            // Log the file details
            const fileStats = await minioClient.statObject(bucketName, objectName);
            console.log(`File details - Name: ${objectName}, Size: ${fileStats.size}, Type: ${fileStats.contentType}`);
            
            reply.header('Content-Disposition', `attachment; filename="${objectName}"`);
            reply.header('Content-Type', 'application/octet-stream');

            return reply.send(dataStream);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send(err.message);
        }
    });
}

module.exports = download;
