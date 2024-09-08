const connection = require('./connection');
const minIOServerReference = require('./minIOServer');

// Get all files
const getFiles = async () => {
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'SELECT f.file_id, f.name, f.file_type, f.size, f.last_modify, f.content_type, a.username ' +
            'FROM File f ' +
            'JOIN Account a ON f.owner_id = a.account_id');
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

// Get all filenames for a given username
const getFilenamesForUsername = async (username) => {
    try {
        const db = await connection.getConnection();
        let result = await db.query(
            'SELECT f.name, a.username ' +
            'FROM File f ' +
            'JOIN Account a ON f.owner_id = a.account_id ' +
            'WHERE a.username = ?', [username]);
        db.release();        
        if(result.length > 0){
            result = result;
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

// Get a file by its ID
const getFile = async (file_id) =>{
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

// Get the cluster location for a file
const getClusterForFile = async (file_id) => {
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

// Delete a file by its ID
const deleteFile = async (file_id) => {
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'DELETE FROM File WHERE file_id = ?', [file_id]
        );
        db.release();
        return {
            success: true,
            message: `Deleted ${result.affectedRows} record(s)`
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error
        };
    }
}

// Add a file to the database
const addFile = async (etag, name, file_type, size, last_modify, owner_id, minIOServer, content_type) => {
    try {
        // Get the appropriate MinIO server cluster
        const minIOServerDB = await minIOServerReference.getClusterForMinIOServer(minIOServer);
        if (!minIOServerDB.success){
            return {
                success: false,
                message: minIOServerDB.message
            };
        }
        const db = await connection.getConnection();
        const result = await db.query(
            'INSERT INTO File (etag, name, file_type, size, last_modify, owner_id, cluster_location_id, content_type) ' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [etag, name, file_type, size, last_modify, owner_id, minIOServerDB.message.cluster_id ,content_type]
        );
        db.release();
        console.log('Added file', result.insertId);
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
    addFile,
    getFilenamesForUsername
};
