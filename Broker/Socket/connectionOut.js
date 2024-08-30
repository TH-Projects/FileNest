const WebSocket = require('ws');
const close = require('./closeConnection');
const open = require('./openConnection');
const receive = require('./receiveMessage');
const send = require('./SendMessage');
const enums = require('./enums');
const os = require('os');
const connectionStorage = require("./connectionStorage");

// Connections to other instances
function connectionOut(fastify, url, type = enums.connectionTypes.BROKER) {
    if((new URL(url))?.hostname === os.hostname()){
        console.log('Url: ' + url + ' Hostname: ' + os.hostname());
        return;
    }
    const ws = new WebSocket(url);
    Object.defineProperty(ws, 'clientAddress', {
        value: url,
        writable: true
    });
    connectionStorage.addConnection(ws, type);
    console.log('ConnOut ' + url);
    ws.on('open', () => {
        open(fastify, ws, type);
    });

    ws.on('message', (message) => {
        console.log('Received message: ' + JSON.stringify(message));
        let jsonMessage;
        if(Buffer.isBuffer(message)){
            jsonMessage = JSON.parse(message.toString());
            console.log('Buffer message: ' + JSON.stringify(jsonMessage));
        }
        else{
            jsonMessage = JSON.parse(message);
        }
        const clients = Array.isArray(jsonMessage.clients) ? jsonMessage.clients : [jsonMessage.clients];
        const broker = clients.filter(client => client.type === enums.connectionTypes.BROKER);
        if(broker.length > 0 && jsonMessage.syncOperation === enums.operation.ADDCONNECTION){
            for(let connection of broker){
                if(!connectionStorage.connectionStorage.find(entry => entry.ws.clientAddress === connection.client)
                    && (new URL(connection.client))?.hostname !== os.hostname()){
                    console.log('New broker connection: ' + connection.client);
                    connectionOut(fastify, connection.client, connection.type);
                }
            }
        }
        receive(fastify, jsonMessage, ws);
    });

    ws.on('close', () => {
        close(fastify, ws);
    });

    ws.on('error', (err) => {
        fastify.log.error(err);
    });
}
module.exports = connectionOut;