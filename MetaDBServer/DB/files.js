const fastify = require('fastify')({ logger: true });
const connection = require('./connection');
async function getFiles() {
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'SELECT f.file_id, f.name, f.file_type, f.size, f.last_modify, a.username ' +
            'FROM File f ' +
            'JOIN Account a ON f.owner_id = a.account_id');
        db.release();
        console.log(JSON.stringify(result));
        return result;
    } catch (error) {
        console.error(error);
        return error;
    }
}

module.exports = {
    getFiles
};
