var http = require("http");
var fs = require("fs");

var template = require("./lib/template.js");
var path = require("path");
var sanitizeHtml = require("sanitize-html");
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "tnrms2188",
  database: "opentutorials",
});
connection.connect();

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = new URL("http://localhost:3000" + _url);
  var title = queryData.searchParams.get("id");

  if (queryData.pathname === "/") {
    // 정상적인 접근 경로
    var fileContent = "";
    var html;

    if (queryData.searchParams.get("id") == null) {
      // 메인화면
      connection.query(`SELECT * FROM topic`, function (error, topcis) {
        title = "Welcome";
        fileContent = "Hello, Node.js";
        html = template.html(
          title,
          template.list(topcis),
          `<h2>${title}</h2>${fileContent}`,
          `<a href ="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    } else {
      // id 값이 있는경우
      var queryid = queryData.searchParams.get("id");
      connection.query(`SELECT * FROM topic`, function (error, topcis) {
        if (error) {
          throw error;
        }
        connection.query(
          `select * from topic left join author on topic.author_id = author.id where topic.id=?`,
          [queryid],
          function (error2, topic) {
            if (error2) {
              throw error2;
            }
            console.log(topic);
            fileContent = topic[0].description;
            html = template.html(
              topic[0].title,
              template.list(topcis),
              `<h2>${topic[0].title}</h2>
              ${fileContent}
              <p>by ${topic[0].name}</p>
              `,
              ` <a href ="/create">create</a>
              <a href = "/update?id=${queryid}">update</a>
              <form action ="/process_delete" method = "post">
                <input type = "hidden" name = "id" value ="${queryid}">
                <input type = "submit" value="delete">
              </form>`
            );
            response.writeHead(200);
            response.end(html);
          }
        );
      });
    }
  } else if (queryData.pathname == "/create") {
    connection.query(`SELECT * FROM topic`, function (error, topics) {
      html = template.html(
        title,
        template.list(topics),
        `
      <form class="" action="/process_create" method="post">
      <p>
        <input type="text" name="title" placeholder="title">
      </p>
      <p>
        <textarea name="description" rows="8" cols="80" placeholder="description"></textarea>
      </p>
      <p>
        <input type="submit">
      </p>
      </form>
      `,
        ``
      );
      response.writeHead(200);
      response.end(html);
    });
  } else if (queryData.pathname == "/process_create") {
    var qs = require("querystring");
    var body = "";
    request.on("data", function (data) {
      // data 정보 수신
      body = body + data;
    });
    request.on("end", function () {
      // data 정보 수신 종료
      var post = qs.parse(body);
      connection.query(
        `insert into topic (title,description,created,author_id) values(?,?,NOW(),?)`,
        [post.title, post.description, 1],
        function (error, result) {
          if (error) {
            throw error;
          }
          response.writeHead(302, {
            Location: `/?id=${encodeURI(result.insertId)}`,
          }); // 302
          response.end();
        }
      );
    });
  } else if (queryData.pathname == "/update") {
    connection.query(`SELECT * FROM topic`, function (error, topics) {
      connection.query(
        `select * from topic where id = ?`,
        [queryData.searchParams.get("id")],
        function (err, topic) {
          html = template.html(
            topic[0].title,
            template.list(topics),
            `
        <form class="" action="/process_update" method="post" >
        <input type = "hidden" name = "id" value= "${topic[0].id}">
        <p>
          <input type="text" name="title" placeholder="title" value = "${topic[0].title}">
        </p>
        <p>
          <textarea name="description" rows="8" cols="80", placeholder="description">${topic[0].description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
        </form>
        `,
            `
        <a href ="/create">create</a>
        <a href = "/update?id=${topic[0].id}">update</a>
        `
          );
          response.writeHead(200);
          response.end(html);
        }
      );
    });
  } else if (queryData.pathname == "/process_update") {
    var qs = require("querystring");
    var body = "";
    request.on("data", function (data) {
      // data 정보 수신
      body = body + data;
    });
    request.on("end", function () {
      // data 정보 수신 종료
      var post = qs.parse(body);
      connection.query(
        `UPDATE topic SET title=?, description=?, author_id =1 where id=?`,
        [post.title, post.description, post.id],
        function (error, topic) {
          response.writeHead(302, {
            Location: `/?id=${encodeURI(post.id)}`,
          }); // 302 : 리다이렉션
          response.end();
        }
      );
    });
  } else if (queryData.pathname == "/process_delete") {
    var qs = require("querystring");
    var body = "";
    request.on("data", function (data) {
      // data 정보 수신
      body = body + data;
    });
    request.on("end", function () {
      // data 정보 수신 종료
      var post = qs.parse(body);
      connection.query(
        `delete from topic where id = ?`,
        [post.id],
        function (err, result) {
          response.writeHead(302, { Location: `/` }); // 302 : 리다이렉션
          response.end();
        }
      );
    });
  } else {
    response.writeHead(404);
    response.end("Not Found");
  }
});
app.listen(3000);
