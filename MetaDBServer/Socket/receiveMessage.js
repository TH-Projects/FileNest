function receiveMessage(fastify, message){
    console.log('Received message: ' + message);
}

module.exports = receiveMessage;