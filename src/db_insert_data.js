const db_client = require('./db_client.js');
var pgClient = db_client.pgClient;
pgClient.connect();

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
            ('Not Found!')
            ,('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHcoe0Uv3-3H-27b6jqawPzr4j1FvdhWtzCg&usqp=CAU')
            ,('https://images.ctfassets.net/hrltx12pl8hq/7yQR5uJhwEkRfjwMFJ7bUK/dc52a0913e8ff8b5c276177890eb0129/offset_comp_772626-opt.jpg?fit=fill&w=800&h=300')
            ,('https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg');`;

    const queryInsertDataPost =
        `INSERT INTO 
        post(user_id, title, content, image_id, timestamp) 
    VALUES 
        (1, 'title of post 1', 'content of post 1', 1, '2020-01-08 04:05:06')
        ,(2, 'title of post 2', 'content of post 2', 2, '2019-02-04 04:05:06')
        ,(3, 'title of post 3', 'content of post 3', 3, '2018-05-08 04:05:06')
        ,(2, 'title of post 3', 'content of post 3', 1, '2018-05-08 04:05:06');`;

    await pgClient.query(queryInsertDataUser)
    await pgClient.query(queryInsertDataImage)
    await pgClient.query(queryInsertDataPost)
    await pgClient.query(queryInsertDataComment)
    console.log('============= Insert done =============>');
}

async function create() {
    try {
        await createTables()
        process.exit
    } catch (error) {
        console.log(error);
    }
}

create()
