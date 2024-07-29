// Used to store all the connections to the clients
let connectionStorage = [];
let sharedConnections = [];

// Remove a connection from the storage
function removeConnection(ws) {
    connectionStorage = connectionStorage.filter((entry) => entry?.ws?.clientAddress !== ws?.clientAddress);
}

// Add a connection to the storage
function addConnection(ws, type) {
    connectionStorage.push({type: type, ws: ws});
}

function addSharedConnection(clientAddress, type) {
    sharedConnections.push({type: type, clientAddress: clientAddress});
}

function getConnectionsByType(type, sharedConnections = false) {
    if(sharedConnections){
        return sharedConnections.filter((entry) => entry.type === type);
    }
    return connectionStorage.filter((entry) => entry.type === type);
}

function getAllConnectionAddressesByType(type) {
    const connectedClients = connectionStorage.filter((entry) => entry.type === type).map(entry => entry.ws.clientAddress);
    const sharedClients = sharedConnections.filter((entry) => entry.type === type).map(entry => entry.clientAddress);
    return [...connectedClients, ...sharedClients];
}

function getConnectionsWithoutType(type, sharedConnections = false) {
    if (sharedConnections) {
        return sharedConnections.filter((entry) => entry.type !== type);
    }
    return connectionStorage.filter((entry) => entry.type !== type);
}

function getClientByAddress(clientAddress) {
    return  connectionStorage.find((entry) => entry.ws.clientAddress === clientAddress);
}

module.exports = {
    connectionStorage,
    removeConnection,
    addConnection,
    getConnectionsByType,
    getConnectionsWithoutType,
    getClientByAddress,
    addSharedConnection,
    getAllConnectionAddressesByType
}