const users = require('../DB/user');

// Get the account id by username
const getAccountIdByUsername = async (fastify) => {
    fastify.get('/getAccountIdByUsername', async (request, reply) => {
        const username = request.query.username;
        if (!username) {
            return reply.code(400).send({ success: "false", error: "Username parameter is required" });
        }
        
        const result = await users.getAccountIdByUsername(username);     
        if (!result.success) {
            return reply.code(500).send({ success: "false", error: result.message });
        }
        
        return reply.send({ success: "true", account_id: result.message });
    });
}

module.exports = getAccountIdByUsername;
