const users = require('../DB/user');

async function getAccountIdByUsername(fastify) {
    fastify.get('/getAccountIdByUsername', async (request, reply) => {
        const username = request.query.username;  // Extrahiere den Benutzernamen aus den Abfrageparametern
        console.log(username);
        
        if (!username) {
            return reply.code(400).send({ success: "false", error: "Username parameter is required" });
        }
        
        const result = await users.getAccountIdByUsername(username);
        console.log(result);
        
        if (!result.success) {
            return reply.code(500).send({ success: "false", error: result.message });
        }
        return reply.send({ success: "true", account_id: result.message });
    });
}

module.exports = getAccountIdByUsername;
