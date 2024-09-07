const buildUpConnection = require('./buildUpConnection');

// Store the connection
let connection = undefined;

// Set the connection
const setConnection = (conn) => {
    connection = conn;
}

// Remove the connection
const removeConnection = () => {
    connection = undefined;
    buildUpConnection();
}

module.exports = {
    setConnection,
    removeConnection,
    connection
}