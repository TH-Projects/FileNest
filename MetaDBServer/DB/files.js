const connection = require('./connection');
const minIOServerReference = require('./minIOServer');

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

async function getFile(file_id){
    try {
        const db = await connection.getConnection();
        let result = await db.query(
            'SELECT f.name, f.file_type, f.size, f.last_modify, f.owner_id, f.cluster_location_id, f.content_type, a.username ' +
            'FROM File f ' +
            'JOIN Account a ON f.owner_id = a.account_id ' +
            'WHERE f.file_id = ?', [file_id]);
        db.release();
        if(result.length > 0){
            result = result[0];
        }
        return {
            success: true,
            message: result
        };
    } catch (error){
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

async function addFile(etag, name, file_type, size, last_modify, owner_id, minIOServer, content_type) {
    try {
        const minIOServerDB = minIOServerReference.getClusterForMinIOServer(minIOServer);
        if (!minIOServerDB.success){
            return {
                success: false,
                message: minIOServerDB.message
            };
        }
        const db = await connection.getConnection();
        const result = await db.query(
            'INSERT INTO File (etag, name, file_type, size, last_modify, owner_id, cluster_location_id, content_type) ' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [etag, name, file_type, size, last_modify, owner_id, minIOServerDB.cluster_location_id ,content_type]);// Replacement needed for cluster_location_id
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
    getFile,
    getClusterForFile,
    deleteFile,
    addFile
};
