const { Pool } = require("pg/lib");

/**
 * Custom Object defining the connection to the Database.
 * 
 * @property {String} user - Owner's username.
 * @property {String} host - Owner's host provided by AlwaysData.
 * @property {String} database - Name of the Database.
 * @property {String} password - Password.
 * @property {Number} port - Port used.
 */
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: 5432,
});

console.log(`Connected to Database: ${process.env.DB_NAME}`);
module.exports = pool; 