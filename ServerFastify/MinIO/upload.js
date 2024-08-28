const minioClient = require('./MinIOClient');
const { pipeline } = require('stream'); // Import the stream module

async function upload(fastify, options) {
    const { fs, stream } = options;
    fastify.post('/upload', async (request, reply) => {
        try {
            const exists = await minioClient.minioClient.bucketExists('test');
            if (!exists) {
                await minioClient.minioClient.makeBucket('test');
            }
            const bucketName = 'test';

            const data = await request.file();

            //const stats = await fs.promises.stat(filepath);
            const fileName = data.filename;
            const contentType = data.mimetype || 'application/octet-stream';

            const uploadStream = new stream.PassThrough();
            const fileStream = data.file;

            // MinIO upload promise
            const uploadPromise = new Promise((resolve, reject) => {
                minioClient.minioClient.putObject(bucketName, fileName, uploadStream, data.file.bytesRead, {'Content-Type': contentType}, (err, etag) => {
                    if (err) {
                        console.log(err);
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