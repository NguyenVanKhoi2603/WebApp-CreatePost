const jwt = require('jsonwebtoken');
const express = require('express')
const db = require('./queries')
const app = express()
var cors = require('cors');
const bodyParser = require("body-parser");
const router = express.Router();
const port = process.env.PORT || 3001;
const db_client = require('./db_client.js');
const accessTokenSecret = db_client.accessToken;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
router.use(function (req, res, next) {
    console.log('Time:', Date.now())
    next()
    console.log("=============>>");
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) return res.sendStatus(403)
        res.append('Warning', '201 Warning');
        next()
    })
}

app.post('/login', db.login);
app.get('/', db.getPostAll);
app.post('/post', db.createPost);
app.get('/info', db.getUser);
app.post('/comment', db.pushComment);
app.delete('/post', db.deletePost);
app.get('/comment/', db.getAllCommentAndJoin);

app.get('/posts', db.getPosts);
app.get('/posts/:id', db.getAPost);
app.get('/posts/:key', db.searchPost);
app.delete('/posts/:id', db.deletePostById);

app.get('/comments', db.getComments);
app.get('/users', db.getUsers);
app.get('/images', db.getImages);

app.post('/posts', db.createPost);
app.listen(port, function (req, res) {
    console.log("connect is " + port);
})

