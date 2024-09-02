const axios = require("axios");
require('dotenv').config();
const enums = require('../Socket/enums');
const {clientTypes} = require("./enums");

async function addMinIOServer(fastify) {
    fastify.post('/addMinIOServer', async (request, reply) => {
        const data = request.body;
        const address = data?.address;
        const cluster_id = data?.cluster_id;
        if(!address) {
            return reply.code(400).send('address not provided');
        }
        if(!cluster_id) {
            return reply.code(400).send('cluster_id not provided');
        }
        return await shareToBroker(address, cluster_id);
    });
}

async function shareToBroker(address, cluster_id){
    try {
        const data = {
            type: clientTypes.METADBSERVER,
            message: {
                operation: enums.operations.ADDMINIOSERVER,
                data: {
                    address: address,
                    cluster_id: cluster_id
                }
            }
        }
        const result = await axios.post(process.env.NGINX_API + '/addQueue', data);
        return result.data;
    } catch (error){
        console.log(error);
        return {success:false, message:'Request to Broker failed'};
    }
}

module.exports = addMinIOServer;