const os = require('os');

// Used to store all the connections to the clients
let connectionStorage = [];
let sharedConnections = [];

// Remove a connection from the storage
const removeConnection = (ws) => {
    const wsEntry = connectionStorage.find((entry) => entry?.ws?.clientAddress === ws?.clientAddress);
    connectionStorage = connectionStorage.filter((entry) => entry?.ws?.clientAddress !== wsEntry?.ws?.clientAddress);
    return wsEntry;
}

// Add a connection to the storage
const addConnection = (ws, type) => {
    if(ws._isServer){
        return;
    }
    if(!connectionStorage.find((entry) => entry.ws.clientAddress === ws.clientAddress)){
        connectionStorage.push({type: type, ws: ws});
    }
}

// Add a shared connection to the storage
const addSharedConnection = (clientAddress, type) => {
    if(!sharedConnections.find((entry) => entry.clientAddress === clientAddress)
        && !connectionStorage.find((entry) => entry.ws._url?.replace(/\//g, "") === clientAddress?.replace(/\//g, ""))){
        sharedConnections.push({type: type, clientAddress: clientAddress});
    }
}

// Remove a shared connection from the storage
const removeSharedConnection = (clientAddress) => {
    sharedConnections = sharedConnections.filter((entry) => entry.clientAddress !== clientAddress);
}

// Get all connections by type
const getConnectionsByType = (type, sharedConnections = false) => {
    if(sharedConnections){
        return sharedConnections.filter((entry) => entry.type === type);
    }
    return connectionStorage.filter((entry) => entry.type === type);
}

// Get all connection addresses by type
const getAllConnectionAddressesByType = (type) => {
    const connectedClients = connectionStorage.filter((entry) => entry.type === type).map(entry => entry.ws.clientAddress);
    const sharedClients = sharedConnections.filter((entry) => entry.type === type).map(entry => entry.clientAddress);
    return [...connectedClients, ...sharedClients];
}

// Get all connections without a specific type
const getConnectionsWithoutType = (type, sharedConnections = false) => {
    if (sharedConnections) {
        return sharedConnections.filter((entry) => entry.type !== type);
    }
    return connectionStorage.filter((entry) => entry.type !== type);
}

// Get all connections
const getAllConnections = () =>{
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
    addSharedConnection,
    getAllConnectionAddressesByType,
    removeSharedConnection,
    getAllConnections
}