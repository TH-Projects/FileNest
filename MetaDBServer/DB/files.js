const connection = require('./connection');
const minIOServer = require('./minIOServer');

async function getFiles() {
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'SELECT f.file_id, f.name, f.file_type, f.size, f.last_modify, f.owner_id, a.username ' +
            'FROM File f ' +
            'JOIN Account a ON f.owner_id = a.account_id');
        db.release();
        console.log(JSON.stringify(result));
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

async function getClusterForFile(file_id) {
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'SELECT cluster_location_id ' +
            'FROM File ' +
            'WHERE f.file_id = ?', [file_id]);
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

async function deleteFile(file_id) {
    try {
        const db = await connection.getConnection();
        const [result] = await db.query(
            'DELETE FROM File ' +
            'WHERE file_id = ?', [file_id]);
        db.release();
        return {
            success: true,
            message: result.affectedRows
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error
        };
    }
}

async function addFile(etag, name, file_type, size, last_modify, owner_id, minIOServer) {
    try {
        const minIOServer = minIOServer.getClusterForMinIOServer(minIOServer);
        if (!minIOServer.success){
            return {
                success: false,
                message: minIOServer.message
            };
        }
        const db = await connection.getConnection();
        const [result] = await db.query(
            'INSERT INTO File (etag, name, file_type, size, last_modify, owner_id, cluster_location_id) ' +
            'VALUES (?, ?, ?, ?, ?, ?)', [etag, name, file_type, size, last_modify, owner_id, minIOServer.message[0].cluster_id]);
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
    getFiles,
    getClusterForFile,
    deleteFile,
    addFile
};
