const crypto = require('crypto');
const axios = require('axios');
const { checkUsername, checkEmail } = require('../DB/user');
require('dotenv').config();
const enums = require('../Socket/enums');
const { clientTypes } = require("./enums");

async function createUserRoutes(fastify) {
    fastify.post('/checkAndCreateUser', async (request, reply) => {
        const { username, email, password } = request.body;

        // Validate the input data using business logic functions
        const checkResult = await checkUserExistance(username, email);
        if (!checkResult.success) {
            return reply.status(400).send({
                success: false,
                message: checkResult.message
            });
        }

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
        console.log("createResult:", createResult.success);
        
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

    const checkUserExistance = async (username, email) => {
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

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-])[A-Za-z\d@$!%*?&\-]{8,}$/;
        if (!passwordRegex.test(password)) {
            return {
                success: false,
                message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
            };
        }
        return { success: true };
    };

    const createUser = async (username, email, password) => {
        if (!username || !email || !password) {
            return {
                success: false,
                message: 'Username, email, or password not provided'
            };
        }

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
