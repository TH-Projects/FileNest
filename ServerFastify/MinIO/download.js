const minioClient = require('./MinIOClient');
const axios = require("axios");
const nginx = "http://nginx:80/"

async function download (fastify) {
    fastify.get('/download', async (request, reply) => {
        const file_id = request.query?.file_id;
        if(!file_id){
            return reply.code(400).send('file_id not provided');
        }
        const file = await getFile(file_id);
        if(file === undefined){
            return reply.code(500).send('getFile DB Request failed');
        }
        const minIOServerResultList = await getMinIOServer(file.cluster_location_id);
        if(minIOServerResultList === undefined){
            return reply.code(500).send('getMinIOServer DB Request failed');
        }

        for (const minIOServer of minIOServerResultList){
            try {
                console.log(minIOServer);
                const minIOClient = minioClient.getMinIOClient(minIOServer.address);
                if(!minIOClient){
                    continue;
                }
                await readFile(minIOClient, file.username, file.name, file.content_type, reply);
                return;
            }
            catch (error){
                console.log(error);
                //TODO: in DB als fehlgeschlagen markieren
            }
        }
        return reply.code(500).send('No MinIO Server available');
    });
}

async function readFile(minIOClient, bucket, filename, content_type, reply){
    try {
        const dataStream = await minIOClient.getObject(bucket, filename);
        reply.header('Content-Disposition', `attachment; filename="${filename}"`);
        reply.header('Content-Type', content_type);
        return reply.send(dataStream);
    } catch (err) {
        console.log.error(err);
        return reply.status(500).send(err.message);
    }
}

async function getFile(file_id){
    try {
        const fileResult = await axios.get(nginx + `getFile?file_id=${file_id}`);
        if(!fileResult?.data?.success){
            return undefined;
        }
        return fileResult.data.message;

    } catch (error){
        console.log(error);
        return undefined;
    }
}

async function getMinIOServer(cluster_location_id){
    try {
        const minIOServerResult = await axios.get(nginx + `minIOServer?cluster_id=${cluster_location_id}`)
        if(!minIOServerResult?.data?.success){
            return undefined;
        }
        return minIOServerResult.data.message;

    } catch (error){
        console.log(error);
        return undefined;
    }
}
module.exports = download;