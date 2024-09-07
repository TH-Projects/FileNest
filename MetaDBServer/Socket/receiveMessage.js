const enums = require('./enums');
const user = require('../DB/user');
const file = require('../DB/files');
const cluster = require('../DB/cluster');
const minIOServer = require('../DB/minIOServer');

// Receive a message from the broker
const receiveMessage = async (fastify, message) => {
    console.log('Received message: ' + message);
    const data = JSON.parse(message);
    for(const message of data.messages){
        await handleMessage(message);
    }
}

// Handle the message
const handleMessage = async (message) => {
    switch (message.operation) {
        case enums.operations.CREATEUSER:
            console.log('Create User');
            await createUser(message.data.username, message.data.password, message.data.email);
            break;
        case enums.operations.DELETEFILE:
            console.log('Delete File');
            await deleteFile(message.data.file_id);
            break;
        case enums.operations.ADDFILE:
            console.log('Add File');
            await addFile(message.data.etag, message.data.name, message.data.file_type, message.data.size, message.data.last_modify, message.data.owner_id, message.data.minIOServer, message.data.content_type);
            break;
        case enums.operations.ADDMINIOSERVER:
            console.log('Add MinIOServer');
            await addMinIOServer(message.data.address, message.data.cluster_id);
            break;
        case enums.operations.ADDCLUSTER:
            console.log('Add Cluster');
            await addCluster(message.data.start_node_id, message.data.end_node_id);
            break;
        case enums.operations.MARK_NON_REACHABLE_SERVER:
            console.log('Mark Non Reachable Server');
            await markNonReachableServer(message.data.minIOServer_id);
            break;
        case enums.operations.UPDATEMINIOSERVER:
            console.log('Update MinIOServer');
            await updateMinIOServer(message.data.minIOServer_id, message.data.active);
            break;
        case enums.operations.MEMORYLIMIT:
            console.log('Update Memory Limit');
            await updateMemoryLimit(message.data.cluster_id, message.data.memory_limit_reached);
            break;
        default:
            console.log('Unknown operation: ' + message.operation);
            break;
    }
}

// Create a user
const createUser = async (username, password, email) => {
    if(!username) {
        console.log('No username provided');
        return;
    }
    if(!password) {
        console.log('No password provided');
        return;
    }
    if(!email) {
        console.log('No email provided');
        return;
    }
    return await user.createUser(username, password, email);
}

// Delete a file
const deleteFile = async (file_id) => {
    if(!file_id) {
        console.log('No file_id provided');
        return;
    }
    return await file.deleteFile(file_id);
}

// Add a file
const addFile = async (etag, name, file_type, size, last_modify, owner_id, minIOServer, content_type) => {
    if(!etag) {
        console.log('No etag provided');
        return;
    }
    if(!name) {
        console.log('No name provided');
        return;
    }
    if(!file_type) {
        console.log('No file_type provided');
        return;
    }
    if(!size) {
        console.log('No size provided');
        return;
    }
    if(!last_modify) {
        console.log('No last_modify provided');
        return;
    }
    if(!owner_id) {
        console.log('No owner_id provided');
        return;
    }
    if(!minIOServer) {
        console.log('No minIOServer provided');
        return;
    }
    if(!content_type) {
        console.log('No content_type provided');
        return;
    }
    return await file.addFile(etag, name, file_type, size, last_modify, owner_id, minIOServer, content_type);
}

// Add a MinIO server
const addMinIOServer = async (address, cluster_id) => {
    if(!address) {
        console.log('No address provided');
        return;
    }
    if(!cluster_id) {
        console.log('No cluster_id provided');
        return;
    }
    return await cluster.addCluster(address, cluster_id);
}

// Add a cluster
const addCluster = async (start_node_id, end_node_id) => {
    if(!start_node_id) {
        console.log('No start_node_id provided');
        return;
    }
    if(!end_node_id) {
        console.log('No end_node_id provided');
        return;
    }
    return await cluster.addCluster(start_node_id, end_node_id);
}

// Mark a non-reachable server
const markNonReachableServer = async (minIOServer_id) => {
    if(!minIOServer_id) {
        console.log('No minIOServer provided');
        return;
    }
    return await minIOServer.markNonReachableServer(minIOServer_id);
}

// Update a MinIO server
const updateMinIOServer = async (minIOServer_id, active) => {
    if(!minIOServer_id) {
        console.log('No minIOServer_id provided');
        return;
    }
    if(!active) {
        console.log('No active provided');
        return;
    }
    return await minIOServer.updateMinIOServer(minIOServer_id, active);
}

// Update the memory limit for a cluster
const updateMemoryLimit = async (cluster_id, memory_limit_reached) => {
    if(!cluster_id) {
        console.log('No cluster_id provided');
        return;
    }
    if(memory_limit_reached === undefined) {
        console.log('No memory_limit_reached provided');
        return;
    }
    return await cluster.updateMemoryLimit(cluster_id, memory_limit_reached);
}

module.exports = receiveMessage;