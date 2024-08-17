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

module.exports = {
    addCluster
}