const connectionOut = require('../Socket/connectionOut');
const connectionStorage = require('../Socket/connectionStorage');
const enums = require('../Socket/enums');
const axios = require('axios');
const crypto = require('crypto');

async function couple(fastify) {
  fastify.post('/couple', async (request, reply) => {
      const url = request.body.url;
      const type = request.body.type;
      if(!url){
          reply.code(400).send({status: 'error', message: 'No url provided'});
      }
      if(!type){
          reply.code(400).send({status: 'error', message: 'No type provided'});
      }
      console.log('Coupling: ' + url);
      connectionOut(fastify, url, type);
      if(type === enums.connectionTypes.BROKER){
          return { couple: 'success', data: await getCurrentQueue() };
      }
      return { couple: 'success' };
  })
}

async function getCurrentQueue(){
    let brokerConnections = connectionStorage.getAllConnectionAddressesByType(enums.connectionTypes.BROKER);
    brokerConnections = brokerConnections.map((connection) => {
        return connection.replace('ws://', 'http://');
    });
    console.log('Get Queue from: ' + brokerConnections.length);
    const queueResponse = {};
    for(const connection of brokerConnections){
        try {
            const response = await axios.get(connection + '/getQueue');
            const hash = generateHash(response.data);
            if(queueResponse[hash]){
                queueResponse[hash].count++;
            }
            else{
                queueResponse[hash] = {
                    count: 1,
                    data: response.data
                };
            }
            if(queueResponse[hash].count > brokerConnections.length / 2 || brokerConnections.length === 1){
                return queueResponse[hash].data;
            }
        } catch (e) {
            console.log('Error getCurrentQueue');
        }
    }
    return [];
}

function generateHash(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

module.exports = couple;