const minioClient = require('./MinIOClient');
const axios = require('axios');
const { PassThrough } = require('stream');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { clientTypes, operationTypes } = require('./enums');

const JWT_SECRET = process.env.JWT_SECRET;  // Key saved in .env file

async function upload(fastify, options) {
    fastify.post('/upload', async (request, reply) => {        
        try {            
            const data = request.body.file?.[0];
            const fileName = data.filename;
            const fileBuffer = data.data;
            const fileSize = fileBuffer.length;            

            if (!data || !fileName || !fileBuffer || !fileSize) {
                return sendError(reply, 400, 'File data is missing or malformed');
            }

            if (!isValidFilename(fileName)) {                
                return sendError(reply, 400, 'Filename contains invalid characters. Only letters (A-Z, a-z), numbers, hyphens, underscores, and spaces are allowed');
            }

            // Authenticate user using JWT
            const token = request.headers.authorization?.split(' ')[1]; // Assumes format: "Bearer <token>"
            if (!token) {
                return sendError(reply, 401, 'Token is missing');
            }            

            const authResponse = await authenticateUser(token);
            if (!authResponse.success) {                
                return sendError(reply, 401, 'User authentication failed');
            }
            const authenticatedUsername = authResponse.username;

            const { minIOServerId, minIO } = await getMinIOServerForUpload();

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

            await ensureBucketExists(minIO, authenticatedUsername.toLowerCase());

            const etag = await uploadFile(minIO, authenticatedUsername.toLowerCase(), fileName, fileBuffer, fileSize);

            const metadata = createFileMetadata(fileName, fileSize, data.mimetype, authenticatedUsername);
            const ownerId = await getAccountId(authenticatedUsername);
            await insertFileMetadata(metadata, ownerId, minIOServerId, etag);

            fastify.log.info('File uploaded successfully:', metadata);

            return reply.status(200).send({
                success: true,
                etag,
                metadata
            });

        } catch (err) {
            handleError(reply, err, fastify);
        }
    });
}

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

const authenticateUser = async (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);        
        return { success: true, message: 'user authenticated in db' , username: decoded.username}; // Return user data
    } catch (error) {
        console.error('JWT authentication error:', error);
        return {success: false, message: 'authentication in db failed'}; // Token is invalid or expired
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

const getFilenamesForUser = async (username) => {
    const filenameResponse = await axios.get('http://nginx/getFilenamesForUsername', {
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
        name: lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName,
        file_type: lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : '',
        type: mimeType,
        size: fileSize,
        last_modify: new Date().toISOString().slice(0, 19).replace('T', ' ')
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
            console.log('File metadata inserted successfully');
        } else {
            throw new Error('Error inserting metadata into the database');
        }
    } catch (error) {
        throw new Error('Failed to insert file metadata');
    }
};

module.exports = upload;
