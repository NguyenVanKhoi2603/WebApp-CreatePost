var pg = require('pg');
var jade = require('jade');
const jwt = require("jsonwebtoken");
const { request, response } = require('express');
const db_client = require('./db_client.js');
const { json } = require('body-parser');
var pgClient = db_client.pgClient;
pgClient.connect();
const accessTokenSecret = db_client.accessToken;

const getPostAll = async (request, response) => {
    const posts = await pgClient.query('SELECT p.id, p.user_id, p.title, p.content, p.timestamp, u.username, i.image FROM post p INNER JOIN users u ON p.user_id = u.id INNER JOIN image i ON p.image_id = i.id ORDER BY p.id DESC');
    const comments = await pgClient.query('SELECT c.id, c.user_id, c.post_id, c.content, c.timestamp, u.id, u.username FROM comment c INNER JOIN users u on c.user_id = u.id');
    return response.status(201).send({ posts, comments });
}

const login = async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    console.log(req.body);

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
            return res.status(201).send({ user_id: rows[0].id, accessToken, 'message': "login success!", 'login': true });
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
    var image = request.body.image;
    var title = request.body.title;
    var user_id = request.body.user_id;
    var content = request.body.content;
    var dt = new Date();
    var utcDate = dt.toUTCString();
    if (title != null && content != null) {
        if (image.length > 0) {
            const query_Image = 'INSERT INTO image(image) VALUES($1)';
            const values_image = [image]
            const resImage = await pgClient.query(query_Image, values_image);
            const getIdImage = await pgClient.query('SELECT * FROM image ORDER BY id DESC LIMIT 1');
            const queryPost = 'INSERT INTO post(user_id, title, content, image_id, timestamp) VALUES($1, $2, $3, $4, $5)';
            const valuesPost = [user_id, title, content, getIdImage.rows[0].id, utcDate];
            try {
                const res = await pgClient.query(queryPost, valuesPost);
                response.status(200).send({ message: "Publish success!!" });
            } catch (err) {
                console.log(err.stack)
            }
        } else {
            const text = 'INSERT INTO post(user_id, title, content, image_id, timestamp) VALUES($1, $2, $3, $4, $5)';
            const values = [user_id, title, content, 1, utcDate]
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
    let user_id = request.body.user_id;
    var dt = new Date();
    var utcDate = dt.toUTCString();
    if (content.length > 3) {
        const text = 'INSERT INTO comment(user_id, post_id, content, timestamp) VALUES($1, $2, $3, $4)';
        const values = [user_id, post_id, content, utcDate]
        try {
            const res = await pgClient.query(text, values);
            console.log(res.rows[0]);
            response.status(200).send({ message: "Comment success!!" });
        } catch (err) {
            console.log(err.stack)
            response.send({ message: "Error" });
        }
    } else {
        response.send({ message: "No data!" });
    }
}

const CreateUser = async (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    if (username.length > 3 && password.length > 6) {
        const text = 'INSERT INTO users(username, password) VALUES($1, $2)';
        const values = [username, password];
        try {
            const res = await pgClient.query(text, values);
            response.send({ message: "Comment success!!" });
        } catch (err) {
            console.log(err.stack)
            response.send({ message: "Error" });
        }
    } else {
        response.send({ message: "No data!" });
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
            response.send(result.rows);
        })
    } catch (error) {
        console.log("Error: ", error, result);
        res.send({ message: "Error" });
    }
}

const getCommentByPostId = (req, res) => {
    if (req.query.filter) {
        try {
            var obj = JSON.parse(req.query.filter);
            if (obj.post_id.length > 0) {
                pgClient.query(`SELECT * FROM comment WHERE post_id = ($1)`, [obj.post_id], (error, result) => {
                    res.set('Content-Range', `comments 0-2/10`)
                    res.set('Access-Control-Expose-Headers', 'Content-Range')
                    res.send(result.rows);
                });
            }
        } catch (error) {
            console.log(error);
        }
    }
}

const getAllCommentAndJoin = (req, res) => {
    try {
        pgClient.query('SELECT c.id, c.user_id, c.post_id, c.content, c.timestamp, u.username FROM comment c JOIN users u ON c.user_id = u.id', (error, result) => {
            res.send(result.rows);
        });
    } catch (error) {
        console.log(error);
    }
}

