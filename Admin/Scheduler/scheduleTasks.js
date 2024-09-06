const checkServer = require('./checkServer');
const getMinIOServer = require('./getMinIOServer');
const axios = require("axios");

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
                await handleServerChange(false, server);
            }
        }
    }
}

//updates the server status in the MetaDB
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

//updates the memory limit reached status in the MetaDB
const handleSpace = async (server, usagePercentage) => {
    const memory_limit_reached = server.memory_limit_reached === 1;
    const serverSpace = usagePercentage > 95;
    console.log(memory_limit_reached, serverSpace);
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