// Used to send messages to the client
const sendMessage = (ws, message) =>{
    ws.send(message);
}

module.exports = sendMessage;