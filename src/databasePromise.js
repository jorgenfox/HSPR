const mysql = require('mysql2/promise')
const dbConfig = require('../../dbConfig'); 

const pool = mysql.createPool({
    host: dbConfig.configData.host,
    user: dbConfig.configData.user,
    password: dbConfig.configData.password,
    database: dbConfig.configData.database,
    connectionLimit: 10 
});

pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the HSPR database');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.message);
    });

module.exports = pool;