const getComments = (req, res) => {
    try {
        var sort = JSON.parse(req.query.sort);
        if (req.query.filter !== 'undefined') {
            var obj = JSON.parse(req.query.filter);
            if (obj.post_id > 0) {
                pgClient.query(`SELECT * FROM comment WHERE post_id = ($1)  ORDER BY ${sort[0]} ${sort[1]}`, [obj.post_id], (error, result) => {
                    res.set('Content-Range', `comments 0-2/10`)
                    res.set('Access-Control-Expose-Headers', 'Content-Range')
                    res.send(result.rows);
                });
            } else {
                pgClient.query(`SELECT * FROM comment ORDER BY ${sort[0]} ${sort[1]}`, (error, result) => {
                    res.set('Content-Range', `comments 0-2/10`)
                    res.set('Access-Control-Expose-Headers', 'Content-Range')
                    res.send(result.rows);
                });
            }
        } else {
            pgClient.query(`SELECT * FROM comment ORDER BY ${sort[0]} ${sort[1]}`, (error, result) => {
                res.set('Content-Range', `comments 0-2/10`)
                res.set('Access-Control-Expose-Headers', 'Content-Range')
                res.send(result.rows);
            });
        }
    } catch (error) {
        console.log(error);
    }
}

const getUsers = (req, res) => {
    try {
        var sort = JSON.parse(req.query.sort);
        if (req.query.filter !== 'undefined') {
            var obj = JSON.parse(req.query.filter);
            if (obj.q !== 'undefined' && obj.q != null) {
                pgClient.query(`SELECT * FROM users WHERE username LIKE '%${obj.q}%' ORDER BY ${sort[0]} ${sort[1]}`, (error, result) => {
                    res.set('Content-Range', `users 0-2/10`)
                    res.set('Access-Control-Expose-Headers', 'Content-Range')
                    res.send(result.rows);
                });
            } else {
                pgClient.query(`SELECT * FROM users ORDER BY ${sort[0]} ${sort[1]}`, (error, result) => {
                    res.set('Content-Range', `users 0-2/10`)
                    res.set('Access-Control-Expose-Headers', 'Content-Range')
                    res.send(result.rows);
                });
            }
        } else {
            pgClient.query(`SELECT * FROM users ORDER BY ${sort[0]} ${sort[1]}`, (error, result) => {
                res.set('Content-Range', `users 0-2/10`)
                res.set('Access-Control-Expose-Headers', 'Content-Range')
                res.send(result.rows);
            });
        }
    } catch (error) {
        console.log(error);
    }
}

const getPosts = (req, res) => {
    try {
        var sort = JSON.parse(req.query.sort);
        if (req.query.filter !== 'undefined') {
            var obj = JSON.parse(req.query.filter);
            if (obj.q !== 'undefined' && obj.q != null) {
                pgClient.query(`SELECT * FROM post WHERE title LIKE '%${obj.q}%' OR content LIKE '%${obj.q}%' ORDER BY ${sort[0]} ${sort[1]}`, (error, result) => {
                    res.set('Content-Range', `users 0-2/10`)
                    res.set('Access-Control-Expose-Headers', 'Content-Range')
                    res.send(result.rows);
                });
            } else {
                pgClient.query(`SELECT * FROM post ORDER BY ${sort[0]} ${sort[1]}`, (error, result) => {
                    res.set('Content-Range', `posts 0-2/10`)
                    res.set('Access-Control-Expose-Headers', 'Content-Range')
                    res.send(result.rows);
                });
            }
        } else {
            pgClient.query(`SELECT * FROM post ORDER BY ${sort[0]} ${sort[1]}`, (error, result) => {
                res.set('Content-Range', `posts 0-2/10`)
                res.set('Access-Control-Expose-Headers', 'Content-Range')
                res.send(result.rows);
            });
        }

    } catch (error) {
        console.log(error);
    }
}

const getImages = (req, res) => {
    try {
        var sort = JSON.parse(req.query.sort);
        pgClient.query(`SELECT * FROM image ORDER BY ${sort[0]} ${sort[1]}`, (error, result) => {
            res.set('Content-Range', `images 0-2/10`)
            res.set('Access-Control-Expose-Headers', 'Content-Range')
            res.send(result.rows);
        });
    } catch (error) {
        console.log(error);
    }
}


