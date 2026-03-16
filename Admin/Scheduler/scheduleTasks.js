const checkServer = require('./checkServer');
const getMinIOServer = require('./getMinIOServer');
const axios = require("axios");
const logger = require('../logger');

//schedules the tasks to check the MinIO servers
const scheduleTasks = async () => {
    const minIOServer = await getMinIOServer();
    if(minIOServer.success) {
        for(const server of minIOServer.message) {
            const result = await checkServer.checkServer(server.address);
            if(result.success) {
                await handleServerChange(true, server);
                await handleSpace(server, result.usagePercentage);
            } else {
                logger.warn('scheduleTasks', `MinIO server unreachable: ${server.address}`, { minIOServer_id: server.minIOServer_id });
                await handleServerChange(false, server);
            }
        }
    }
}

//updates the server status in the MetaDB
const handleServerChange = async (active, server) => {
    const serverActive = server.connection_failure_datetime === null;
    if(!(active === serverActive)){
        try {
            const response = await axios.post(process.env.NGINX_API + '/updateMinIOServer', {
                minIOServer_id: server.minIOServer_id,
                active: active
            });
            if(!response.data.success){
                logger.error('scheduleTasks:handleServerChange', 'Failed to update MinIO server status in MetaDBServer', { minIOServer_id: server.minIOServer_id, active, detail: response.data.message });
            } else {
                logger.info('scheduleTasks:handleServerChange', `MinIO server status updated to active=${active}`, { minIOServer_id: server.minIOServer_id });
            }
        } catch (error) {
            logger.error('scheduleTasks:handleServerChange', 'HTTP call to MetaDBServer failed', { minIOServer_id: server.minIOServer_id, err: error.message });
        }
    }
}

//updates the memory limit reached status in the MetaDB
const handleSpace = async (server, usagePercentage) => {
    const memory_limit_reached = server.memory_limit_reached === 1;
    const serverSpace = usagePercentage > 95;
    if(!(serverSpace === memory_limit_reached)){
        try {
            const response = await axios.post(process.env.NGINX_API + '/updateMemoryLimit', {
                cluster_id: server.cluster_id,
                memory_limit_reached: serverSpace
            });
            if(!response.data.success){
                logger.error('scheduleTasks:handleSpace', 'Failed to update memory limit in MetaDBServer', { cluster_id: server.cluster_id, serverSpace, detail: response.data.message });
            } else {
                logger.info('scheduleTasks:handleSpace', `Memory limit status updated to ${serverSpace}`, { cluster_id: server.cluster_id, usagePercentage });
            }
        } catch (error) {
            logger.error('scheduleTasks:handleSpace', 'HTTP call to MetaDBServer failed', { cluster_id: server.cluster_id, err: error.message });
        }
    }

}

module.exports = scheduleTasks;