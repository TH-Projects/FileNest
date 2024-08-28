const connection = require('./connection');
const defaultRole = 2;

async function getUser(username, password) {
    console.log(`getUser: ${username}, ${password}`);
    
    try {
        const db = await connection.getConnection();
        const result = await db.query(
            'SELECT username,password FROM Account WHERE username = ?', [username]
        );
        db.release();
        console.log(JSON.stringify(result));
        
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
        console.error(error);
        return {
            success: false,
            message: error
        };
    }
}

async function createUser(username, password, email) {
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
        console.log(JSON.stringify(result));
        return {
            success: true,
            message: result
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error
        }
    }
}

async function checkUsername(username){
    try {
        const db = await connection.getConnection();
        const userExists = await db.query(
            'SELECT COUNT(*) as count FROM Account WHERE username = ?', [username]
        );
        db.release();
        return userExists[0]; // Rückgabe des gesamten Ergebnisses, das Array ist
    } catch(error) {
        console.error(error);
    }
    return [];
}

async function checkEmail(email) {    
    try {
        const db = await connection.getConnection();
        const emailExists = await db.query(
            'SELECT COUNT(*) as count FROM Account WHERE email = ?', [email]
        );
        db.release();
        return emailExists[0];
    } catch(error) {
        console.error(error);
    }
    return { count: 0 };
}


module.exports = {
    getUser,
    createUser,
    checkUsername,
    checkEmail
};
