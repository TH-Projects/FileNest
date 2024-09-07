const axios = require('axios');
const dotenv = require('dotenv');
const os = require('os');

// Build up the connection to the broker
async function buildUpConnection() {
    console.log('Trying to establish connection');
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let connection = false;
    while (!connection) {
        await sleep(1000);
        connection = await connectionCall();
    }
    console.log('Connection established');
}

// Call the broker to establish connection
async function connectionCall() {
    dotenv.config();
    const data = {
        type: "METADBSERVER",
        url: `ws://${os.hostname()}:${process.env.PORT_SERVERMETADB}`
    };

    try {
        const response = await axios.post(process.env.NGINX_API + "/couple", data);
        console.log('Response: ', response.data);
        if (response.data?.couple === 'success') {
            console.log('Connection established (Call)');
            return true;
        }

    } catch (error) {
        console.log('Error when connecting to the broker. Retry after delay');
    }
    return false;
}

module.exports = buildUpConnection;