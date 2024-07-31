const minioClient = require('./MinIOClient');
const { pipeline } = require('stream'); // Import the stream module

const CHUNK_SIZE = 1024 * 1024;

async function upload(fastify, options) {
    const { fs, stream } = options;
    fastify.post('/upload', async (request, reply) => {
        try {
            const exists = await minioClient.bucketExists('test');
            if (!exists) {
                await minioClient.makeBucket('test');
            }
            const bucketName = 'test';

            const data = await request.file();

            //const stats = await fs.promises.stat(filepath);
            const fileSize = data.file.bytesRead;
            const fileName = data.filename;

            const uploadStream = new stream.PassThrough();
            const fileStream = data.file;

            // MinIO upload promise
            const uploadPromise = new Promise((resolve, reject) => {
                minioClient.putObject(bucketName, fileName, uploadStream, fileSize, (err, etag) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(etag);
                    }
                });
            });

            // Pipeline to pipe data from fileStream to uploadStream
            pipeline(fileStream, uploadStream, (err) => {
                if (err) {
                    fastify.log.error('Pipeline failed:', err);
                } else {
                    fastify.log.info('Pipeline succeeded');
                }
            });

            // Wait for the upload to complete
            const etag = await uploadPromise;
            fastify.log.info('File uploaded successfully.');
            reply.send(etag);

        } catch (err) {
            fastify.log.error(err);
            if (!reply.sent) {
                reply.status(500).send(err.message);
            }
        }
    });
}

module.exports = upload;