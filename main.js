var http = require('http');
var fs = require('fs');

function templateHTML(title, list , body) {
  return`
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${body}
  </body>
  </html>
  `;
}

function fileList(filelist) {
  var list = '<ul>'
   for(var i = 0; i < filelist.length; i++) {
     list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
   }
   return list = list +'<ul>';
}
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = new URL('http://localhost:3000' + _url);
    var title = queryData.searchParams.get('id');

    if(queryData.pathname === '/') { // 정상적인 접근 경로
          var fileContent = '';
          var template;

          if(queryData.searchParams.get('id') == null) {  // 메인화면
            fs.readdir('data' , function (error, filelist) {
              title = 'Welcome';
              fileContent = 'Hello, Node.js'
              template = templateHTML(title, fileList(filelist) , `<h2>${title}</h2>${fileContent}`);
              response.writeHead(200);
              response.end(template);
            })
          } else { // id 값이 있는 경우
              fs.readdir('data' , function (error, filelist) {
                fs.readFile(`data/${queryData.searchParams.get('id')}`, 'utf8' , function(err,description) {
                  template = templateHTML(title, fileList(filelist) , `<h2>${title}</h2>${description}`);
                  response.writeHead(200);
                  response.end(template);
                });
            })
          }

  } else {
        response.writeHead(404);
        response.end('Not Found');
  }
});
app.listen(3000);
