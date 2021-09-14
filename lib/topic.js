var connection = require(`./db`);
var template = require(`./template`);
var title;
var fileContent;
var html;
var qs = require("querystring");

module.exports = {
  main: function (response) {
    connection.query(`SELECT * FROM topic`, function (error, topcis) {
      title = "Welcome3";
      fileContent = "Hello, Node.js";
      html = template.html(title, template.list(topcis), `<h2>${title}</h2>${fileContent}`, `<a href ="/create">create</a>`);
      response.writeHead(200);
      response.end(html);
    });
  },
  main_id: function (queryData, request, response) {
    var queryid = queryData.searchParams.get("id");
    connection.query(`SELECT * FROM topic`, function (error, topcis) {
      if (error) {
        throw error;
      }
      connection.query(`select * from topic left join author on topic.author_id = author.id where topic.id=?`, [queryid], function (error2, topic) {
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
      });
    });
  },
  create: function (response) {
    connection.query(`SELECT * FROM topic`, function (error, topics) {
      connection.query(`select * from author`, function (error2, authors) {
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
            ${template.author(authors)}
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
    });
  },
  process_create: function (request, response) {
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
        [post.title, post.description, post.author],
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
  },
  update: function (queryData, response) {
    connection.query(`SELECT * FROM topic`, function (error, topics) {
      connection.query(
        `select * from topic where id = ?`,
        [queryData.searchParams.get("id")],

        function (err, topic) {
          connection.query(`select * from author`, function (error2, authors) {
            html = template.html(
              topic[0].title,
              template.list(topics),
              `
            <form class="" action="/process_update" method="post" >
            <input type = "hidden" name = "id" value= "${topic[0].id}">
            <p><input type="text" name="title" placeholder="title" value = "${topic[0].title}"></p>
            <p><textarea name="description" rows="8" cols="80", placeholder="description">${topic[0].description}</textarea></p>
            <p>${template.author(authors, topic[0].author_id)}</p>
            <p><input type="submit"></p>
            </form>
            `,
              `
            <a href ="/create">create</a>
            <a href = "/update?id=${topic[0].id}">update</a>
            `
            );
            response.writeHead(200);
            response.end(html);
          });
        }
      );
    });
  },
  process_update: function (request, response) {
    qs = require("querystring");
    var body = "";
    request.on("data", function (data) {
      // data 정보 수신
      body = body + data;
    });
    request.on("end", function () {
      // data 정보 수신 종료
      var post = qs.parse(body);
      connection.query(
        `UPDATE topic SET title=?, description=?, author_id =? where id=?`,
        [post.title, post.description, post.author, post.id],
        function (error, topic) {
          response.writeHead(302, {
            Location: `/?id=${encodeURI(post.id)}`,
          }); // 302 : 리다이렉션
          response.end();
        }
      );
    });
  },
  process_delete: function (request, response) {
    qs = require("querystring");
    var body = "";
    request.on("data", function (data) {
      // data 정보 수신
      body = body + data;
    });
    request.on("end", function () {
      // data 정보 수신 종료

      var post = qs.parse(body);
      connection.query(`delete from topic where id = ?`, [post.id], function (err, result) {
        response.writeHead(302, { Location: `/` }); // 302 : 리다이렉션
        response.end();
      });
    });
  },
};
