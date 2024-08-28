const user = require('../DB/user');

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
        const result = await user.createUser(username, password, email);
        if(!result.success){
            return reply.code(500).send(result);
        }
        return reply.send({success:true});
    });
}

module.exports = createUser;