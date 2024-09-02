const fastify = require('fastify')({ logger: true });
const fs = require('fs');
const stream = require('stream');
const buildUpConnection = require("./Socket/buildUpConnection");
const connectionIn = require('./Socket/connectionIn');
const FastifyCors = require('@fastify/cors');
const FastifyMultipart = require('@fastify/multipart');

// Registriere CORS
fastify.register(FastifyCors, {
    origin: '*', //for development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

fastify.register(FastifyMultipart, {
    addToBody: true,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB (Erhöhe diesen Wert nach Bedarf)
      },
});

fastify.register(require('./MinIO/upload'),{
    fs: fs,
    stream: stream
});
fastify.register(require('./MinIO/delete'));
fastify.register(require('./MinIO/download'));
fastify.register(require('./MinIO/listObjects'));
fastify.register(require('./User/checkAndCreateUser'));
fastify.register(require('./User/loginUser'));

// 404-Route
fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({ error: 'Route nicht gefunden' });
});

// Server starten
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        connectionIn(fastify);
        await buildUpConnection();
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();

module.exports = fastify;
