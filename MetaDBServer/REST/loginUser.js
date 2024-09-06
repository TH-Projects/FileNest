const axios = require('axios'); // Axios importieren

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
            const loginResponse = await axios.post('http://nginx/authUser', {
                username,
                password
            });

            if(loginResponse.status === 200) {
                // Successful authentication
                return reply.send({
                    success: true,
                    message: 'Login successful',
                    user: { username, password }
                });
            }

        } catch (error) {
            fastify.log.error(error);

            if (error.response) {
                // The request was made and the server responded with a status code                
                return reply.code(error.response.status).send({
                    success: false,
                    message: error.response.data.message || 'Login failed'
                });
            } else if (error.request) {
                // The request was made but no response was received
                return reply.status(500).send({
                    success: false,
                    message: 'No response received from the server'
                });
            } else {
                // Something happened in setting up the request that triggered an error
                return reply.status(500).send({
                    success: false,
                    message: 'An error occurred while processing the request'
                });
            }
        }
    });
}

module.exports = loginUserRoutes;
