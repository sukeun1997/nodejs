var http = require('http');
var fs = require('fs');

function templateHTML(title, list, body, control) {
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB2 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${control}
    ${body}
  </body>
  </html>
  `;
}

function fileList(filelist) {
  var list = '<ul>'
  for (var i = 0; i < filelist.length; i++) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
  }
  return list = list + '<ul>';
}
var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = new URL('http://localhost:3000' + _url);
  var title = queryData.searchParams.get('id');

  if (queryData.pathname === '/') { // 정상적인 접근 경로
    var fileContent = '';
    var template;

    if (queryData.searchParams.get('id') == null) { // 메인화면
      fs.readdir('data', function(error, filelist) {
        title = 'Welcome';
        fileContent = 'Hello, Node.js';
        template = templateHTML(title, fileList(filelist),
        `<h2>${title}</h2>${fileContent}`,
        `<a href ="/create">create</a>`
        );
        response.writeHead(200);
        response.end(template);
      });
    } else { // id 값이 있는 경우
      fs.readdir('data', function(error, filelist) {
        fs.readFile(`data/${queryData.searchParams.get('id')}`, 'utf8', function(err, description) {
          template = templateHTML(title, fileList(filelist),
          `<h2>${title}</h2>${description}`,
          `
          <a href ="/create">create</a>
          <a href = "/update?id=${title}">update</a>
          <form action ="/process_delete" method = "post">
            <input type = "hidden" name = "id" value ="${title}">
            <input type = "submit" value="delete">
          </form>
          `);
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else if (queryData.pathname == '/create') {
    fs.readdir('data', function(error, filelist) {
      title = 'WEB - CREATE';
      fileContent = 'Hello, Node.js';
      template = templateHTML(title, fileList(filelist),
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
      `,``);
      response.writeHead(200);
      response.end(template);
    });
  } else if (queryData.pathname == '/process_create') {
    var qs = require('querystring');
    var body = '';
    request.on('data', function(data) { // data 정보 수신
        body = body + data;
    });
    request.on('end', function() { // data 정보 수신 종료
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){

          response.writeHead(302, {Location: `/?id=${encodeURI(title)}`}); // 302 : 리다이렉션
          response.end();
        });
    });

  } else if (queryData.pathname == '/update') {

    fs.readdir('data', function(error, filelist) {
      fs.readFile(`data/${queryData.searchParams.get('id')}`, 'utf8', function(err, description) {
        template = templateHTML(title, fileList(filelist),
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
        response.end(template);
      });
    });
  } else if(queryData.pathname == '/process_update') {

    var qs = require('querystring');
    var body = '';
    request.on('data', function(data) { // data 정보 수신
        body = body + data;
    });
    request.on('end', function() { // data 정보 수신 종료
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`,`data/${title}`,function(err){
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${encodeURI(title)}`}); // 302 : 리다이렉션
            response.end();
          });
        });
    });
  } else if(queryData.pathname =='/process_delete') {

    var qs = require('querystring');
    var body = '';
    request.on('data', function(data) { // data 정보 수신
        body = body + data;
    });
    request.on('end', function() { // data 정보 수신 종료
        var post = qs.parse(body);
        console.log(post);
        var id = post.id;
        fs.unlink(`data/${id}`, function(err) {
          console.log(err);
          response.writeHead(302, {Location: `/`}); // 302 : 리다이렉션
          response.end();
        });
    });

  } else {
    response.writeHead(404);
    response.end('Not Found');
  }
});
app.listen(3000);
