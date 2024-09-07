// This function is called when a message is received from the client
function receiveMessage(fastify, message){
    console.log('Received message: ' + message);
}

module.exports = receiveMessage;