const checkServer = require('./checkServer');
const getMinIOServer = require('./getMinIOServer');
const axios = require("axios");

const scheduleTasks = async () => {
    const minIOServer = await getMinIOServer();
    if(minIOServer.success) {
        for(const server of minIOServer.message) {
            const result = await checkServer.checkServer(server.address);
            if(result.success) {
                await handleServerChange(true, server);
                await handleSpace(server, result.usagePercentage);
            } else {
                await handleServerChange(false, server);
            }
        }
    }
}

const handleServerChange = async (active, server) => {
    const serverActive = server.connection_failure_datetime === null;
    if(!(active === serverActive)){
        const response = await axios.post(process.env.NGINX_API + '/updateMinIOServer', {
            minIOServer_id: server.minIOServer_id,
            active: active
        });
        if(!response.data.success){
            console.log(response.data.message);
        }
    }
}

const handleSpace = async (server, usagePercentage) => {
    const memory_limit_reached = server.memory_limit_reached === 0;
    const serverSpace = usagePercentage > 10;
    if(!(serverSpace === memory_limit_reached)){
        const response = await axios.post(process.env.NGINX_API + '/updateMemoryLimit', {
            cluster_id: server.cluster_id,
            memory_limit_reached: serverSpace
        });
        if(!response.data.success){
            console.log(response.data.message);
        }
    }

}

module.exports = scheduleTasks;