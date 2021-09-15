var connection = require(`./db`);
var template = require(`./template`);
var title;
var fileContent;
var html;
var qs = require("querystring");

module.exports = {
  author_list: function (response) {
    connection.query(`SELECT * FROM topic`, function (error, topcis) {
      connection.query(`select * from author`, function (error, authors) {
        title = "AuthorList";
        fileContent = `    
        ${template.authorTable(authors)} 
        ${template.authorCreate()}
      `;
        html = template.html(title, template.list(topcis), `<h2>${title}</h2>${fileContent}`, ``);
        response.writeHead(200);
        response.end(html);
      });
    });
  },

  process_create_author: function (request, response) {
    var body = "";
    request.on("data", function (data) {
      // data 정보 수신
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body);
      console.log(post);
      connection.query(`insert into author (name,profile) values(?,?)`, [post.name, post.description], function (error, result) {
        if (error) {
          throw error;
        }
        response.writeHead(302, {
          Location: `/author`,
        }); // 302
        response.end();
      });
    });
  },
  update: function (queryData, response) {
    connection.query(`SELECT * FROM topic`, function (error, topcis) {
      var queryid = queryData.searchParams.get("id");
      connection.query(`select * from author`, function (error, authors) {
        connection.query(`select * from author where id = ?`, [queryid], function (error, author) {
          title = "AuthorList";
          fileContent = `    
        ${template.authorTable(authors)} 
        ${template.authorUpdate(author)}
      `;
          html = template.html(title, template.list(topcis), `<h2>${title}</h2>${fileContent}`, ``);
          response.writeHead(200);
          response.end(html);
        });
      });
    });
  },

  process_update_author: function (request, response) {
    var body = "";
    request.on("data", function (data) {
      // data 정보 수신
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body);
      connection.query(`update author set name = ?, profile =? where id = ?`, [post.name, post.description, post.id], function (error, result) {
        if (error) {
          throw error;
        }
        response.writeHead(302, {
          Location: `/author`,
        }); // 302
        response.end();
      });
    });
  },

  process_delete_author: function (queryData, response) {
    var queryid = queryData.searchParams.get("id");
    connection.query(`delete from author where id = ? `, [queryid], function (error, result) {
      response.writeHead(302, {
        Location: `/author`,
      }); // 302
      response.end();
    });
  },
};
