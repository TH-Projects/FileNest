const minioClient = require('./MinIOClient')


const CHUNK_SIZE = 1024 * 1024;

async function upload(fastify, options) {
    let {fs, stream} = options;
    fastify.get('/upload', async (request, reply) => {
        try {
            const exists = await minioClient.bucketExists('test');
            if (!exists) {
                await minioClient.makeBucket('test');
            }

            const bucketName = 'test';
            const objectName = 'data';
            const filepath = 'main.pdf';

            fs.stat(filepath, async (err, stats) => {
                if (err) {
                    fastify.log.error(err);
                    return reply.status(500).send(err.message);
                }

                const fileSize = stats.size;
                let uploadedSize = 0;
                const uploadStream = new stream.PassThrough();

                minioClient.putObject(bucketName, objectName, uploadStream, fileSize, (err, etag) => {
                    fastify.log.info(etag);
                    if (err) {
                        fastify.log.error(err);
                        return reply.status(500).send(err.message);
                    }
                    fastify.log.info('File uploaded successfully.');
                });

                const fileStream = fs.createReadStream(filepath, { highWaterMark: CHUNK_SIZE });

                fileStream.on('data', (chunk) => {
                    uploadedSize += chunk.length;
                    uploadStream.write(chunk);
                    fastify.log.info(`Uploaded ${uploadedSize} of ${fileSize} bytes`);
                });

                fileStream.on('end', () => {
                    uploadStream.end();
                });

                fileStream.on('error', (err) => {
                    fastify.log.error(err);
                    uploadStream.destroy(err);
                    return reply.status(500).send(err.message);
                });
            });
        } catch (err) {
            fastify.log.error(err);
            reply.status(500).send(err.message);
        }
    });
}

module.exports = upload;
