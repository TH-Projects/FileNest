const axios = require('axios');
const dotenv = require('dotenv');
const os = require('os');
const logger = require('../logger');

// Build up the connection
async function buildUpConnection() {
    logger.info('buildUpConnection', 'Trying to establish connection to Broker');
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let connection = false;
    while (!connection) {
        await sleep(1000);
        connection = await connectionCall();
    }
    logger.info('buildUpConnection', 'Connection to Broker established');
}

// Connection call
async function connectionCall() {
    dotenv.config();
    const wsUrl = `ws://${os.hostname()}:${process.env.PORT_SERVERFASTIFY}`;
    logger.info('buildUpConnection', 'Registering with Broker via /couple', { wsUrl });
    const data = {
        type: "SERVERFASTIFY",
        url: wsUrl
    };

    try {
        const response = await axios.post(process.env.NGINX_API + "/couple", data);
        if (response.data?.couple === 'success') {
            logger.info('buildUpConnection', 'Broker coupling successful');
            return true;
        }
    } catch (error) {
        logger.warn('buildUpConnection', 'Failed to connect to Broker, retrying', { err: error.message });
    }
    return false;
}

module.exports = buildUpConnection;