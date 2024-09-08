// Connection Types for the broker socket
const connectionTypes = Object.freeze({
    FILERSERVER: 'FILERSERVER',
    METADBSERVER: 'METADBSERVER',
    BROKER: 'BROKER'
});

// Operations for the broker socket
const operation = Object.freeze({
    ADDCONNECTION: 'ADDCONNECTION',
    REMOVECONNECTION: 'REMOVECONNECTION',
});

module.exports = {
    connectionTypes,
    operation
}