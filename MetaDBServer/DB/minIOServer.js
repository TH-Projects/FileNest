const connection = require('./connection');

// Get the minIO server for upload based on memory limit and connection status
const getMinIOServerForUpload = async () => {
    try {
        let minIOServer;
        const db = await connection.getConnection();
        const result = await db.query(
            'SELECT cluster_id ' +
            'FROM Cluster ' +
            'WHERE memory_limit_reached = 0'
        );
        db.release();
        if(result.length > 0){
            for(const cluster of result){
                minIOServer = await getMinIOServerByCluster(cluster.cluster_id);
                if(!minIOServer.success){
                    console.log('failed to get minIOServer');
                    continue;
                }
                console.log(JSON.stringify(minIOServer));
                minIOServer = minIOServer.message.filter(server => !server.connection_failure_datetime);
                if(minIOServer.length > 0){
                    return {
                        success: true,
                        message: minIOServer
                    };
                }
            }
        }
        return {
            success: false,
            message: "No cluster available"
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error
        };
    }
}

// Get the minIO server by a cluster
const getMinIOServerByCluster = async (cluster_id) => {
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'SELECT * ' +
            'FROM MinIOServer ' +
            'WHERE cluster_id = ?', [cluster_id]
        );
        db.release();
        return {
            success: true,
            message: result
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error
        };
    }
}

// Get all minIO servers
const getAllMinIOServer = async () => {
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'SELECT m.*, c.memory_limit_reached ' +
            'FROM MinIOServer m ' +
            'INNER JOIN Cluster c ON m.cluster_id = c.cluster_id'
        );
        db.release();
        return {
            success: true,
            message: result
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error
        };
    }
}

// Get the cluster for a minIO server
const getClusterForMinIOServer = async (minIOServer_id) =>{
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'SELECT cluster_id ' +
            'FROM MinIOServer ' +
            'WHERE minIOServer_id = ?', [minIOServer_id]
        );
        db.release();
        return {
            success: true,
            message: result.length > 0 ? result[0] : result
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error
        };
    }
}

// Mark a server as non-reachable
const markNonReachableServer = async (minIOServer_id) => {
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'UPDATE MinIOServer ' +
            'SET connection_failure_datetime = CURRENT_TIMESTAMP ' +
            'WHERE minIOServer_id = ?', [minIOServer_id]
        );
        db.release();
        return {
            success: true,
            message: result.affectedRows > 0 ? "Server marked as non-reachable" : "Server not found"
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error
        };
    }
}

// Update the minIO server
const updateMinIOServer = async (minIOServer_id, active) =>{
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'UPDATE MinIOServer ' +
            'SET connection_failure_datetime = ? ' +
            'WHERE minIOServer_id = ?', [active ? null : new Date(), minIOServer_id]
        );
        db.release();
        return {
            success: true,
            message: result.affectedRows > 0 ? "Server updated successfully" : "Server not found"
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error
        };
    }
}


module.exports = {
    getMinIOServerByCluster,
    getClusterForMinIOServer,
    getMinIOServerForUpload,
    markNonReachableServer,
    getAllMinIOServer,
    updateMinIOServer
}