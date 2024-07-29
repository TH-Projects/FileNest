const publish = require('./publish');
const queue = require('./queue');

// Add messages to the queue
function addMessage(messages, clients) {
    for (let clientAddress of clients) {
        let entry = queue.queue.find((queueObject) => queueObject.clientAddress === clientAddress);
        if (entry) {
            for (let message of messages) {
                entry.messages.push(message);
            }
        }
        else{
            queue.queue.push({ clientAddress: clientAddress, messages: [...messages]});
        }
    }
    publish(queue.queue);
}

module.exports = addMessage;