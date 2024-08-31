const minioClient = require('./MinIOClient');
const axios = require('axios');

async function deleteFile(fastify, options) {
    fastify.delete('/delete', async (request, reply) => {
        try {            
            const { file_id, username, password } = request.body;
            console.log('file_id:', file_id);
            console.log('username:', username);
            console.log('password:', password);
            

            if (!file_id || !username || !password) {
                return reply.code(400).send({
                    success: false,
                    message: 'Missing required parameters'
                });
            }
            
            // Authenticate the user
            const authResponse = await axios.post('http://nginx/authUser', {
                username,
                password
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (authResponse.status !== 200) {
                return reply.code(authResponse.status).send({
                    success: false,
                    message: authResponse.data.error || 'Login failed'
                });
            }
            
            // Get file metadata from the database
            const fileResponse = await axios.get('http://nginx/getFile', {
                params: { file_id },
                headers: { 'Content-Type': 'application/json' }
            });

            if (fileResponse.status !== 200 || !fileResponse.data.success) {
                return reply.code(400).send({
                    success: false,
                    message: fileResponse.data.message || 'File not found'
                });
            }

            const fileMetadata = fileResponse.data.message;
            
            // Ensure the user is the owner of the file
            if (fileMetadata.username !== username) {
                return reply.code(403).send({
                    success: false,
                    message: 'You do not have permission to delete this file'
                });
            }
            
            // Delete file from MinIO
            const bucketName = username.toLowerCase();
            await minioClient.minioClient.removeObject(bucketName, `${fileMetadata.name}.${fileMetadata.file_type}`);
            fastify.log.info('File deleted from MinIO successfully.');
            
            // Delete file metadata from the database            
            const deleteResponse = await axios.delete('http://nginx/removeMetaInfo', {
                headers: { 'Content-Type': 'application/json' },
                data: { file_id }
            });            

            if (deleteResponse.status !== 200 || !deleteResponse.data.success) {
                return reply.code(400).send({
                    success: false,
                    message: deleteResponse.data.message || 'Error deleting file metadata'
                });
            }

            return reply.status(200).send({
                success: true,
                message: 'File deleted successfully'
            });

        } catch (err) {
            fastify.log.error(err);
            if (!reply.sent) {
                reply.status(500).send({ success: false, error: err.message });
            }
        }
    });
}

module.exports = deleteFile;
