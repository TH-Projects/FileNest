const connection = require('./connection');
async function getBucketForFile(etag, owner_id) {
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'SELECT c.name AS Cluster, minio.name AS MinIOServer ' +
            'FROM File f ' +
            'JOIN Cluster c ON c.cluster_id = f.cluster_location_id ' +
            'JOIN ServerCluster sc ON sc.cluster_id = c.cluster_id ' +
            'JOIN MinIOServer minio ON minio.minIOServer_id = sc.minIOServer_id ' +
            'WHERE f.etag = ? AND f.owner_id = ?', [etag, owner_id]

        );
        db.release();
        return result[0];
    } catch (error) {
        console.error(error);
        return error;
    }
}

module.exports = {
    getBucketForFile
}