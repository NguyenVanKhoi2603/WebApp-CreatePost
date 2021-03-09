var pg = require('pg');
var jade = require('jade');

var connectionString = process.env.POSTGRES_URL || "postgres://postgres:postgres@172.21.0.2:5432/dbpost";
var pgClient = new pg.Client(connectionString);
pgClient.connect();

const getPost = async (request, response) => {
    await pgClient.query('SELECT * FROM post ORDER BY id ASC', (error, result) => {
        if (error) {
            console.log('getpost', error);
        }
        //console.log('getpost', result.rows);
        var html = jade.renderFile('./views/index.jade', { posts: result.rows });
        response.status(200).send(html);
    })
}
const getPostAll = (request, response) => {

    pgClient.query('SELECT * FROM post INNER JOIN users ON post.user_id = users.id', (error, result) => {
        if (error) {
            console.log('getpost', error);
        }
        //console.log('getpost', result.rows);
        var html = jade.renderFile('./views/index.jade', { posts: result.rows });
        response.status(200).send(html);
    })
}

const getUser = (request, response) => {
    pgClient.query('SELECT * FROM users ORDER BY id ASC', (error, result) => {
        // response.status(200).json(result.rows);
        //var html = jade.renderFile('./views/index.jade', { users: result.rows });
        //response.status(200).send(html);
        var html = jade.renderFile('./views/index.jade', { users: result.rows });
        response.status(200).send(html);
        response.status(200).send(result.rows);
    })
}

const createUser = (request, response) => {
    const { username, password } = request.body
    pgClient.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password], (error, results) => {
        if (error) {
            throw error
        }
    })
}

const createImage = (request, response) => {
    const { image } = request.body
    pgClient.query('INSERT INTO image (image) VALUES ($1)', [image], (error, results) => {
        if (error) {
            throw error
        }
    })
}

const deletePost = async (request, response) => {
    const id = parseInt(request.params.id);
    console.log(id);
    await pgClient.query('DELETE FROM post WHERE id = ($1)', [id], (error, results) => {
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
        const text = 'INSERT INTO post(user_id, title, content, image_id, timestamp) VALUES($1, $2, $3, $4, $5)';
        const values = [1, title, content, 2, utcDate]
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