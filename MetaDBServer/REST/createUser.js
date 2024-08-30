const user = require('../DB/user');
const axios = require("axios");
require('dotenv').config();
const enums = require('../Socket/enums');

async function createUser(fastify) {
    fastify.post('/createUser', async (request, reply) => {
        const data = request.body;
        const username = data?.username;
        const password = data?.password;
        const email = data?.email;
        if(!username) {
            return reply.code(400).send('username not provided');
        }
        if(!password) {
            return reply.code(400).send('password not provided');
        }
        if(!email) {
            return reply.code(400).send('email not provided');
        }

        return await shareToBroker(username, password, email);
        /*const result = await user.createUser(username, password, email);
        if(!result.success){
            return reply.code(500).send(result);
        }*/
        //return reply.send({success:true});
    });
}

async function shareToBroker(username, password, email){
    try {
        const data = {
            type: 'METADBSERVER',
            message: {
                operation: enums.operations.CREATEUSER,
                data: {
                    username: username,
                    password: password,
                    email: email
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

module.exports = createUser;