const connectionStorage = require('../Socket/connectionStorage');
const sync = require('../Queue/sync');

// Add a message to the queue
const addQueue = async (fastify) =>{
    fastify.post('/addQueue', (request, reply) => {
        // Add the message to the queue
        let data = request.body;
        if(!data){
            reply.code(400).send({status: 'error', message: 'No data provided'});
            return;
        }
        const messages = Array.isArray(data.message) ? data.message : [data.message];
        const clients = connectionStorage.getAllConnectionAddressesByType(data.type);
        const exceptClients = data.except ? data.except : [];
        if(exceptClients.length > 0) {
            exceptClients.forEach(client => {
                const index = clients.indexOf(client);
                if(index > -1){
                    clients.splice(index, 1);
                }
            });
        }
        console.log('clients: ' + JSON.stringify(clients));
        sync.add(clients, messages);
        reply.send({status: 'success'});
    });
}

module.exports = addQueue;