const connection = require('./connection');

async function getMinIOServerForUpload(){
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'SELECT cluster_id ' +
            'FROM Cluster ' +
            'WHERE memory_limit_reached = 0'
        );
        db.release();
        if(result.length > 0){
            return await getMinIOServerByCluster(result[0].cluster_id);
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

async function addMinIOServer(address, cluster_id) {
    try {
        const db = await connection.getConnection();
        const [result] = await db.query(
            'INSERT INTO MinIOServer (address, cluster_id) ' +
            'VALUES (?,?)', [address, cluster_id]
        );
        db.release();
        return {
            success: true,
            message: result.insertId
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error
        };
    }
}

async function getMinIOServerByCluster(cluster_id) {
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

async function getClusterForMinIOServer(minIOServer_id) {
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

module.exports = {
    addMinIOServer,
    getMinIOServerByCluster,
    getClusterForMinIOServer,
    getMinIOServerForUpload
}