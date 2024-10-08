const WebSocket = require('ws');
const receive = require('./receiveMessage');
const close = require('./closeConnection');
const open = require('./openConnection');
const enums = require('./enums');
const connectionStorage = require('./connectionStorage');
const connectionOut = require('./connectionOut');
const os = require('os');

// Connections from other instances
const connectionIn = (fastify) =>{
    const wss = new WebSocket.Server({ server: fastify.server });
    // Connection from other brokers
    wss.on('connection', (ws, req) => {
        Object.defineProperty(ws, 'clientAddress', {
            value: 'ws://' + req.headers.host,
            writable: true
        });
        console.log('ConnIn ' + req.headers.host);
        connectionStorage.addConnection(ws, enums.connectionTypes.BROKER);
        open(fastify, ws, enums.connectionTypes.BROKER);

        // Receive messages
        ws.on('message', (message) => {
            console.log('Message: ' + message);
            let jsonMessage;
            if(Buffer.isBuffer(message)){
                jsonMessage = JSON.parse(message.toString());
            }
            else{
                jsonMessage = JSON.parse(message);
            }
            const clients = Array.isArray(jsonMessage.clients) ? jsonMessage.clients : [jsonMessage.clients];
            const broker = clients.filter(client => client?.type === enums.connectionTypes.BROKER);
            if(broker.length > 0 && jsonMessage.syncOperation === enums.operation.ADDCONNECTION){
                for(let connection of broker){
                    if(!connectionStorage.connectionStorage.find(entry => entry.ws.clientAddress === connection.client)
                        && (new URL(connection.client))?.hostname !== os.hostname()){
                        connectionOut(fastify, connection.client, connection.type);
                    }
                }
            }
            receive(fastify, jsonMessage, ws);
        });

        // Close the connection
        ws.on('close', () => {
            close(fastify, ws);
        });
    });
}
module.exports = connectionIn;