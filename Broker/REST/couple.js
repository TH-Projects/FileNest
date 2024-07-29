const connectionOut = require('../Socket/connectionOut');
const enums = require('../Socket/enums');

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
      connectionOut(fastify, url, type);
      return { couple: 'success' }
  })
}

module.exports = couple;