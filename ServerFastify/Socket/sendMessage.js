function sendMessage(ws, message){
    ws.send(message);
}

module.exports = sendMessage;