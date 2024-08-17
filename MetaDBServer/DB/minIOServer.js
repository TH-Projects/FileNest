const connection = require('./connection');

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

module.exports = {
    addMinIOServer,
    getMinIOServerByCluster
}