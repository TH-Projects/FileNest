const fastify = require('fastify')({ logger: true });
const connectionIn = require('./Socket/connectionIn');
const connectionOut = require('./Socket/connectionOut');
const buildUpConnection = require('./Socket/buildUpConnection');
require('dotenv').config();

fastify.register(require('./REST/addQueue'));
fastify.register(require('./REST/getQueue'));
fastify.register(require('./REST/couple'));
fastify.register(require('./REST/getCouples'));
// Server starten
const start = async () => {
    try {
        await fastify.listen({port:parseInt(process.env.PORT_BROKER, 10), host:'0.0.0.0'});
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
connectionIn(fastify);
buildUpConnection(fastify);
module.exports = fastify;