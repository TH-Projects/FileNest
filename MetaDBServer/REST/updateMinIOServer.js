const axios = require("axios");
require('dotenv').config();
const enums = require('../Socket/enums');
const {clientTypes} = require("./enums");

// Update the minIO server
const updateMinIOServer = async (fastify) => {
    fastify.post('/updateMinIOServer', async (request, reply) => {
        const data = request.body;
        const minIOServer_id = data?.minIOServer_id;
        const active = data?.active;
        if(!minIOServer_id) {
            return reply.code(400).send('minIOServer_id not provided');
        }
        if(!active) {
            return reply.code(400).send('active not provided');
        }
        return await shareToBroker(minIOServer_id, active);
    });
}

// Share the minIO server update to the broker
const shareToBroker = async (minIOServer_id, active) => {
    try {
        const data = {
            type: clientTypes.METADBSERVER,
            message: {
                operation: enums.operations.UPDATEMINIOSERVER,
                data: {
                    minIOServer_id: minIOServer_id,
                    active: active
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

module.exports = updateMinIOServer;