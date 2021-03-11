var pg = require('pg');
var jade = require('jade');
const jwt = require("jsonwebtoken");

const accessTokenSecret = '1233jk039dc89d00';


const { request, response } = require('express');

var connectionString = process.env.POSTGRES_URL || "postgres://postgres:postgres@localhost:5433/dbpost";
var pgClient = new pg.Client(connectionString);
pgClient.connect();

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
    const posts = await pgClient.query('SELECT * FROM post INNER JOIN users ON post.user_id = users.id INNER JOIN image ON post.image_id = image.id');
    const comments = await pgClient.query('SELECT * FROM comment INNER JOIN post ON comment.post_id = post.id INNER JOIN users on post.user_id = users.id');
    const users = await pgClient.query('SELECT * FROM users');
    //console.log("================>>>> ", posts.rows);
    var html = jade.renderFile('./views/index.jade', { posts: posts.rows, comments: comments.rows, users: users.rows });
    //console.log("================>>>> ", html);
    response.status(200).send(html);
}

const index = (request, response) => {
    var html = jade.renderFile('./views/login/login.jade');
    response.status(200).send(html);
}

const login = async (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).send({ 'message': 'Some values are missing' });
    }
    const text = ('SELECT * FROM users where username = $1');
    try {
        const { rows } = await pgClient.query(text, [req.body.username]);
        if (!rows[0]) {
            return res.status(400).send({ 'message': 'The credentials you provided is incorrect' });
        }
        if (rows[0].password == req.body.password) {
            const accessToken = jwt.sign({ username: rows[0].username }, accessTokenSecret);
            res.json({
                accessToken
            });
            console.log(accessToken);
            res.redirect('/index')
        } else {
            //res.end()
            res.redirect('/')
        }

    } catch (error) {
        console.log("=========== ??????", error);
    }
}

const getUser = (request, response) => {
    pgClient.query('SELECT * FROM users ORDER BY id ASC', (error, result) => {
        // var html = jade.renderFile('./views/index.jade', { users: result.rows });
        // response.status(200).send(html);
        // response.status(200).send(result.rows);
    })
}

// const createUser = (request, response) => {
//     const { username, password } = request.body
//     pgClient.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password], (error, results) => {
//         if (error) {
//             throw error
//         }
//     })
// }
// const createImage = (request, response) => {
//     const { image } = request.body
//     pgClient.query('INSERT INTO image (image) VALUES ($1)', [image], (error, results) => {
//         if (error) {
//             throw error
//         }
//     })
// }

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
            //console.log("res", res);
            //response.setHeader('Content-Type', 'application/json');
            // response.redirect('back')
        } catch (err) {
            console.log(err.stack)
        }
    }
}

const pushComment = async (request, response) => {
    let content = request.body.content_comment;
    var dt = new Date();
    var utcDate = dt.toUTCString();
    if (title != null) {
        const text = 'INSERT INTO comment(user_id, post_id, content, timestamp) VALUES($1, $2, $3, $4)';
        const values = [1, 2, content, utcDate]
        try {
            const res = await pgClient.query(text, values);
            console.log(res.rows[0]);
        } catch (err) {
            console.log(err.stack)
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
        pgClient.query('SELECT p.id, p.user_id, p.title, p.content, p.image_id, p.timestamp, count(p.id) FROM post p RIGHT JOIN comment c on p.id = c.post_id GROUP BY p.id ORDER BY count DESC LIMIT 1', (error, result1) => {
            response.send(result1.rows);
        })
    } catch (error) {
        console.log("Error: ", error, result1);
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
    index
}