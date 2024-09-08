// Initiate a message to the client
function sendMessage(ws, message){
    ws.send(message);
}

module.exports = sendMessage;