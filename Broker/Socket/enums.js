const connectionTypes = Object.freeze({
    FILERSERVER: 'FILERSERVER',
    METADBSERVER: 'METADBSERVER',
    BROKER: 'BROKER'
});

const operation = Object.freeze({
    ADDCONNECTION: 'ADDCONNECTION',
    REMOVECONNECTION: 'REMOVECONNECTION',
});

module.exports = {
    connectionTypes,
    operation
}