var http = require('http');
var fs = require('fs');

var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'roor',
  password: 'tnrms2188',
  database: 'opentutorials'
});
db.connect();


var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = new URL('http://localhost:3000' + _url);
  var title = queryData.searchParams.get('id');

  if (queryData.pathname === '/') { // 정상적인 접근 경로
    var fileContent = '';
    var html;

    if (queryData.searchParams.get('id') == null) { // 메인화면
      // fs.readdir('data', function(error, filelist) {
      //   title = 'Welcome';
      //   fileContent = 'Hello, Node.js';
      //   html = template.html(title, template.list(filelist),
      //   `<h2>${title}</h2>${fileContent}`,
      //   `<a href ="/create">create</a>`
      //   );
      //   response.writeHead(200);
      //   response.end(html);
      // });
      connection.query(`SELECT * FROM topic`, function{

      })
    } else { // id 값이 있는 경우
      fs.readdir('data', function (error, filelist) {
        var filteredId = path.parse(queryData.searchParams.get('id')).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
          var sanitizedTitel = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description, {
            allowedTags: ['h1']
          });
          html = template.html(sanitizedTitel, template.list(filelist),
            `<h2>${sanitizedTitel}</h2>${sanitizedDescription}`,
            `
          <a href ="/create">create</a>
          <a href = "/update?id=${sanitizedTitel}">update</a>
          <form action ="/process_delete" method = "post">
            <input type = "hidden" name = "id" value ="${sanitizedTitel}">
            <input type = "submit" value="delete">
          </form>
          `);
          response.writeHead(200);
          response.end(html);
        });
      });
    }
  } else if (queryData.pathname == '/create') {
    fs.readdir('data', function (error, filelist) {
      title = 'WEB - CREATE';
      fileContent = 'Hello, Node.js';
      html = template.html(title, template.list(filelist),
        `
      <form class="" action="/process_create" method="post">
      <p>
        <input type="text" name="title" placeholder="title">
      </p>
      <p>
        <textarea name="description" rows="8" cols="80"></textarea>
      </p>
      <p>
        <input type="submit">
      </p>
      </form>
      `, ``);
      response.writeHead(200);
      response.end(html);
    });
  } else if (queryData.pathname == '/process_create') {
    var qs = require('querystring');
    var body = '';
    request.on('data', function (data) { // data 정보 수신
      body = body + data;
    });
    request.on('end', function () { // data 정보 수신 종료
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', function (err) {

        response.writeHead(302, { Location: `/?id=${encodeURI(title)}` }); // 302 : 리다이렉션
        response.end();
      });
    });

  } else if (queryData.pathname == '/update') {

    fs.readdir('data', function (error, filelist) {
      var filteredId = path.parse(queryData.searchParams.get('id')).base;
      fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        html = template.html(title, template.list(filelist),
          `
        <form class="" action="/process_update" method="post" >
        <input type = "hidden" name = "id" value= "${title}">
        <p>
          <input type="text" name="title" placeholder="title" value = "${title}">
        </p>
        <p>
          <textarea name="description" rows="8" cols="80", placeholder="description">${description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
        </form>
        `,
          `
        <a href ="/create">create</a>
        <a href = "/update?id=${title}">update</a>
        `);
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (queryData.pathname == '/process_update') {

    var qs = require('querystring');
    var body = '';
    request.on('data', function (data) { // data 정보 수신
      body = body + data;
    });
    request.on('end', function () { // data 정보 수신 종료
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      var filteredId = path.parse(id).base;

      fs.rename(`data/${filteredId}`, `data/${title}`, function (err) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
          response.writeHead(302, { Location: `/?id=${encodeURI(title)}` }); // 302 : 리다이렉션
          response.end();
        });
      });
    });
  } else if (queryData.pathname == '/process_delete') {

    var qs = require('querystring');
    var body = '';
    request.on('data', function (data) { // data 정보 수신
      body = body + data;
    });
    request.on('end', function () { // data 정보 수신 종료
      var post = qs.parse(body);
      console.log(post);
      var id = post.id;
      var filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, function (err) {
        console.log(err);
        response.writeHead(302, { Location: `/` }); // 302 : 리다이렉션
        response.end();
      });
    });

  } else {
    response.writeHead(404);
    response.end('Not Found');
  }
});
app.listen(3000);
