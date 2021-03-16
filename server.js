const jwt = require('jsonwebtoken');
const express = require('express')
const db = require('./queries')
const app = express()
const fetch = require("node-fetch");
var cors = require('cors');

const bodyParser = require("body-parser");
const router = express.Router();
const port = process.env.PORT || 3001;
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

    jwt.verify(token, "1233jk039dc89d00", (err, user) => {
        if (err) return res.sendStatus(403)
        res.append('Warning', '201 Warning');
        next()
    })
}

app.post('/login', db.login);
app.get('/', authenticateToken, db.getPostAll);
app.post('/post', db.createPost);
app.get('/info', db.getUser);
app.post('/comment', db.pushComment);
app.delete('/post', db.deletePost);
// app.get('/:id', db.getUser);
// app.post('/cuser', db.createUser);
// app.post('/post', db.pushComment);
// app.delete('/:id', db.deletePost);
// app.post('/post', db.pushComment);
// app.get('/comment/post=:id', db.getCommentLastOfPost);
// app.get('/comment/post', db.getPostHasManyComment);
// app.get('/user/post=:id', db.getUserLastOfPost);


app.listen(port, function (req, res) {
    console.log("connect is " + port);
})

// app.get("/user", async function (req, res) {
//     try {
//         let query = await pgClient.query("SELECT * FROM users", function (err, results) {
//             let arr = [];
//             for (let i = 0; i < results.rowCount; i++) {
//                 arr.push(results.rows[i]);
//             }
//             res.send(arr);
//         });
//     } catch (error) {
//         console.log('Error select *');
//     }
// })
// app.get("/image", async function (req, res) {
//     try {
//         let query = await pgClient.query("SELECT * FROM images", function (err, results) {
//             let arr = [];
//             for (let i = 0; i < results.rowCount; i++) {
//                 arr.push(results.rows[i]);
//             }
//             res.send(arr);
//         });
//     } catch (error) {
//         console.log('Error select *');
//     }
// })
// 
// app.post('/posts/:user_id', function (req, res) {
//     var query = pgClient.query('INSERT INTO images (image) VALUES ($1)', [req.params.image], (error, results) => {
//         if (error) {
//             throw error
//         } else {
//             res.send("image ");
//         }
//     })
// })
// app.get('/user/:id', async function (req, res) {
//     let query = await pgClient.query(`SELECT * FROM users WHERE id = ${req.params.id}`, function (error, result) {
//         res.send(result.rows[0]);
//     });
// });
// app.delete('image/:id', async function (req, res) {
//     let query = await pgClient.query(`DELETE FROM images WHERE id = ${req.params.id}`, function name(error, result) {
//         console.log('DELETED!!!');
//     })
// })
