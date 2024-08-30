const Minio = require("minio");
require('dotenv').config();

const getMinIOClient = (address) =>{
    const addressSplit = address.split(':')
    return new Minio.Client({
        endPoint: addressSplit[0],
        port: parseInt(process.env.PORT_MINIO, 10),
        useSSL: false,
        accessKey: process.env.MINIO_USER,
        secretKey: process.env.MINIO_USER_ACCESS_KEY
    });
}
const minioClient = new Minio.Client({
    endPoint: 'minio1',
    port: parseInt(process.env.MINIO_SERVER_PORT, 10),
    useSSL: false,
    accessKey: process.env.MINIO_USER,
    secretKey: process.env.MINIO_USER_ACCESS_KEY
});
module.exports = {
    getMinIOClient,
    minioClient
};