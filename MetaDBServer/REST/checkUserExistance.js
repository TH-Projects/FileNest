const { checkUsername, checkEmail } = require('../DB/user'); 

async function checkUserExistance(fastify) {
    fastify.post('/checkUserExistance', async (request, reply) => {
        const { username, email } = request.body;

        if (!username || !email) {
            return reply.code(400).send('username or email not provided');
        }

        try {
            const userByUsername = await checkUsername(username); 
            const userByEmail = await checkEmail(email);

            // Check if count of db results is greater than 0
            const usernameExists = userByUsername.count > 0;
            const emailExists = userByEmail.count > 0;            

            if (usernameExists || emailExists) {
                return reply.code(409).send({
                    success: false,
                    message: 'Username or Email already exists'
                });
            } else {
                return reply.code(200).send({
                    success: true,
                    message: 'Username and Email are available'
                });
            }
        } catch (error) {
            console.error("Error in checkUserExistance:", error);
            return reply.code(500).send({
                success: false,
                error: error.message
            });
        }
    });
}

module.exports = checkUserExistance;
