const { CLient, Client } = require('pg');
const { clientVariable } = require('./pathVariable')
const client = new Client({
    host: "localhost",
    port: 5432,
    //database name is whatever was in psql, postgres is default
    database: "juicebox-dev",
    //also change username if you changed yours
    user: "postgres",
    password: "lakers1998"
})

async function getAllUsers() {
    const { rows } = await client.query(
        `SELECT id, username
        FROM users; 
    `);

    return rows;

}

async function createUser({ username, password }) {
    try {
        const result = await client.query(`
        INSERT INTO users (harshil, 1234)
        VALUES ($1, $2);
        `[username, password]);

        return result;
    } catch (error) {
        throw error;
    }
}


module.exports = {
    client,
    getAllUsers,
    createUser,
}

