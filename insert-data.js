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

    const queryInsertDataUser =
        `INSERT INTO 
            users(username, password) 
        VALUES 
            ('khoinguyen', '123456789')
            ,('nexpando', '123456')
            ,('lananh', '123456789');`;
    const queryInsertDataImage =
        `INSERT INTO 
            image(image) 
        VALUES 
            ('https://images.unsplash.com/photo-1521575107034-e0fa0b594529?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8cG9zdHxlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80')
            ,('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbdw9LKcpum86srHbFcaFLtCpdLEBMkAtADQ&usqp=CAU')
            ,('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbdw9LKcpum86srHbFcaFLtCpdLEBMkAtADQ&usqp=CAU');`;
    const queryInsertDataPost =
        `INSERT INTO 
        post(user_id, title, content, image_id, timestamp) 
    VALUES 
        (1, 'title of post 1', 'content of post 1', 1, '2020-01-08 04:05:06')
        ,(2, 'title of post 2', 'content of post 2', 2, '2019-02-04 04:05:06')
        ,(3, 'title of post 3', 'content of post 3', 3, '2018-05-08 04:05:06');`;

    const queryInsertDataComment =
        `INSERT INTO 
        comment(user_id, post_id, content, timestamp) 
    VALUES 
        (1, 1, 'comment of post 1', '2020-01-08 04:05:06')
        ,(2, 2, 'comment of post 2', '2020-01-08 04:05:06')
        ,(3, 2, 'comment of post 2 1', '2020-01-08 04:05:06')
        ,(1, 2, 'comment of post 2 2', '2020-01-08 04:05:06')
        ,(1, 2, 'comment of post 2 3', '2020-01-08 04:05:06')
        ,(3, 3, 'comment of post 3', '2020-01-08 04:05:06');`;

    await pgClient.query(queryInsertDataUser)
    await pgClient.query(queryInsertDataImage)
    await pgClient.query(queryInsertDataPost)
    await pgClient.query(queryInsertDataComment)

    console.log('============= Insert done =============>');

}

async function start() {
    try {
        await createTables()
        process.exit
    } catch (error) {
        console.log(error);
    }

}

start()
