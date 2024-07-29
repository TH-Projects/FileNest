const queue = require('./queue');

// Remove specific messages from a client
function removeMessages(clientAddress){
    console.log('Removing messages for ' + clientAddress + ' from queue ' + JSON.stringify(queue.queue));
    queue.queue = queue.queue.filter((queueObject) => queueObject.clientAddress !== clientAddress);
}

module.exports = removeMessages;