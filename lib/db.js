const { Pool } = require('pg');

const connectionString = process.env.PURUBOY_PG_URL;

let pool;

if (!pool) {
    pool = new Pool({
        connectionString,
    });
}

module.exports = pool;