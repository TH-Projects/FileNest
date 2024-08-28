const { pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);
const minioClient = require('./MinIOClient');

async function listObjects(fastify) {
    fastify.get('/listObjects', async (request, reply) => {
        const bucketName = 'test';
        const objectList = [];

        try {
            const dataStream = await minioClient.listObjectsV2(bucketName, '', true);

            await pipelineAsync(
                dataStream,
                async (source) => {
                    for await (const obj of source) {
                        fastify.log.info(obj);
                        objectList.push(obj);
                    }
                }
            );

            fastify.log.info('Listed objects successfully.');
            return reply.send(objectList);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send(err.message);
        }
    });
}

module.exports = listObjects;
