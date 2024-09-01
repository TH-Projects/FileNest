const axios = require("axios");
require('dotenv').config();
const enums = require('../Socket/enums');
const {clientTypes} = require("./enums");

async function addCluster(fastify) {
    fastify.post('/addCluster', async (request, reply) => {
        const data = request.body;
        const start_node_id = data?.start_node_id;
        const end_node_id = data?.end_node_id;
        if(!start_node_id) {
            return reply.code(400).send('start_node_id not provided');
        }
        if(!end_node_id) {
            return reply.code(400).send('end_node_id not provided');
        }
        return await shareToBroker(start_node_id, end_node_id);
    });
}

async function shareToBroker(start_node_id, end_node_id){
    try {
        const data = {
            type: clientTypes.METADBSERVER,
            message: {
                operation: enums.operations.ADDMINIOSERVER,
                data: {
                    start_node_id: start_node_id,
                    end_node_id: end_node_id
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

module.exports = addCluster;