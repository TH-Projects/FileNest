const minioClient = require('./MinIOClient');
const axios = require('axios');
const { PassThrough } = require('stream');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const { clientTypes, operationTypes } = require('./enums');
const logger = require('../logger');

const JWT_SECRET = process.env.JWT_SECRET;  // Key saved in .env file

// Upload a file
const upload = async (fastify, options) => {
    fastify.post('/upload', async (request, reply) => {
        const correlationId = crypto.randomUUID();
        try {
            const data = request.body.file?.[0];
            const fileName = data?.filename;
            const fileBuffer = data?.data;
            const fileSize = fileBuffer?.length;

            if (!data || !fileName || !fileBuffer || !fileSize) {
                return sendError(reply, 400, 'File data is missing or malformed');
            }

            logger.info('upload', 'Upload request received', { correlationId, fileName });

            if (!isValidFilename(fileName)) {
                logger.warn('upload', 'Invalid filename rejected', { correlationId, fileName });
                return sendError(reply, 400, 'Filename contains invalid characters or the extension is missing. Only letters (A-Z, a-z), numbers, hyphens, underscores, and spaces are allowed');
            }

            // Authenticate user using JWT
            const token = request.headers.authorization?.split(' ')[1]; // Assumes format: "Bearer <token>"
            if (!token) {
                return sendError(reply, 401, 'Token is missing');
            }

            const authResponse = await authenticateUser(token);
            if (!authResponse.success) {
                logger.warn('upload', 'JWT authentication failed', { correlationId });
                return sendError(reply, 401, 'User authentication failed');
            }
            const authenticatedUsername = authResponse.username;

            const { minIOServerId, minIO } = await getMinIOServerForUpload(correlationId);

            const filenameResponse = await getFilenamesForUser(authenticatedUsername);
            const userFiles = filenameResponse.message;

            const userFileLimit = checkUserFileLimit(userFiles);
            if (!userFileLimit.success) {
                return sendError(reply, 400, 'User has reached the maximum file limit of 10 files');
            }

            const isDuplicate = await checkDuplicateFileName(userFiles, fileName);
            if (isDuplicate) {
                return sendError(reply, 400, 'Filename already exists for this user. Please rename the file and try again');
            }

            await ensureBucketExists(minIO, authenticatedUsername.toLowerCase(), correlationId);

            const etag = await uploadFile(minIO, authenticatedUsername.toLowerCase(), fileName, fileBuffer, fileSize, correlationId);

            const metadata = createFileMetadata(fileName, fileSize, data.mimetype, authenticatedUsername);
            const ownerId = await getAccountId(authenticatedUsername, correlationId);
            await insertFileMetadata(metadata, ownerId, minIOServerId, etag, correlationId);

            logger.info('upload', 'File uploaded successfully', { correlationId, fileName, user: authenticatedUsername });

            return reply.status(200).send({
                success: true,
                etag,
                metadata
            });

        } catch (err) {
            handleError(reply, err, fastify, correlationId);
        }
    });
}
// Check if the filename is valid
const isValidFilename = (filename) => {    
    const validFilenameRegex = /^[a-zA-Z0-9_\-. ]+\.[a-zA-Z0-9]+$/;
    return validFilenameRegex.test(filename);
};

// Send error response
const sendError = (reply, statusCode, message) => {
    return reply.code(statusCode).send({
        success: false,
        message
    });
};

// Handle error
const handleError = (reply, error, fastify, correlationId) => {
    logger.error('upload', 'Unhandled upload error', { correlationId, err: { message: error.message, stack: error.stack } });
    if (!reply.sent) {
        reply.status(500).send({ success: false, error: error.message });
    }
};

// Authenticate user
const authenticateUser = async (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { success: true, message: 'user authenticated in db', username: decoded.username };
    } catch (error) {
        logger.error('upload:authenticateUser', 'JWT verification failed', error);
        return { success: false, message: 'authentication in db failed' };
    }
};

// Get MinIO server for upload
const getMinIOServerForUpload = async (correlationId) => {
    try {
        const minIOResponse = await axios.get(`${process.env.NGINX_API}/minIOServerForUpload`);
        if (!minIOResponse.data.success) {
            throw new Error('MetaDBServer returned no available MinIO server');
        }
        const serverAddress = minIOResponse.data.message[0].address;
        return {
            minIOServerId: minIOResponse.data.message[0].minIOServer_id,
            minIO: minioClient.getMinIOClient(serverAddress)
        };
    } catch (error) {
        logger.error('upload:getMinIOServerForUpload', 'Failed to get MinIO server from MetaDBServer', { correlationId, err: error.message });
        throw new Error('Failed to get MinIO server');
    }
};

