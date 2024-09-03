const user = require('../DB/user');

async function authUser(fastify) {
    fastify.post('/authUser', async (request, reply) => {
        const data = request.body;
        const username = data?.username;
        const password = data?.password;
        if(!username) {
            return reply.code(400).send('username not provided');
        }
        if(!password) {
            return reply.code(400).send('password not provided');
        }
        const result = await user.getUser(username, password);
        if(!result.success){
            return reply.code(500).send({success:false, message:"Invalid username or password"});
        }
        return reply.send({success:true});
    });
}

module.exports = authUser;