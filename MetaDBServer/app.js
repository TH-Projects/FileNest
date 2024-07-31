const fastify = require('fastify')({ logger: true });

// Server starten
const start = async () => {
    try {
        await fastify.listen({port:7001, host:'0.0.0.0'});
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();

module.exports = fastify;