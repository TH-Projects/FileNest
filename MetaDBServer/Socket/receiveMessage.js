const enums = require('./enums');
const user = require('../DB/user');
const file = require('../DB/files');
const cluster = require('../DB/cluster');
const minIOServer = require('../DB/minIOServer');
const logger = require('../logger');

// Receive a message from the broker
const receiveMessage = async (fastify, message) => {
    const data = JSON.parse(message);
    for(const msg of data.messages){
        await handleMessage(msg);
    }
}

// Handle the message
const handleMessage = async (message) => {
    const correlationId = message.correlationId || null;
    logger.info('receiveMessage', `Handling operation: ${message.operation}`, { correlationId, operation: message.operation });

    switch (message.operation) {
        case enums.operations.CREATEUSER:
            await createUser(message.data.username, message.data.password, message.data.email, correlationId);
            break;
        case enums.operations.DELETEFILE:
            await deleteFile(message.data.file_id, correlationId);
            break;
        case enums.operations.ADDFILE:
            await addFile(message.data.etag, message.data.name, message.data.file_type, message.data.size, message.data.last_modify, message.data.owner_id, message.data.minIOServer, message.data.content_type, correlationId);
            break;
        case enums.operations.ADDMINIOSERVER:
            await addMinIOServer(message.data.address, message.data.cluster_id, correlationId);
            break;
        case enums.operations.ADDCLUSTER:
            await addCluster(message.data.start_node_id, message.data.end_node_id, correlationId);
            break;
        case enums.operations.MARK_NON_REACHABLE_SERVER:
            await markNonReachableServer(message.data.minIOServer_id, correlationId);
            break;
        case enums.operations.UPDATEMINIOSERVER:
            await updateMinIOServer(message.data.minIOServer_id, message.data.active, correlationId);
            break;
        case enums.operations.MEMORYLIMIT:
            await updateMemoryLimit(message.data.cluster_id, message.data.memory_limit_reached, correlationId);
            break;
        default:
            logger.warn('receiveMessage', 'Unknown operation received', { correlationId, operation: message.operation });
            break;
    }
}

// Create a user
const createUser = async (username, password, email, correlationId) => {
    if(!username) {
        logger.error('receiveMessage:createUser', 'Missing required field: username', { correlationId });
        return;
    }
    if(!password) {
        logger.error('receiveMessage:createUser', 'Missing required field: password', { correlationId });
        return;
    }
    if(!email) {
        logger.error('receiveMessage:createUser', 'Missing required field: email', { correlationId });
        return;
    }
    return await user.createUser(username, password, email);
}

// Delete a file
const deleteFile = async (file_id, correlationId) => {
    if(!file_id) {
        logger.error('receiveMessage:deleteFile', 'Missing required field: file_id', { correlationId });
        return;
    }
    return await file.deleteFile(file_id);
}

// Add a file
const addFile = async (etag, name, file_type, size, last_modify, owner_id, minIOServer, content_type, correlationId) => {
    const missing = [
        !etag && 'etag', !name && 'name', !file_type && 'file_type',
        !size && 'size', !last_modify && 'last_modify', !owner_id && 'owner_id',
        !minIOServer && 'minIOServer', !content_type && 'content_type'
    ].filter(Boolean);
    if (missing.length > 0) {
        logger.error('receiveMessage:addFile', 'Missing required fields', { correlationId, missing });
        return;
    }
    return await file.addFile(etag, name, file_type, size, last_modify, owner_id, minIOServer, content_type);
}

// Add a MinIO server
const addMinIOServer = async (address, cluster_id, correlationId) => {
    if(!address) {
        logger.error('receiveMessage:addMinIOServer', 'Missing required field: address', { correlationId });
        return;
    }
    if(!cluster_id) {
        logger.error('receiveMessage:addMinIOServer', 'Missing required field: cluster_id', { correlationId });
        return;
    }
    return await cluster.addCluster(address, cluster_id);
}

// Add a cluster
const addCluster = async (start_node_id, end_node_id, correlationId) => {
    if(!start_node_id) {
        logger.error('receiveMessage:addCluster', 'Missing required field: start_node_id', { correlationId });
        return;
    }
    if(!end_node_id) {
        logger.error('receiveMessage:addCluster', 'Missing required field: end_node_id', { correlationId });
        return;
    }
    return await cluster.addCluster(start_node_id, end_node_id);
}

// Mark a non-reachable server
const markNonReachableServer = async (minIOServer_id, correlationId) => {
    if(!minIOServer_id) {
        logger.error('receiveMessage:markNonReachableServer', 'Missing required field: minIOServer_id', { correlationId });
        return;
    }
    return await minIOServer.markNonReachableServer(minIOServer_id);
}

// Update a MinIO server
const updateMinIOServer = async (minIOServer_id, active, correlationId) => {
    if(!minIOServer_id) {
        logger.error('receiveMessage:updateMinIOServer', 'Missing required field: minIOServer_id', { correlationId });
        return;
    }
    if(active === undefined) {
        logger.error('receiveMessage:updateMinIOServer', 'Missing required field: active', { correlationId });
        return;
    }
    return await minIOServer.updateMinIOServer(minIOServer_id, active);
}

// Update the memory limit for a cluster
const updateMemoryLimit = async (cluster_id, memory_limit_reached, correlationId) => {
    if(!cluster_id) {
        logger.error('receiveMessage:updateMemoryLimit', 'Missing required field: cluster_id', { correlationId });
        return;
    }
    if(memory_limit_reached === undefined) {
        logger.error('receiveMessage:updateMemoryLimit', 'Missing required field: memory_limit_reached', { correlationId });
        return;
    }
    return await cluster.updateMemoryLimit(cluster_id, memory_limit_reached);
}

module.exports = receiveMessage;