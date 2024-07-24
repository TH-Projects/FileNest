const fastify = require('fastify')({ logger: true });
const fs = require('fs');
const stream = require('stream');

// Registriere CORS
const cors = require('@fastify/cors');
fastify.register(cors, {
    origin: '*', //for development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});


fastify.register(require('@fastify/multipart'));
fastify.register(require('./MinIO/upload'),{
    fs: fs,
    stream: stream
});
fastify.register(require('./MinIO/download'));
fastify.register(require('./MinIO/listObjects'));

// 404-Route
fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({ error: 'Route nicht gefunden' });
});

// Server starten
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        fastify.log.info('Server listening on http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();

module.exports = fastify;
