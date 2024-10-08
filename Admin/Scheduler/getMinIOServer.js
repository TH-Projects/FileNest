const axios = require('axios');
require('dotenv').config();

//fetches all MinIO servers from the MetaDB
const getMinIOServer = async () => {
    try {
        const response = await axios.get(`${process.env.NGINX_API}/allMinIOServer`);
        return response.data;
    } catch (error) {
        console.error(error);
    }
    return {
        success: false
    }
}

module.exports = getMinIOServer;