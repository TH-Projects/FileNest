const axios = require('axios');

async function buildUpConnection() {
    console.log('Trying to establish connection');
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let connection = false;
    while (!connection) {
        await sleep(500);
        connection = await connectionCall();
    }
    console.log('Connection established');
}

async function connectionCall() {
    const externalUrl = 'http://nginx:80/couple';
    const data = {
        type: "METADBSERVER",
        url: "ws://servermetadb1:3001"
    };

    try {
        const response = await axios.post(externalUrl, data);
        console.log('Response: ', response.data);
        if (response.data?.couple === 'success') {
            console.log('Connection established (Call)');
            return true;
        }

    } catch (error) {
        console.error(error);
    }
    return false;
}

module.exports = buildUpConnection;