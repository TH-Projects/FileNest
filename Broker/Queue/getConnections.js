const connectionStorage = require('../Socket/connectionStorage');
const socketEnums = require('../Socket/enums');

// get connections by standard Type
const getConnections = () => {
    return connectionStorage.getConnectionsByType(socketEnums.connectionTypes.BROKER).map(client => client.ws);
}

module.exports = getConnections;