const buildUpConnection = require('./buildUpConnection');

// Connection storage
let connection = undefined;

// Set connection
function setConnection (conn) {
    connection = conn;
}

// Remove connection
function removeConnection () {
    connection = undefined;
    buildUpConnection();
}

module.exports = {
    setConnection,
    removeConnection,
    connection
}