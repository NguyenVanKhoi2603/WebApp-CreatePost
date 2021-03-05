var pg = require('pg');
var jade = require('jade');
var connectionString = "postgres://macintoshhd@localhost/dbPost";
var pgClient = new pg.Client(connectionString);
pgClient.connect();

const getPost = async (request, response) => {
    await pgClient.query('SELECT * FROM posts ORDER BY id ASC', (error, result) => {
        var html = jade.renderFile('./views/index.jade', { posts: result.rows });
        response.status(200).send(html);
    })
}

const getPostAll = async (request, response) => {
    await pgClient.query('SELECT * FROM posts INNER JOIN users ON posts.user_id = users.id', (error, result) => {
        var html = jade.renderFile('./views/index.jade', { posts: result.rows });
        response.status(200).send(html);

    })
}

const getUser = async (request, response) => {
    await pgClient.query('SELECT * FROM users ORDER BY id ASC', (error, result) => {
        // response.status(200).json(result.rows);
        var html = jade.renderFile('./views/index.jade', { users: result.rows });
        response.status(200).send(html);
    })
}

const createUser = async (request, response) => {
    const { username, password } = request.body
    await pgClient.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password], (error, results) => {
        if (error) {
            throw error
        }
    })
}

const createImage = async (request, response) => {
    const { image } = request.body
    await pgClient.query('INSERT INTO images (image) VALUES ($1)', [image], (error, results) => {
        if (error) {
            throw error
        }
    })
}

const deletePost = async (request, response) => {
    const id = parseInt(request.params.id);
    console.log(id);
    await pgClient.query('DELETE FROM posts WHERE id = ($1)', [id], (error, results) => {
        if (error) {
            throw error
        }
    })
}

const createPost = async (request, response) => {

    let title = request.body.title;
    let content = request.body.content;
    var dt = new Date();
    var utcDate = dt.toUTCString();

    if (title != null) {
        const text = 'INSERT INTO posts(user_id, title, content, image_id, timestamp) VALUES($1, $2, $3, $4, $5)';
        const values = [8, title, content, 2, utcDate]
        try {
            const res = await pgClient.query(text, values);
            console.log(res.rows[0]);
        } catch (err) {
            console.log(err.stack)
        }
    }
}

module.exports = {
    getPost,
    getUser,
    createUser,
    createPost,
    createImage,
    getPostAll,
    deletePost,
}