const fastify = require('fastify')({ logger: true });
const scheduleTasks = require('./Scheduler/scheduleTasks');

// Server starten
const start = async () => {
    try {
        await fastify.listen({port:parseInt(process.env.PORT_ADMIN, 10), host:'0.0.0.0'});
        setInterval(scheduleTasks, 30 * 1000);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();

module.exports = fastify;