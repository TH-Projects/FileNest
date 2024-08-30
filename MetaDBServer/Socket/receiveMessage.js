const enums = require('./enums');
const user = require('../DB/user');

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

module.exports = receiveMessage;