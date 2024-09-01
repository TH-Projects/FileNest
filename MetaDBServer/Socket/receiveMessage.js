const enums = require('./enums');
const user = require('../DB/user');
const file = require('../DB/files');
const cluster = require('../DB/cluster');
const minIOServer = require('../DB/minIOServer');

async function receiveMessage(fastify, message){
    console.log('Received message: ' + message);
    const data = JSON.parse(message);
    for(const message of data.messages){
        await handleMessage(message);
    }
}

async function handleMessage(message){
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
        default:
            console.log('Unknown operation: ' + message.operation);
            break;
    }
}

async function createUser(username, password, email){
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

async function deleteFile(file_id){
    if(!file_id) {
        console.log('No file_id provided');
        return;
    }
    return await file.deleteFile(file_id);
}

async function addFile(etag, name, file_type, size, last_modify, owner_id, minIOServer, content_type){
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

async function addMinIOServer(address, cluster_id){
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

async function addCluster(start_node_id, end_node_id){
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

async function markNonReachableServer(minIOServer_id){
    if(!minIOServer_id) {
        console.log('No minIOServer provided');
        return;
    }
    return await minIOServer.markNonReachableServer(minIOServer_id);
}

module.exports = receiveMessage;