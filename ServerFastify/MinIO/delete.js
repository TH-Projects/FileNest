const minioClient = require('./MinIOClient');
const axios = require('axios');
const { clientTypes, operationTypes } = require('./enums')

// Delete a file
async function deleteFile(fastify, options) {
    fastify.delete('/delete', async (request, reply) => {
        try {
            const { file_id, username, password } = request.body;

            if (!file_id || !username || !password) {
                return sendError(reply, 400, 'Missing required parameters');
            }

            const isAuthenticated = await authenticateUser(username, password);
            if (!isAuthenticated) {
                return sendError(reply, 401, 'Login failed');
            }

            const fileMetadata = await getFileMetadata(file_id);
            if (!fileMetadata) {
                return sendError(reply, 400, 'File not found');
            }

            if (fileMetadata.username !== username) {
                return sendError(reply, 403, 'You do not have permission to delete this file');
            }
            
            await deleteFileFromMinIO(username.toLowerCase(), fileMetadata.name, fileMetadata.file_type, fastify);
            
            await deleteFileMetadata(file_id, fastify);

            fastify.log.info('File deleted successfully');

            return reply.status(200).send({
                success: true,
                message: 'File deleted successfully'
            });

        } catch (err) {
            handleError(reply, err, fastify);
        }
    });
}

// Helper Functions
// Send error response
const sendError = (reply, statusCode, message) => {
    return reply.code(statusCode).send({
        success: false,
        message
    });
};

// Handle error
const handleError = (reply, error, fastify) => {
    fastify.log.error('Delete file error:', error);
    if (!reply.sent) {
        reply.status(500).send({ success: false, error: error.message });
    }
};

// Authenticate user
const authenticateUser = async (username, password) => {
    try {
        const authResponse = await axios.post('http://nginx/authUser', {
            username,
            password
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return authResponse.status === 200;
    } catch (error) {
        throw new Error('Authentication error');
    }
};

// Get file metadata
const getFileMetadata = async (file_id) => {
    try {
        const fileResponse = await axios.get('http://nginx/getFile', {
            params: { file_id },
            headers: { 'Content-Type': 'application/json' }
        });
        if (fileResponse.status === 200 && fileResponse.data.success) {
            return fileResponse.data.message;
        } else {
            throw new Error(fileResponse.data.message || 'File not found');
        }
    } catch (error) {
        throw new Error('Failed to get file metadata');
    }
};

// Delete file from MinIO
const deleteFileFromMinIO = async (bucketName, fileName, fileType, fastify) => {
    try {
        await minioClient.minioClient.removeObject(bucketName, `${fileName}.${fileType}`);
        fastify.log.info('File deleted from MinIO successfully.');
    } catch (error) {
        fastify.log.error('Error deleting file from MinIO:', error);        
        throw new Error('Failed to delete file from MinIO');
    }
};

// Delete file metadata
const deleteFileMetadata = async (file_id, fastify) => {
    
    try {
        const data = {
            type: clientTypes.METADBSERVER,
            message: {
                operation: operationTypes.DELETEFILE,
                data: {
                    file_id: file_id
                }
            }
        }

        const deleteResponse = await axios.post('http://nginx/addQueue',data, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log(deleteResponse);
        
        if (deleteResponse.status !== 200 || !deleteResponse.data.status === 'success') {
            throw new Error(deleteResponse.data.message || 'Error deleting file metadata');
        }
    } catch (error) {
        fastify.log.error('Error deleting file metadata:', error);
        throw new Error('Failed to delete file metadata');
    }
};

module.exports = deleteFile;
