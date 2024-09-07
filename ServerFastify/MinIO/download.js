const minioClient = require('./MinIOClient');
const axios = require('axios');
require('dotenv').config();
const {clientTypes, operationTypes} = require('./enums');

// Download a file
const download = async (fastify) => {
  fastify.get('/download', async (request, reply) => {
    const { file_id } = request.query || {};

    if (!file_id) {
      return reply.code(400).send({
        success: false,
        message: 'Missing required parameters'
      });
    }

    try {
      // Get file metadata from the database
      const file = await getFile(file_id);      
      if (!file) {        
        return reply.code(500).send({
          success: false,
          message: 'Failed to get file metadata'
        });
      }

      // Get MinIO servers where the file is stored
      const minIOServers = await getMinIOServers(file.cluster_location_id);
      if (!minIOServers) {
        return reply.code(500).send({
          success: false,
          message: 'Failed to get MinIO servers'
        });
      }

      // Try to read the file from one of the cluster servers
      for (const minIOServer of minIOServers) {
        try {
          const minIOClientInstance = minioClient.getMinIOClient(minIOServer.address);
          if (!minIOClientInstance) {
            continue;
          }

          const bucketName = file.username.toLowerCase();
          const fileName = `${file.name}.${file.file_type}`;

          // Read file from the bucket and send to the client
          return await readFile(minIOClientInstance, bucketName, fileName, file.content_type, reply);
        } catch (error) {
          console.error(`Error reading file from MinIO server ${minIOServer.address}:`, error);
          await markNonReachableServer(minIOServer);
        }
      }

      return reply.status(500).send({
        success: false,
        message: 'Failed to read file from all servers. Please refresh your browser and try again, because it could be deleted by the owner' 
      });
    } catch (error) {
      console.error('Error handling download request:', error);
      return reply.status(500).send({
        success: false,
        message: 'An unexpected error occurred'
      });
    }
  });
}

// Read file from MinIO and send to the client
const readFile = async (minIOClient, bucketName, fileName, contentType, reply) => {
  try {
    const dataStream = await minIOClient.getObject(bucketName, fileName);
    reply.header('Content-Disposition', `attachment; filename="${fileName}"`);
    reply.header('Content-Type', contentType);
    return reply.status(200).send(dataStream);
  } catch (err) {
    console.error('Error sending file:', err);
    return reply.status(500).send({
      success: false,
      message: 'Failed to send file from MinIO server'
    });
  }
}

// Get file metadata from the database
const getFile = async (fileId) => {
  try {
    const response = await axios.get(`${process.env.NGINX_API}/getFile`, {
      params: { file_id: fileId }
    });
    if (response.data.success) {
      return response.data.message;
    }
    return null;
  } catch (error) {
    console.error('Error fetching file metadata:', error.response.data);
    return null;
  }
}

// Mark a MinIO server as non-reachable
const markNonReachableServer = async (minIOServer) =>{
    try {
        const data = {
            type: clientTypes.METADBSERVER,
            message: {
                operation: operationTypes.MARK_NON_REACHABLE_SERVER,
                data: {
                    minIOServer_id: minIOServer.minIOServer_id
                }
            }
        }
        await axios.post(process.env.NGINX_API + `/addQueue`, data);
    } catch (error){
        console.log(error);
    }
}

// Get MinIO servers where the file is stored
const getMinIOServers = async (clusterLocationId) => {
  try {
    const response = await axios.get(`${process.env.NGINX_API}/minIOServer`, {
      params: { cluster_id: clusterLocationId }
    });
    if (response.data.success) {
      return response.data.message;
    }
    return null;
  } catch (error) {
    console.error('Error fetching MinIO servers:', error);
    return null;
  }
}

module.exports = download;
