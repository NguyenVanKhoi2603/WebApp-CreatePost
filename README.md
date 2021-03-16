# WebApp-CreatePost
- Build Web app 
- Create Database
- run npm create table and insert data
````
    npm run migrate
    npm run insertdb
````
## App web đăng tin.

+ **Yêu cầu**: Viết ứng dụng web app cho người dùng, cho phép người dùng thực hiện việc tạo nội dung mới, các thông tin của bài viết bao gồm: tên người đăng, thời gian, tiêu đề, nội dung bài viết, các nút tương tác với bài viết. Sau khi người dùng nhấn tải lên nội dung, bài viết sẽ được hiểu thị ở bảng tin và tất cả người dùng có thể nhìn thấy và tương tác.
- Ngôn ngữ: Javascript
- CSDL: Postgresq
## Mô tả ứng dụng

I. **Thành phần**: 
1. **Database**

	**Table**
- User: user_id, user_name, password.
- Post: post_id, user_id, title, content, image_id, timestamp.
- Image: image_id, image.

**Create database**

````
CREATE DATABASE dbPost;
````

**Create table**

User:
````
CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   username varchar(24) UNIQUE,
   password varchar(24)
);    
````

Image:
````
CREATE TABLE images (
   id SERIAL PRIMARY KEY,
   image varchar(255)
);
````

Post:
````
CREATE TABLE posts (
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
          REFERENCES images(id)
);
````

Insert data:
````
INSERT INTO 
	users(username, password) 
VALUES 
	('khoinguyen', '123456789')
	,('nexpando', '123456')
	,('lananh', '123456789');
````

````
INSERT INTO 
	images(image) 
VALUES 
	('image1')
	,('image2')
	,('image3');
````

````
INSERT INTO 
	posts(user_id, title, content, image_id, timestamp) 
VALUES 
	(1, 'title of post 1', 'content of post 1', 1, '2021-01-08 04:05:06')
	,(2, 'title of post 2', 'content of post 2', 2, '2021-02-04 04:05:06')
	,(3, 'title of post 3', 'content of post 3', 3, '2021-05-08 04:05:06');
````
Select data:

````
SELECT * FROM users;
SELECT * FROM images;
SELECT * FROM posts;
````
SELECT and WHERE
````
SELECT * 
FROM 
	posts, users
WHERE
	posts.user_id = users.id and users.id = 6;
````


JOIN data:

````
SELECT 
   	*
FROM
    posts
INNER JOIN users
    ON posts.user_id = users.id;
````
DELETE data:
````
DELETE FROM images WHERE id = 4;
````
UPDATE data:
````
UPDATE users
    SET username = 'Khoi Nguyen'
    WHERE id  = 6;
````
2. **Backend API**

- **Config**

>npm install pg

````
var pg = require('pg');
var connectionString = "postgres://macintoshhd@localhost/dbPost";
var pgClient = new pg.Client(connectionString);
pgClient.connect();
````

- **Create post**
````

````
- **Read post**
````
app.get("/user", async function (req, res) {
    try {
        let query = await pgClient.query("SELECT * FROM users", function (err, results) {
            let arr = [];
            for (let i = 0; i < results.rowCount; i++) {
                arr.push(results.rows[i]);
            }
            res.send(arr);
        });
    } catch (error) {
        console.log('Error select *');
    }
})
````
- **Delete post**
````
app.delete('posts/:id', async function (req, res) {
    let query = await pgClient.query(`DELETE FROM posts WHERE id = ${req.params.id}`, function name(error, result) {
        console.log('DELETED!!!');
    })
})
````




3. **Web app**

- Người dùng:

	- Tên
	> Tên của người đăng bài viết.

- Bài viết:
	- Thời gian tạo bài viết
	> Thời gian tạo bài viết, hiển thị theo định dạng dd/mm/yyyy.
	- Tiêu đề
	> Tiêu đề của bài viết.
	- Nội dung
	> Nội dung của bài viết.
	- Hình ảnh
	> Hình ảnh của bài viết.
	- Các nút tương tác
	> Người dùng có thể tương tác với bài viết như: like, comment.

II. **Thiết kế**

Tên người dùng:
 - Hiển thị dạng văn bản ở đầu bài viết trên cùng bên phải, kiểu chữ in đậm, font-size: 25px.
> vd: **Khoi Nguyen**

Thời gian:
- Hiển thị dạng văn bản bên phải tên người đăng, kiểu chữ in nhỏ, font size: 10px.
> vd:  **Khoi Nguyen**  <span style="font-family; font-size:10px;">03/03/2021!</span>

Tiêu đề bài viết:
- Hiển thị bên dưới tên người đăng và thời gian, font-size: 20px

> ### Title

Nội dung bài viết:
- Hiển dạng văn bản, bên dưới tiêu đề của bài viết, font size: 17px.

> ### Title
>content content content content

Hình ảnh:
- Hiển thị dạng hình ảnh, kích thước tối đa hiển thị 2/3 với các bố cục khác, vị trí bên dưới nội dung của bài viết.

> ### Title
> content content content content

![](https://uproer.com/wp-content/uploads/2017/06/pixels-to-inches-image.jpg)


Các nút tương tác
- Hiển thị dưới cùng của bài viết, bên dưới hình ảnh, bố cục hướng ngang.



