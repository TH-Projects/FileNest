const crypto = require('crypto');
const axios = require('axios'); // Axios importieren

async function createUserRoutes(fastify) {
    fastify.post('/checkAndCreateUser', async (request, reply) => {
        const { username, email, password } = request.body;

        // Regex for username validation (max 20 chars, only letters and hyphens)
        const usernameRegex = /^[a-zA-Z\-]{1,20}$/;
        if (!usernameRegex.test(username)) {
            return reply.status(400).send({
                success: false,
                message: 'Username must be up to 20 characters long and can only contain letters and hyphens.'
            });
        }

        // Regex for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return reply.status(400).send({
                success: false,
                message: 'Invalid email address!'
            });
        }

        // Regex for password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-])[A-Za-z\d@$!%*?&\-]{8,}$/;
        if (!passwordRegex.test(password)) {
            return reply.status(400).send({
                success: false,
                message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
            });
        }

        // Hash the password before saving
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        try {
            // Check if username or email already exists in the database
            const checkResponse = await axios.post('http://nginx/checkUserExistance', {
                username,
                email
            });

            if (checkResponse.status !== 200) {
                return reply.code(checkResponse.status).send({
                    success: false,
                    message: checkResponse.data.message
                });
            }

            // Create user when username or email does not already exist
            const createResponse = await axios.post('http://nginx/createUser', {
                username,
                email,
                password: hashedPassword
            });

            return reply.code(createResponse.status).send(createResponse.data);

        } catch (error) {
            fastify.log.error(error);
            
            // Handle different types of errors (network, server, etc.)
            if (error.response) {
                // The request was made and the server responded with a status code
                return reply.status(error.response.status).send({
                    success: false,
                    message: error.response.data.message || 'An error occurred while processing the request'
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

module.exports = createUserRoutes;
