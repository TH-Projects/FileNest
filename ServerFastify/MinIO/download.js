const minioClient = require('./MinIOClient');
const axios = require("axios");
require('dotenv').config();

async function download (fastify) {
    fastify.get('/download', async (request, reply) => {
        const file_id = request.query?.file_id;

        if (!file_id) {          
            console.log('Missing required parameters');
                          
            return reply.code(400).send({
                success: false,
                message: 'Missing required parameters'
            });
        }

        // Get file metadata from the database
        const file = await getFile(file_id);
        if(file === undefined){
            return reply.code(500).send({
                success: false,
                message: 'getFile DB Request failed'
            });
        }
        // Get MinIO-Server where the file is stored
        const minIOServerResultList = await getMinIOServer(file.cluster_location_id);
        if (minIOServerResultList === undefined) {
            return reply.code(500).send({
                success: false,
                message: 'getMinIOServer DB Request failed'
            });
        }
        // Try to read the file from the one of the cluster servers
        for (const minIOServer of minIOServerResultList) {
            try {
                const minIOClient = minioClient.getMinIOClient(minIOServer.address);
                if(!minIOClient){
                    continue;
                }

                // Get the bucket and filename from file data
                const bucketName = file.username.toLowerCase();   
                const fileName = `${file.name}.${file.file_type}`;                     

                // Datei aus dem Bucket lesen und an den Client senden
                await readFile(minIOClient, bucketName, fileName, file.content_type, reply);
                return;
            }
            catch (error){
                console.error(error);
                // TODO: Mark in database as failed
            }
        }
        return reply.status(500).send({
            success: false,
            message: 'Failed to read file from MinIO-Server'
        });
    });
}

async function readFile(minIOClient, bucket, filename, content_type, reply){
    try {
        const dataStream = await minIOClient.getObject(bucket, filename);
        reply.header('Content-Disposition', `attachment; filename="${filename}"`);
        reply.header('Content-Type', content_type);
        return reply.status(200).send(dataStream);
    } catch (err) {
        console.error(err);
        return reply.status(500).send({
            success: false,
            message: 'Failed to read file from MinIO-Server'
        });
    }
}

async function getFile(file_id){
    try {
        const fileResult = await axios.get(`${process.env.NGINX_API}/getFile?file_id=${file_id}`);
        if(!fileResult?.data?.success){
            return undefined;
        }
        return fileResult.data.message;

    } catch (error){
        console.error(error);
        return undefined;
    }
}

async function getMinIOServer(cluster_location_id){
    try {
        const minIOServerResult = await axios.get(`${process.env.NGINX_API}/minIOServer?cluster_id=${cluster_location_id}`);
        if(!minIOServerResult?.data?.success){
            return undefined;
        }
        return minIOServerResult.data.message;

    } catch (error){
        console.error(error);
        return undefined;
    }
}
module.exports = download;