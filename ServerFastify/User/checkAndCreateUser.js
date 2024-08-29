
async function createUserRoutes(fastify) {
    fastify.post('/checkAndCreateUser', async (request, reply) => {
        const { username, email, password } = request.body;

        try {
            // Check if username or email already exists in database
            const checkResponse = await fetch('http://nginx/checkUserExistance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email })
            });
            
            if (checkResponse.status !== 200) {
                const checkData = await checkResponse.json();                
                return reply.code(checkResponse.status).send(checkData.message);
            }
            
            // Create user when username or email not already existing
            const createResponse = await fetch('http://nginx/createUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            
            const createData = await createResponse.json();            
            return reply.code(createResponse.status).send(createData);

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'An error occurred while processing the request'
            });
        }
    });
}

module.exports = createUserRoutes;
