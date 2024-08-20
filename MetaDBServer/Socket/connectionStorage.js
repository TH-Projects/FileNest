const buildUpConnection = require('./buildUpConnection');

let connection = undefined;

function setConnection (conn) {
    connection = conn;
}

function removeConnection () {
    connection = undefined;
    buildUpConnection();
}

module.exports = {
    setConnection,
    removeConnection,
    connection
}