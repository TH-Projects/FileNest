const connectionStorage = require('./connectionStorage');
// Close the connection of the client.
function close (fastify, ws) {
    connectionStorage.removeConnection(ws);
    fastify.log.info('Closed connection to: ' + ws.clientAddress);
}
module.exports = close;