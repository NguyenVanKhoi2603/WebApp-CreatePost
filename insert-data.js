const application = require('express');
var pg = require('pg');
var connectionString = process.env.POSTGRES_URL || "postgres://postgres:postgres@localhost:5433/dbpost";
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
        `INSERT INTO 
            users(username, password) 
        VALUES 
            ('khoinguyen', '123456789')
            ,('nexpando', '123456')
            ,('lananh', '123456789');`;
    const queryText2 =
        `INSERT INTO 
            image(image) 
        VALUES 
            ('image1')
            ,('image2')
            ,('image3');`;
    const queryText3 =
        `INSERT INTO 
        post(user_id, title, content, image_id, timestamp) 
    VALUES 
        (1, 'title of post 1', 'content of post 1', 1, '2021-01-08 04:05:06')
        ,(2, 'title of post 2', 'content of post 2', 2, '2021-02-04 04:05:06')
        ,(3, 'title of post 3', 'content of post 3', 3, '2021-05-08 04:05:06');`;

    await pgClient.query(queryText)
    await pgClient.query(queryText2)
    await pgClient.query(queryText3)

    console.log('====insert done===')

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
