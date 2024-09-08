require('dotenv').config();
const axios = require('axios');
const os = require('os');
const enums = require('./enums');
const queue = require('../Queue/queue');

// Build up the connection to other brokers
const buildUpConnection = async() => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let success = false;
    let tries = 0;
    while(!success && tries < 15){
        const waitTime = Math.floor(Math.random() * (1000 - 800 + 1)) + 100;
        await sleep(waitTime);
        success = await coupleCall('http://filenest-broker-1:6001/couple');
        tries++;
    }
    tries = 0;
    while(!success && tries < 15){
        const waitTime = Math.floor(Math.random() * (1000 - 800 + 1)) + 100;
        await sleep(waitTime);
        success = await coupleCall('http://nginx/couple');
        tries++;
    }
}

// Call the couple endpoint
const coupleCall = async (url) =>{
    try {
        const response = await axios.post( url, {
            url: 'ws://' + os.hostname() + ':' + process.env.PORT_BROKER,
            type: enums.connectionTypes.BROKER
        });
        if(response.data.couple === 'success'){
            queue.queue = response.data.data;
            return true;
        }
        return false;
    } catch (e) {
        console.log('Error buildUpConnection');
        return false;
    }
}

module.exports = buildUpConnection;