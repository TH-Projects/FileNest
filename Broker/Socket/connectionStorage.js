const os = require('os');

// Used to store all the connections to the clients
let connectionStorage = [];
let sharedConnections = [];

// Remove a connection from the storage
function removeConnection(ws) {
    const wsEntry = connectionStorage.find((entry) => entry?.ws?.clientAddress === ws?.clientAddress);
    connectionStorage = connectionStorage.filter((entry) => entry?.ws?.clientAddress !== wsEntry?.ws?.clientAddress);
    return wsEntry;
}

// Add a connection to the storage
function addConnection(ws, type) {
    if(ws._isServer){
        return;
    }
    if(!connectionStorage.find((entry) => entry.ws.clientAddress === ws.clientAddress)){
        connectionStorage.push({type: type, ws: ws});
    }
}

function addSharedConnection(clientAddress, type) {
    if(!sharedConnections.find((entry) => entry.clientAddress === clientAddress)
        && !connectionStorage.find((entry) => entry.ws._url?.replace(/\//g, "") === clientAddress?.replace(/\//g, ""))){
        sharedConnections.push({type: type, clientAddress: clientAddress});
    }
}

function removeSharedConnection(clientAddress) {
    sharedConnections = sharedConnections.filter((entry) => entry.clientAddress !== clientAddress);
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

function getAllConnections(){

    const connectedClients = connectionStorage.map(entry => ({
        client: entry.ws.clientAddress,
        type: entry.type
    }));

    const sharedClients = sharedConnections.map(entry => ({
        client: entry.clientAddress,
        type: entry.type
    }));
    return [...connectedClients, ...sharedClients];
}



module.exports = {
    connectionStorage,
    sharedConnections,
    removeConnection,
    addConnection,
    getConnectionsByType,
    getConnectionsWithoutType,
    getClientByAddress,
    addSharedConnection,
    getAllConnectionAddressesByType,
    removeSharedConnection,
    getAllConnections
}