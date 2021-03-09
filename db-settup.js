const application = require('express');
var pg = require('pg');
var connectionString = process.env.POSTGRES_URL || "postgres://postgres:postgres@localhost:5433/dbpost";
console.log('======', connectionString)
var pgClient = new pg.Client(connectionString);
try {
    pgClient.connect();
} catch (e) {
    console.log('eeee', e)
}


// pgCl.connect();
// var connect = connect2.pgClient.connect();
const createTables = async () => {

    const queryText =
        `CREATE TABLE IF NOT EXISTS
        users(
            id SERIAL PRIMARY KEY,
            username varchar(24) UNIQUE,
            password varchar(24)
        )`;
    const queryText2 =
        `CREATE TABLE IF NOT EXISTS
        image(
            id SERIAL PRIMARY KEY,
            image varchar(255)
        )`;
    const queryText3 =
        `CREATE TABLE IF NOT EXISTS
        post(
            id SERIAL PRIMARY KEY,
            user_id SERIAL,
            title text,
            content text,
            image_id SERIAL,
            timestamp timestamp,
            CONSTRAINT fk_user 
                FOREIGN KEY(user_id) 
                    REFERENCES users(id),
            CONSTRAINT fk_image 
                FOREIGN KEY(image_id) 
                    REFERENCES image(id)
                    )`;

    await pgClient.query(queryText)
    await pgClient.query(queryText2)
    await pgClient.query(queryText3)

    console.log('====Create table done===')
    // pgClient.query(queryText)
    //     .then((res) => {
    //         console.log(res);
    //         client.pgClient.query(queryText2)
    //             .then((res) => {
    //                 console.log(res);

    //                 pgClient.query(queryText3)
    //                     .then((res) => {
    //                         console.log(res);
    //                         pgClient.end();
    //                     })
    //                     .catch((err) => {
    //                         console.log(err);
    //                         pgClient.end();
    //                     });
    //             })
    //             .catch((err) => {
    //                 console.log(err);
    //                 pgClient.end();
    //             });
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //         pgClient.end();
    //     });


}

async function start() {
    try {
        console.log('=====')
        await createTables()
        process.exit
    } catch (error) {
        console.log(error);
    }

}

start()
