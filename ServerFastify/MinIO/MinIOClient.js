const Minio = require("minio");
require('dotenv').config();
const minioClient = new Minio.Client({
    endPoint: 'minio1',
    port: parseInt(process.env.MINIO_SERVER_PORT, 10),
    useSSL: false,
    accessKey: process.env.MINIO_USER,
    secretKey: process.env.MINIO_USER_ACCESS_KEY
});
console.log(minioClient.listObjectsV2('test', '', true));
module.exports = minioClient;