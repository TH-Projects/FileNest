const crypto = require('crypto');
const axios = require('axios');
const { checkUsername, checkEmail } = require('../DB/user');
require('dotenv').config();
const enums = require('../Socket/enums');
const { clientTypes } = require("./enums");

async function createUserRoutes(fastify) {
    fastify.post('/checkAndCreateUser', async (request, reply) => {
        const { username, email, password } = request.body;

        // Validate the username and email
        const checkResult = await checkUserExistance(username, email);
        if (!checkResult.success) {
            return reply.status(400).send({
                success: false,
                message: checkResult.message
            });
        }

        // Validate the password
        const passwordValidationResult = validatePassword(password);
        if (!passwordValidationResult.success) {
            return reply.status(400).send({
                success: false,
                message: passwordValidationResult.message
            });
        }

        // Hash the password before saving
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Try to create the user
        const createResult = await createUser(username, email, hashedPassword);        
        if (!createResult.success) {
            return reply.status(500).send({
                success: false,
                message: createResult.message
            });
        }

        return reply.status(201).send({
            success: true,
            message: 'User created successfully'
        });
    });

    // Check if the username and email are already in the database
    const checkUserExistance = async (username, email) => {
        // Check if username and email are provided
        if (!username || !email) {
            return {
                success: false,
                message: 'Username or email not provided'
            };
        }

        try {
            const userByUsername = await checkUsername(username);
            const userByEmail = await checkEmail(email);

            if (userByUsername.count > 0) {
                return {
                    success: false,
                    message: `Username "${username}" is already taken`
                };
            }

            if (userByEmail.count > 0) {
                return {
                    success: false,
                    message: `"${email}" was already used for an existing account`
                };
            }

            return {
                success: true,
                message: 'Username and email are available'
            };
        } catch (error) {
            console.error("Error in checkUserExistance:", error);
            return {
                success: false,
                message: 'An error occurred while checking user existence'
            };
        }
    };

    // Validate the password with a regex
    const validatePassword = (password) => {
        // Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-])[A-Za-z\d@$!%*?&\-]{8,}$/;
        if (!passwordRegex.test(password)) {
            return {
                success: false,
                message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
            };
        }
        return { success: true };
    };

    // Create the user in the database
    const createUser = async (username, email, password) => {
        // Check if username, email, and password are provided
        if (!username || !email || !password) {
            return {
                success: false,
                message: 'Username, email, or password not provided'
            };
        }

        // Share the user data with the broker
        try {
            const result = await shareToBroker(username, password, email);
            
            if (result.status === 'success') {
                return {
                    success: true,
                    message: 'User created successfully'
                };
            } else {
                return {
                    success: false,
                    message: 'Failed to create user in the broker'
                };
            }
        } catch (error) {
            console.error("Error in createUser:", error);
            return {
                success: false,
                message: 'An error occurred while creating the user'
            };
        }
    };

    // Share the user data with the broker to insert it into all databases
    const shareToBroker = async (username, password, email) => {
        try {
            const data = {
                type: clientTypes.METADBSERVER,
                message: {
                    operation: enums.operations.CREATEUSER,
                    data: {
                        username: username,
                        password: password,
                        email: email
                    }
                }
            };
            const result = await axios.post(process.env.NGINX_API + '/addQueue', data);
            return result.data;
        } catch (error) {
            console.error("Error in shareToBroker:", error);
            return {
                success: false,
                message: 'Request to Broker failed'
            };
        }
    };
}

module.exports = createUserRoutes;
