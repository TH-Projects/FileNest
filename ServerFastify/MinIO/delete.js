const minioClient = require('./MinIOClient');
const axios = require('axios');
const { clientTypes, operationTypes } = require('./enums')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Delete a file
const deleteFile = async (fastify, options) => {
    fastify.delete('/delete', async (request, reply) => {
        try {
            const { file_id } = request.body;
            if (!file_id) {
                return sendError(reply, 400, 'Missing required parameters');
            }

            // Authenticate user using JWT
            const token = request.headers.authorization?.split(' ')[1]; // Assumes format: "Bearer <token>"
            if (!token) {
                return sendError(reply, 401, 'Token is missing');
            }  

            const authResponse = await authenticateUser(token);            
            if (!authResponse.success) {
                return sendError(reply, 401, 'Authentication failed');
            }
            const authenticatedUsername = authResponse.username;

            const fileMetadata = await getFileMetadata(file_id);
            if (!fileMetadata) {
                return sendError(reply, 400, 'File not found');
            }

            if (fileMetadata.username !== authenticatedUsername) {
                return sendError(reply, 403, 'You do not have permission to delete this file');
            }
            
            await deleteFileFromMinIO(authenticatedUsername.toLowerCase(), fileMetadata.name, fileMetadata.file_type, fastify);
            
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
const authenticateUser = async (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);        
        return { success: true, message: 'user authenticated in db' , username: decoded.username}; // Return user data
    } catch (error) {
        console.error('JWT authentication error:', error);
        return {success: false, message: 'authentication in db failed'}; // Token is invalid or expired
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
