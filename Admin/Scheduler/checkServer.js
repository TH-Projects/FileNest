const axios = require("axios");

async function checkServer(server)  {
    try {
        const response = await axios.get(`http://${server}:9000/minio/metrics/v3/cluster/health`)
        const metrics = response.data;
        const usableTotalBytes = parseFloat(metrics.match(/minio_cluster_health_capacity_usable_total_bytes (\d+\.\d+e\+\d+)/)[1]);
        const usableFreeBytes = parseFloat(metrics.match(/minio_cluster_health_capacity_usable_free_bytes (\d+\.\d+e\+\d+)/)[1]);
        const usedUsableBytes = usableTotalBytes - usableFreeBytes;
        const usagePercentage = (usedUsableBytes / usableTotalBytes) * 100;
        return {
            success: true,
            usagePercentage: usagePercentage
        }
    }catch (error) {
        console.error(error);
    }
    return {
        success: false,
        message: "Failed to check server"
    };

}

module.exports = {
    checkServer
};