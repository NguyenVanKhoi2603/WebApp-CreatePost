const db_client = require('./db_client.js');
var pgClient = db_client.pgClient;
pgClient.connect();

const createTables = async () => {
    const queryCreateTableUser =
        `CREATE TABLE IF NOT EXISTS
        users(
            id SERIAL PRIMARY KEY,
            username varchar(24) UNIQUE,
            password varchar(24)
        )`;

    const queryCreateTableImage =
        `CREATE TABLE IF NOT EXISTS
        image(
            id SERIAL PRIMARY KEY,
            image varchar(255)
        )`;

    const queryCreateTablePost =
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

    const queryCreateTableComment =
        `CREATE TABLE IF NOT EXISTS
        comment(
            id SERIAL PRIMARY KEY,
            user_id SERIAL,
            post_id SERIAL,
            content text,
            timestamp timestamp,
            CONSTRAINT fk_comment_users 
                FOREIGN KEY(user_id) 
                    REFERENCES users(id),
            CONSTRAINT fk_comment_post 
                FOREIGN KEY(post_id) 
                    REFERENCES post(id)
                    )`;

    await pgClient.query(queryCreateTableUser)
    await pgClient.query(queryCreateTableImage)
    await pgClient.query(queryCreateTablePost)
    await pgClient.query(queryCreateTableComment)
    console.log('============= Create table done =============>')
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
