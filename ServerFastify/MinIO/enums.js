const clientTypes = Object.freeze({
    METADBSERVER: 'METADBSERVER',
});

const operationTypes = Object.freeze({
    MARK_NON_REACHABLE_SERVER: 'MARK_NON_REACHABLE_SERVER',
    ADDFILE: 'ADDFILE',
});


module.exports = {
    clientTypes,
    operationTypes
}