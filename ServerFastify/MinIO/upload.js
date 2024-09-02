const minioClient = require('./MinIOClient');
const axios = require('axios');
const { PassThrough } = require('stream');
require('dotenv').config();
const { clientTypes, operationTypes } = require('./enums');

async function upload(fastify, options) {
    const { stream } = options;

    fastify.post('/upload', async (request, reply) => {
        try {
            const data = request.body.file?.[0];
            const user = JSON.parse(request.body.user);
            const fileName = data.filename;
            const fileBuffer = data.data;
            const fileSize = fileBuffer.length;

            if (!fileSize) {
                return sendError(reply, 400, 'File size is missing or malformed');
            }

            if (!data || !fileName || !fileBuffer) {
                return sendError(reply, 400, 'File data is missing or malformed');
            }

            if (!isValidFilename(fileName)) {
                return sendError(reply, 400, 'Filename contains invalid characters. Only letters, numbers, hyphens, underscores, and spaces are allowed');
            }
            const isAuthenticated = await authenticateUser(user);
            if (!isAuthenticated) {
                return sendError(reply, 401, 'User authentication failed');
            }

            const { minIOServerId, minIO } = await getMinIOServerForUpload();

            const isDuplicate = await checkDuplicateFileName(user.username, fileName);
            if (isDuplicate) {
                return sendError(reply, 400, 'Filename already exists');
            }

            await ensureBucketExists(minIO, user.username.toLowerCase());

            const etag = await uploadFile(minIO, user.username.toLowerCase(), fileName, fileBuffer, fileSize);

            const metadata = createFileMetadata(fileName, fileSize, data.mimetype, user.username);
            const ownerId = await getAccountId(user.username);
            await insertFileMetadata(metadata, ownerId, minIOServerId, etag);

            fastify.log.info('File uploaded successfully:', metadata);

            return reply.status(200).send({
                success: true,
                etag,
                metadata
            });

        } catch (err) {
            console.log(err);
            handleError(reply, err, fastify);
        }
    });
}

// Helper Functions

const isValidFilename = (filename) => {
    const validFilenameRegex = /^[a-zA-Z0-9_\-. ]+$/;
    return validFilenameRegex.test(filename);
};

const sendError = (reply, statusCode, message) => {
    return reply.code(statusCode).send({
        success: false,
        message
    });
};

const handleError = (reply, error, fastify) => {
    fastify.log.error('Upload error:', error);
    if (!reply.sent) {
        reply.status(500).send({ success: false, error: error.message });
    }
};

const authenticateUser = async (user) => {
    try {
        const authResponse = await axios.post('http://nginx/authUser', {
            username: user.username,
            password: user.password
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return authResponse.status === 200;
    } catch (error) {
        throw new Error('Authentication error');
    }
};

const getMinIOServerForUpload = async () => {
    try {
        const minIOResponse = await axios.get(`${process.env.NGINX_API}/minIOServerForUpload`);
        if (!minIOResponse.data.success) {
            throw new Error('Failed to get MinIO server');
        }
        const serverAddress = minIOResponse.data.message[0].address;
        return {
            minIOServerId: minIOResponse.data.message[0].minIOServer_id,
            minIO: minioClient.getMinIOClient(serverAddress)
        };
    } catch (error) {
        throw new Error('Failed to get MinIO server');
    }
};

const checkDuplicateFileName = async (username, fileName) => {
    try {
        const filenameResponse = await axios.get('http://nginx/getFilenamesForUsername', {
            params: { username },
            headers: { 'Content-Type': 'application/json' }
        });

        const fileBaseName = fileName.split('.').slice(0, -1).join('.');
        return filenameResponse.data.message.some(file => file.name === fileBaseName);
    } catch (error) {
        throw new Error('Failed to check duplicate filename');
    }
};

const ensureBucketExists = async (minIO, bucketName) => {
    try {
        const exists = await minIO.bucketExists(bucketName);
        if (!exists) {
            await minIO.makeBucket(bucketName);
        }
    } catch (error) {
        throw new Error('Failed to ensure bucket exists');
    }
};

const uploadFile = async (minIO, bucketName, fileName, fileBuffer, fileSize) => {
    try {
        const uploadStream = new PassThrough();
        uploadStream.end(fileBuffer);

        return new Promise((resolve, reject) => {
            minIO.putObject(bucketName, fileName, uploadStream, fileSize, (err, etag) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(etag);
                }
            });
        });
    } catch (error) {
        throw new Error('Failed to upload file');
    }
};

const createFileMetadata = (fileName, fileSize, mimeType, username) => {
    const lastDotIndex = fileName.lastIndexOf('.');
    return {
        file_id: 0,
        name: lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName,
        file_type: lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : '',
        type: mimeType,
        size: fileSize,
        last_modify: new Date().toISOString().slice(0, 19).replace('T', ' '),
        username: username || null
    };
};

const getAccountId = async (username) => {
    try {
        const response = await axios.get('http://nginx/getAccountIdByUsername', {
            params: { username },
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data.account_id;
    } catch (error) {
        throw new Error('Failed to get account ID');
    }
};

const insertFileMetadata = async (metadata, ownerId, minIOServerId, etag) => {
    try {
        const data = {
            type: clientTypes.METADBSERVER,
            message: {
                operation: operationTypes.ADDFILE,
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
        }
        const response = await axios.post('http://nginx/addQueue', data, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.status === 200) {
            metadata.file_id = response.data.message;
        } else {
            throw new Error('Error inserting metadata into the database');
        }
    } catch (error) {
        throw new Error('Failed to insert file metadata');
    }
};

module.exports = upload;
