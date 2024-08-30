const fastify = require('fastify')({ logger: true });
const connectionIn = require('./Socket/connectionIn');
const connectionOut = require('./Socket/connectionOut');
const buildUpConnection = require('./Socket/buildUpConnection');

fastify.register(require('./REST/addQueue'));
fastify.register(require('./REST/getQueue'));
fastify.register(require('./REST/couple'));
fastify.register(require('./REST/getCouples'));
// Server starten
const start = async () => {
    try {
        await fastify.listen({port:6001, host:'0.0.0.0'});
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
connectionIn(fastify);

//build up broker connections
const process = require('process');
const env = process.env;
const keys = Object.keys(env);
const clientList = keys.filter(e => e.startsWith('url')).map(e => env[e])
buildUpConnection(fastify, clientList);
module.exports = fastify;