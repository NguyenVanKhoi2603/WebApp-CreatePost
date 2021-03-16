var pg = require('pg');
var jade = require('jade');
const jwt = require("jsonwebtoken");
const { request, response } = require('express');
const db_client = require('./db_client.js');
var pgClient = db_client.pgClient;
pgClient.connect();
const accessTokenSecret = db_client.accessToken;
const getPost = async (request, response) => {
    await pgClient.query('SELECT * FROM post ORDER BY id ASC', (error, result) => {
        if (error) {
            console.log('getpost', error);
        }
        //console.log('getpost', result.rows);
        // var html = jade.renderFile('./views/index.jade', { posts: result.rows });
        // response.status(200).send(html);
    })
}
const getPostAll = async (request, response) => {
    const posts = await pgClient.query('SELECT p.id, p.user_id, p.title, p.content, p.timestamp, u.username, i.image FROM post p INNER JOIN users u ON p.user_id = u.id INNER JOIN image i ON p.image_id = i.id ORDER BY p.id DESC');
    const comments = await pgClient.query('SELECT c.id, c.user_id, c.post_id, c.content, c.timestamp, u.id, u.username FROM comment c INNER JOIN users u on c.user_id = u.id');
    return response.status(201).send({ posts, comments });
}

const login = async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    if (!req.body.username || !req.body.password) {
        res.status(201).send({ 'message': "", 'login': false });
    }
    try {
        const { rows } = await pgClient.query(`SELECT * FROM users WHERE username = '${username}'`);
        if (!rows[0]) {
            return res.status(201).send({ 'message': "The credentials you provided is incorrect!", 'login': false });
        }
        if (rows[0].password == req.body.password) {
            const accessToken = jwt.sign({ id: rows[0].id }, accessTokenSecret);
            return res.status(201).send({ accessToken, 'message': "login success!", 'login': true });
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.log("Error" + error);
    }
}

const getUser = (request, response) => {
    const authHeader = request.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return response.sendStatus(401)
    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) return response.sendStatus(403)
        pgClient.query(`SELECT * FROM users WHERE id = ${user.id}`, (error, result) => {
            response.status(200).send(result.rows[0]);
        });
    })
}

const deletePost = async (request, response) => {
    const id = request.body.post_id;
    const post = await pgClient.query(`SELECT * FROM post WHERE id = ${id}`);
    await pgClient.query(`DELETE FROM comment WHERE post_id = ${id}`);
    await pgClient.query('DELETE FROM post WHERE id = ($1)', [id], (error, results) => {
        if (error) {
            throw error
        }
        pgClient.query(`DELETE FROM image WHERE id = ${post.rows[0].image_id} AND id <> 1`);
        response.send({ 'message': "Delete Success!" })
    });
}

const createPost = async (request, response) => {
    let image = request.body.image;
    let title = request.body.title;
    let content = request.body.content;
    var dt = new Date();
    var utcDate = dt.toUTCString();
    if (title != null && content != null) {
        if (image.length > 0) {
            const query_Image = 'INSERT INTO image(image) VALUES($1)';
            const values_image = [image]
            const resImage = await pgClient.query(query_Image, values_image);
            const getIdImage = await pgClient.query('SELECT * FROM image ORDER BY id DESC LIMIT 1');
            const queryPost = 'INSERT INTO post(user_id, title, content, image_id, timestamp) VALUES($1, $2, $3, $4, $5)';
            const valuesPost = [1, title, content, getIdImage.rows[0].id, utcDate];
            try {
                const res = await pgClient.query(queryPost, valuesPost);
                response.status(200).send({ message: "Publish success!!" });
            } catch (err) {
                console.log(err.stack)
            }
        } else {
            const text = 'INSERT INTO post(user_id, title, content, image_id, timestamp) VALUES($1, $2, $3, $4, $5)';
            const values = [1, title, content, 1, utcDate]
            try {
                const res = await pgClient.query(text, values);
                response.status(200).send({ message: "Publish success!!" });
            } catch (err) {
                console.log(err.stack)
            }
        }
    }
}

const pushComment = async (request, response) => {
    let content = request.body.content_comment;
    let post_id = request.body.post_id;
    var dt = new Date();
    var utcDate = dt.toUTCString();
    if (content != null) {
        const text = 'INSERT INTO comment(user_id, post_id, content, timestamp) VALUES($1, $2, $3, $4)';
        const values = [1, post_id, content, utcDate]
        try {
            const res = await pgClient.query(text, values);
            console.log(res.rows[0]);
            response.status(200).send({ message: "Comment success!!" });
        } catch (err) {
            console.log(err.stack)
            response.send({ message: "Error" });
        }
    }
}

const getCommentLastOfPost = (request, response) => {
    const id = parseInt(request.params.id);
    pgClient.query('SELECT * FROM comment WHERE post_id = ($1) ORDER BY id DESC LIMIT 3', [id], (error, result) => {
        response.send(result.rows);
    })
}

const getUserLastOfPost = (request, response) => {
    const id = parseInt(request.params.id);
    pgClient.query('SELECT users.id, users.username FROM users INNER JOIN comment on users.id = comment.user_id WHERE comment.post_id = ($1) ORDER BY comment.id DESC LIMIT 1', [id], (error, result) => {
        response.send(result.rows);
    })
}

const getPostHasManyComment = (request, response) => {
    try {
        pgClient.query('SELECT p.id, p.user_id, p.title, p.content, p.image_id, p.timestamp, count(p.id) FROM post p RIGHT JOIN comment c on p.id = c.post_id GROUP BY p.id ORDER BY count DESC LIMIT 1', (error, result) => {
            response.send(result1.rows);
        })
    } catch (error) {
        console.log("Error: ", error, result);
    }
}

module.exports = {
    getPost,
    getUser,
    createPost,
    getPostAll,
    deletePost,
    pushComment,
    getCommentLastOfPost,
    getPostHasManyComment,
    getUserLastOfPost,
    login,
}