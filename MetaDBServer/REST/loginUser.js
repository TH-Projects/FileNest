const jwt = require('jsonwebtoken');
require('dotenv').config();
const user = require('../DB/user');

const JWT_SECRET = process.env.JWT_SECRET;  // Key saved in .env file

const loginUserRoute = async (fastify) => {
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
            // Request database to authenticate user
            const authResponse = await authenticateUser(username, password);

            // User authentication successful
            if (authResponse.success) {
                // Create JWT token
                const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' }); // Token valid for 1 hour

                return reply.send({
                    success: true,
                    message: 'Login successful',
                    token
                });
            } else {
                // Authentication failed
                return reply.code(401).send({
                    success: false,
                    message: authResponse.message
                });
            }

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'An error occurred while processing the request'
            });
        }
    });

    const authenticateUser = async (username, password) => {
        if (!username) {
            return { success: false, message: "Username not provided" };
        }
        if (!password) {
            return { success: false, message: "Password not provided" };
        }
        try {
            const result = await user.getUser(username, password);
            if (!result.success) {
                return { success: false, message: "Username or password incorrect" };
            }
            return { success: true, message: "User authenticated" };
        } catch (err) {
            console.error('Authentication error:', err);
            return { success: false, message: 'An error occurred during authentication' };
        }
    }
}

module.exports = loginUserRoute;
