const fastify = require('fastify');
const fastifyMariaDB = require('fastify-mariadb');
const dotenv = require('dotenv');

// Lade Umgebungsvariablen aus der .env-Datei
dotenv.config();

// Erstelle eine Fastify-Instanz mit benutzerdefinierten Zeitüberschreitungen
const server = fastify({
    logger: true
});

// Registriere das fastify-mariadb Plugin
async function register() {
    try {
        await server.register(fastifyMariaDB, {
            promise: true,
            connectionString: `mariadb://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.PORT_METADB}/${process.env.MYSQL_DATABASE}`
        });
        // Warte, bis alle Plugins bereit sind
        await server.ready();
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

// Hole eine Verbindung aus dem Pool
async function getConnection() {
    try {
        return await server.mariadb.getConnection();
    } catch (err) {
        server.log.error('Error getting connection:', err);
        throw err;
    }
}

// Exportiere die Funktionen für die Verwendung in anderen Modulen
module.exports = {
    register,
    getConnection
};