const connection = require('./connection');
async function addCluster(start_node_id, end_node_id) {
    try {
        const db = await connection.getConnection();
        const [result] = await db.query(
            'INSERT INTO Cluster (start_node_id, end_node_id) ' +
            'VALUES (?,?)', [start_node_id, end_node_id]
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

async function updateMemoryLimit (cluster_id, memory_limit_reached) {
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'UPDATE Cluster ' +
            'SET memory_limit_reached = ? ' +
            'WHERE cluster_id = ?', [memory_limit_reached ? 1 : 0, cluster_id]
        );
        db.release();
        return {
            success: true,
            message: result?.affectedRows > 0 ? 'Memory limit updated' : 'Memory limit not updated'
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
    addCluster
}