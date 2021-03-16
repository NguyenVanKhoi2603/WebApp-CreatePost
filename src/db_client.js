var pg = require('pg');
var connectionString = process.env.POSTGRES_URL || "postgres://postgres:postgres@localhost:5432/instagram";
var pgClient = new pg.Client(connectionString);
const accessToken = '1233jk039dc89d00';
module.exports = {
    pgClient,
    accessToken
}





