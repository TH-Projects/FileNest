const connectionOut = require('./connectionOut');
require('dotenv').config();
const axios = require('axios');
const os = require('os');
const enums = require('./enums');

async function buildUpConnection(fastify) {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let success = false;
    let tries = 0;
    while(!success && tries < 15){
        const waitTime = Math.floor(Math.random() * (1000 - 800 + 1)) + 100;
        await sleep(waitTime);
        success = await coupleCall();
        tries++;
    }
}

async function coupleCall(){
    try {
        await axios.post( 'http://filenest-broker-1:6001/couple', {
            url: 'ws://' + os.hostname() + ':' + process.env.PORT_BROKER,
            type: enums.connectionTypes.BROKER
        });
        return true;
    } catch (e) {
        console.log('Error buildUpConnection');
        return false;
    }
}

module.exports = buildUpConnection;