// Check if the filename already exists for the user
const getFilenamesForUser = async (username) => {
    const filenameResponse = await axios.get(`${process.env.NGINX_API}/getFilenamesForUsername`, {
        params: { username },
        headers: { 'Content-Type': 'application/json' }
    });
    if(filenameResponse.status === 200) {
        return filenameResponse.data;
    }
}

const checkDuplicateFileName = (files, fileName) => {
    try {
        const fileBaseName = fileName.split('.').slice(0, -1).join('.');
        return files.some(file => file.name === fileBaseName);
    } catch (error) {
        throw new Error('Failed to check duplicate filename');
    }
};

const checkUserFileLimit = (files) => {
    if(files.length >= 10) {
        return {success: false, message: 'User has reached the maximum file limit of 10 files'};
    }else{
        return {success: true, message: 'User has not reached the maximum file limit'};
    }
}

// Ensure bucket exists
const ensureBucketExists = async (minIO, bucketName, correlationId) => {
    try {
        const exists = await minIO.bucketExists(bucketName);
        if (!exists) {
            await minIO.makeBucket(bucketName);
            logger.info('upload:ensureBucketExists', 'Bucket created', { correlationId, bucketName });
        }
    } catch (error) {
        logger.error('upload:ensureBucketExists', 'Failed to ensure bucket exists in MinIO', { correlationId, bucketName, err: error.message });
        throw new Error('Failed to ensure bucket exists');
    }
};

// Upload file to MinIO
const uploadFile = async (minIO, bucketName, fileName, fileBuffer, fileSize, correlationId) => {
    try {
        const uploadStream = new PassThrough();
        uploadStream.end(fileBuffer);

        return new Promise((resolve, reject) => {
            minIO.putObject(bucketName, fileName, uploadStream, fileSize, (err, etag) => {
                if (err) {
                    logger.error('upload:uploadFile', 'MinIO putObject failed', { correlationId, bucketName, fileName, err: err.message });
                    reject(err);
                } else {
                    resolve(etag);
                }
            });
        });
    } catch (error) {
        logger.error('upload:uploadFile', 'Failed to upload file to MinIO', { correlationId, bucketName, fileName, err: error.message });
        throw new Error('Failed to upload file');
    }
};

// Create file metadata
const createFileMetadata = (fileName, fileSize, mimeType, username) => {
    const lastDotIndex = fileName.lastIndexOf('.');
    return {
        name: lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName,
        file_type: lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : '',
        type: mimeType,
        size: fileSize,
        last_modify: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
};

// Get account ID by username
const getAccountId = async (username, correlationId) => {
    try {
        const response = await axios.get(`${process.env.NGINX_API}/getAccountIdByUsername`, {
            params: { username },
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data.account_id;
    } catch (error) {
        logger.error('upload:getAccountId', 'Failed to get account ID from MetaDBServer', { correlationId, username, err: error.message });
        throw new Error('Failed to get account ID');
    }
};

// Insert file metadata into the database
const insertFileMetadata = async (metadata, ownerId, minIOServerId, etag, correlationId) => {
    try {
        const data = {
            type: clientTypes.METADBSERVER,
            message: {
                operation: operationTypes.ADDFILE,
                correlationId,
                data: {
                    etag: etag.etag,
                    name: metadata.name,
                    file_type: metadata.file_type,
                    size: metadata.size,
                    last_modify: metadata.last_modify,
                    owner_id: ownerId,
                    minIOServer: minIOServerId,
                    content_type: metadata.type
                }
            }
        };
        const response = await axios.post(`${process.env.NGINX_API}/addQueue`, data, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.status === 200) {
            logger.info('upload:insertFileMetadata', 'File metadata queued for MetaDBServer', { correlationId, fileName: metadata.name });
        } else {
            throw new Error('Broker returned non-200 status when queuing metadata');
        }
    } catch (error) {
        logger.error('upload:insertFileMetadata', 'Failed to queue file metadata to Broker', { correlationId, err: error.message });
        throw new Error('Failed to insert file metadata');
    }
};

module.exports = upload;
