const fastify = require('fastify')({ logger: true, timeout: 60000, pluginTimeout: 60000 * 2});
const buildUpConnection = require('./Socket/buildUpConnection');
const dbConnection = require('./DB/connection');
const connectionIn = require('./Socket/connectionIn');

// Registriere CORS
const cors = require('@fastify/cors');
fastify.register(cors, {
    origin: '*', //for development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

fastify.register(require('./REST/getFiles'));
fastify.register(require('./REST/authUser'));
fastify.register(require('./REST/createUser'));
fastify.register(require('./REST/addCluster'));
fastify.register(require('./REST/addMinIOServer'));
fastify.register(require('./REST/getMinIOServer'));
fastify.register(require('./REST/getClusterForFile'));
fastify.register(require('./REST/checkUserExistance'));
fastify.register(require('./REST/getFile'));
fastify.register(require('./REST/getAccountIdByUsername'));
fastify.register(require('./REST/getMinIOServerForUpload'));
fastify.register(require('./REST/getFilenamesForUsername'));
fastify.register(require('./REST/removeMetaInfo'));

// Server starten
const start = async () => {
    try {
        await fastify.listen({port:3001, host:'0.0.0.0'});
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        console.log('Sleeping for 30 seconds');
        await sleep(30000);
        await dbConnection.register();
        connectionIn(fastify);
        await buildUpConnection();
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
module.exports = fastify;