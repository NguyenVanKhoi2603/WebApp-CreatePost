var pg = require('pg');
var connectionString = process.env.POSTGRES_URL || "postgres://postgres:postgres@localhost:5433/dbpost";
var pgClient = new pg.Client(connectionString);
pgClient.connect();

class Client {

    pgClient

    connect() {
        try {
            this.pgClient = new Client(connectionString)
            this.pgClient.connect()
        } catch (er) {
            console.log('error', er)
        }
    }

    disconnect() {
        try {
            this.pgClient.disconnect()
        } catch (er) {
            console.log('error', er)
        }
    }
}

module.exports = {
    Client
}