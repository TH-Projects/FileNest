const minioClient = require('./MinIOClient');
const { pipeline } = require('stream'); // Import the stream module
const axios = require('axios');

const CHUNK_SIZE = 1024 * 1024;

async function upload(fastify, options) {
    const { fs, stream } = options;
    fastify.post('/upload', async (request, reply) => {
        try {
            const data = request.body.file?.[0]; // Access the first item in the file array, if it exists
            const userString = request.body.user; // user object as string
            const user = JSON.parse(userString); // Parse the user object            

            if (!data) {
                throw new Error('File data is missing or malformed');
            }

            // Authenticate the user
            const authResponse = await axios.post('http://nginx/authUser', {
                username: user.username,
                password: user.password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (authResponse.status !== 200) {
                return reply.code(authResponse.status).send({
                    success: false,
                    message: authResponse.error || 'Login failed'
                });
            }

            // Check if filename has already been used by the user
            const filenameResponse = await axios.get('http://nginx/getFilenamesForUsername', {
                params: {
                    username: user.username
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            let isDuplicate = false;
            filenameResponse.data.message.forEach(file => {
                const lastDotIndex = data.filename.lastIndexOf('.');
                const dataFilename = lastDotIndex === -1 ? data.filename : data.filename.substring(0, lastDotIndex);
                
                if(file.name === dataFilename){
                    isDuplicate = true;
                }
            });

            if(isDuplicate){
                fastify.log.error('Filename already exists');
                return reply.code(400).send({
                    success: false,
                    message: 'Filename already exists'
                });
            }else{
                fastify.log.info('Filename is available');
            }
            
            // Check if the bucket exists, if not create it            
            const bucketName = user.username.toLowerCase();
            const exists = await minioClient.minioClient.bucketExists(bucketName);
            if (!exists) {
                await minioClient.minioClient.makeBucket(bucketName);
            }

            const fileSize = data.data?.length; // Safely access data.length
            if (!fileSize) {
                throw new Error('File size is missing or malformed');
            }

            const fileName = data.filename;
            const uploadStream = new stream.PassThrough();
            const fileBuffer = data.data; // Buffer contains the file data

            // MinIO upload promise
            const uploadPromise = new Promise((resolve, reject) => {
                minioClient.minioClient.putObject(bucketName, fileName, uploadStream, fileSize, (err, etag) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(etag);
                    }
                });
            });

            // Pipeline to pipe data from fileBuffer to uploadStream
            uploadStream.end(fileBuffer);
            fastify.log.info('File uploaded successfully.');

            // Wait for the upload to complete
            const etag = await uploadPromise;
         
            // Create metadata object
            const lastDotIndex = fileName.lastIndexOf('.');
            const metadata = {
                name: lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName, // Name without extension
                file_type: lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : "",
                type: data.mimetype,
                size: fileSize,
                last_modify: new Date().toISOString(), // ISO-8601 format for the current time
                username: user.username || null,
            };            

            // Get Account ID from the database
            const accountResponse = await axios.get('http://nginx/getAccountIdByUsername', {
                params: {
                    username: user.username
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });       
            const owner_id = accountResponse.data.account_id;

            // Insert metadata into the database            
            const insertResponse = await axios.post('http://nginx/addFile', {
                etag: etag.etag,
                name: metadata.name,
                file_type: metadata.file_type,
                size: metadata.size,
                last_modify: metadata.last_modify,
                owner_id: owner_id,
                minIOServer: 2, // set to 2 because function for getting minio server is not implemented
                content_type: metadata.type
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (insertResponse.status !== 200) {
                return reply.code(insertResponse.status).send({
                    success: false,
                    message: insertResponse.error || 'Error inserting metadata into the database'
                });
            }

            return reply.status(200).send({
                success: true,
                etag,
                metadata
            });

        } catch (err) {
            fastify.log.error(err);
            if (!reply.sent) {
                reply.status(500).send({ success: false, error: err.message });
            }
        }
    });
}

module.exports = upload;
