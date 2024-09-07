const buildUpConnection = require('./buildUpConnection');

// Store the connection
let connection = undefined;

// Set the connection
function setConnection (conn) {
    connection = conn;
}

// Remove the connection
function removeConnection () {
    connection = undefined;
    buildUpConnection();
}

module.exports = {
    setConnection,
    removeConnection,
    connection
}