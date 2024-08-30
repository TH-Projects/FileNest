async function loginUserRoutes(fastify) {
    fastify.post('/loginUser', async (request, reply) => {
        const { username, password } = request.body;

        // Check if username and password are provided
        if (!username) {
            return reply.code(400).send({
                success: false,
                message: 'Username is required'
            });
        }

        if (!password) {
            return reply.code(400).send({
                success: false,
                message: 'Password is required'
            });
        }

        try {
            // Request to database server to authenticate user
            const loginResponse = await fetch('http://nginx/authUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const loginData = await loginResponse.json();

            if (!loginResponse.ok) {
                return reply.code(loginResponse.status).send({
                    success: false,
                    message: loginData.error || 'Login failed'
                });
            }

            // Successful authentication
            return reply.send({
                success: true,
                message: 'Login successful',
                user: { username }
            });
            
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'An error occurred while processing the request'
            });
        }
    });
}

module.exports = loginUserRoutes;
