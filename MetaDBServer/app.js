const fastify = require('fastify')({ logger: true });
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
fastify.register(require('./REST/deleteFile'));
fastify.register(require('./REST/addFile'));
fastify.register(require('./REST/checkUserExistance'));
fastify.register(require('./REST/getFile'));
fastify.register(require('./REST/getAccountIdByUsername'));
fastify.register(require('./REST/getFilenamesForUsername'));

// Server starten
const start = async () => {
    try {
        await fastify.listen({port:3001, host:'0.0.0.0'});
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
buildUpConnection();
dbConnection.register();
connectionIn(fastify);
module.exports = fastify;