const fastifyMariaDB = require('fastify-mariadb');
const dotenv = require('dotenv');
const fastify = require('fastify')({ logger: true });

async function register (){
    dotenv.config();
    await fastify.register(fastifyMariaDB, {
        promise: true,
        connectionString: `mariadb://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.PORT_METADB}/${process.env.MYSQL_DATABASE}`
    });
    await fastify.ready();
}

async function getConnection(){
    return await fastify.mariadb.getConnection();
}

module.exports = {
    register,
    getConnection
};