const deletePostById = (req, res) => {
    let id = req.params.id;
    try {
        pgClient.query(`DELETE FROM post WHERE id = ($1)`, [id], (error, result) => {
            // res.set('Content-Range', `images 0-2/10`)
            // res.set('Access-Control-Expose-Headers', 'Content-Range')
            res.send({ message: "Deleted" })
        });
    } catch (error) {
        console.log(error);
    }
}

const deleteCommentById = (req, res) => {
    let id = req.params.id;
    try {
        pgClient.query(`DELETE FROM comment WHERE id = ($1)`, [id], (error, result) => {
            // res.set('Content-Range', `images 0-2/10`)
            // res.set('Access-Control-Expose-Headers', 'Content-Range')
            res.send({ message: "Deleted" })
        });
    } catch (error) {
        console.log(error);
    }
}

const deleteImageById = (req, res) => {
    let id = req.params.id;
    try {
        pgClient.query(`DELETE FROM image WHERE id = ($1)`, [id], (error, result) => {
            // res.set('Content-Range', `images 0-2/10`)
            // res.set('Access-Control-Expose-Headers', 'Content-Range')
            res.send({ message: "Deleted" })
        });
    } catch (error) {
        console.log(error);
    }
}

const getImageById = (req, res) => {
    let id = req.params.id;
    try {
        pgClient.query('SELECT * FROM image WHERE id = ($1)', [id], (error, result) => {
            res.send(result.rows[0])
        })
    } catch (error) {
        console.log(error);
        res.send({ 'error': error })
    }
}

const getCommentById = (req, res) => {
    let id = req.params.id;
    try {
        pgClient.query('SELECT * FROM comment WHERE id = ($1)', [id], (error, result) => {
            res.send(result.rows[0])
        })
    } catch (error) {
        console.log(error);
        res.send({ 'error': error })
    }
}

const getPostById = (req, res) => {
    let id = req.params.id;
    try {
        pgClient.query('SELECT * FROM post WHERE id = ($1)', [id], (error, result) => {
            res.send(result.rows[0])
        })
    } catch (error) {
        console.log(error);
        res.send({ 'error': error })
    }
}

const getUserById = (req, res) => {
    let id = req.params.id;
    try {
        pgClient.query('SELECT * FROM users WHERE id = ($1)', [id], (error, result) => {
            if (error) {
                res.send(error)
            } else {
                res.send(result.rows[0])
            }

        })
    } catch (error) {
        console.log(error);
        res.send({ 'error': error })
    }
}

const deleteUser = async (request, response) => {
    const id = request.params.id;
    await pgClient.query(`DELETE FROM comment WHERE user_id = ($1)`, [id], (error, result) => {
        if (error) {
            console.log(error);
            response.send({ 'message': error })
        }
    });
    await pgClient.query('DELETE FROM post WHERE user_id = ($1)', [id], (error, results) => {
        if (error) {
            throw error
        }
        pgClient.query(`DELETE FROM users WHERE id = ($1)`, [id], (error, results) => {
            response.send({ 'message': "Delete Success!" })
        });

    });
}

const updateUser = (req, res) => {
    const id = req.params.id;
    const username = req.body.username;
    const password = req.body.password;
    try {
        pgClient.query(`UPDATE users SET username = ($1), password = ($2) WHERE id = ($3)`, [username, password, id], (error, result) => {
            res.send({ 'id': id, 'message': 'Update success!' });
        });
    } catch (error) {
        res.send({ 'error': error });
    }
}

const updatePost = (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const content = req.body.content;
    try {
        pgClient.query(`UPDATE post SET title = ($1), content = ($2) WHERE id = ($3)`, [title, content, id], (error, result) => {
            res.status(200).send({ 'id': id, 'message': "update success!" });
        });
    } catch (error) {
        res.send({ 'error': error });
    }
}

module.exports = {
    getUser,
    createPost,
    getPostAll,
    deletePost,
    pushComment,
    getCommentLastOfPost,
    getPostHasManyComment,
    getUserLastOfPost,
    login,
    getCommentByPostId,
    getAllCommentAndJoin,
    getComments,
    getPosts,
    getImages,
    getUsers,
    deletePostById,
    deleteCommentById,
    deleteImageById,
    getCommentById,
    getImageById,
    getPostById,
    CreateUser,
    deleteUser,
    getUserById,
    updateUser,
    updatePost,
}