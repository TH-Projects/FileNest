const connection = require('./connection');
const logger = require('../logger');
const defaultRole = 2;

// gets a user by username and password
const getUser = async (username, password) => {
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'SELECT username,password FROM Account WHERE username = ?', [username]
        );
        db.release();
        if(result.length === 0 || result[0].password !== password) {
            return {
                success: false,
                message: 'No user found with that username and password'
            };
        }
        return {
            success: true,
            message: result
        };
    } catch (error) {
        logger.error('DB:user:getUser', 'Database query failed', error);
        return {
            success: false,
            message: error
        };
    }
}

// creates a user with the given username, password and email
const createUser = async (username, password, email) => {
    try {
        const db = await connection.getConnection();
        const userExists = await checkUsername(username);
        if(userExists.length > 0) {
            return {
                success: false,
                message: 'User already exists'
            };
        }
        const result = await db.query(
            'INSERT INTO Account (username, password, email, role_id) ' +
            'VALUES (?, ?, ?, ?)', [username, password, email, defaultRole]
        );
        db.release();
        logger.info('DB:user:createUser', 'User created', { username, insertId: result.insertId });
        return {
            success: true,
            message: result
        };
    } catch (error) {
        logger.error('DB:user:createUser', 'Failed to create user', error);
        return {
            success: false,
            message: error
        }
    }
}

// checks if a user with the given username exists
const checkUsername = async (username) => {
    try {
        const db = await connection.getConnection();
        const userExists = await db.query(
            'SELECT COUNT(*) as count FROM Account WHERE username = ?', [username]
        );
        db.release();
        return userExists[0];
    } catch(error) {
        logger.error('DB:user:checkUsername', 'Database query failed', error);
    }
    return [];
}

// checks if a user with the given email exists
const checkEmail = async (email) => {
    try {
        const db = await connection.getConnection();
        const emailExists = await db.query(
            'SELECT COUNT(*) as count FROM Account WHERE email = ?', [email]
        );
        db.release();
        return emailExists[0];
    } catch(error) {
        logger.error('DB:user:checkEmail', 'Database query failed', error);
    }
    return { count: 0 };
}

// gets the account_id by username
const getAccountIdByUsername = async (username) => {
    try {
        const db = await connection.getConnection();
        const rows = await db.query(
            'SELECT account_id FROM Account WHERE username = ?', [username]
        );
        db.release();
        if (rows.length > 0) {
            return { success: true, message: rows[0].account_id };
        } else {
            return { success: false, message: "No account found for the given username" };
        }
    } catch (error) {
        logger.error('DB:user:getAccountIdByUsername', 'Database query failed', error);
        return { success: false, message: error.message };
    }
}

module.exports = {
    getUser,
    createUser,
    checkUsername,
    checkEmail,
    getAccountIdByUsername,
};
