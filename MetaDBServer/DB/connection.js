const fastify = require('fastify');
const fastifyMariaDB = require('fastify-mariadb');
const dotenv = require('dotenv');
dotenv.config();
const server = fastify({
    logger: true
});

// register the plugin
async function register() {
    try {
        await server.register(fastifyMariaDB, {
            promise: true,
            connectionString: `mariadb://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.PORT_METADB}/${process.env.MYSQL_DATABASE}`
        });
        // wait for the server to be ready
        await server.ready();
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

// get a connection
const getConnection = async () => {
    try {
        return await server.mariadb.getConnection();
    } catch (err) {
        server.log.error('Error getting connection:', err);
        throw err;
    }
}

module.exports = {
    register,
    getConnection
};