const axios = require("axios");
require('dotenv').config();
const enums = require('../Socket/enums');
const {clientTypes} = require("./enums");

async function updateMemoryLimit(fastify) {
    fastify.post('/updateMemoryLimit', async (request, reply) => {
        const data = request.body;
        const cluster_id = data?.cluster_id;
        const memory_limit_reached = data?.memory_limit_reached;
        if(!cluster_id) {
            return reply.code(400).send('cluster_id not provided');
        }
        if(!memory_limit_reached) {
            return reply.code(400).send('memory_limit_reached not provided');
        }
        return await shareToBroker(cluster_id, memory_limit_reached);
    });
}

async function shareToBroker(cluster_id, memory_limit_reached){
    try {
        const data = {
            type: clientTypes.METADBSERVER,
            message: {
                operation: enums.operations.MEMORYLIMIT,
                data: {
                    cluster_id: cluster_id,
                    memory_limit_reached: memory_limit_reached
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

module.exports = updateMemoryLimit;