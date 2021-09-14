var http = require("http");
var topic = require(`./lib/topic`);

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = new URL("http://localhost:3000" + _url);

  if (queryData.pathname === "/") {
    if (queryData.searchParams.get("id") == null) {
      topic.main(response); // 메인화면
    } else {
      topic.main_id(queryData, request, response); // id 값이 있는경우
    }
  } else if (queryData.pathname == "/create") {
    topic.create(response); // create
  } else if (queryData.pathname == "/process_create") {
    topic.process_create(request, response); // process_create
  } else if (queryData.pathname == "/update") {
    topic.update(queryData, response);
  } else if (queryData.pathname == "/process_update") {
    topic.process_update(request, response);
  } else if (queryData.pathname == "/process_delete") {
    topic.process_delete(request, response);
  } else {
    response.writeHead(404);
    response.end("Not Found");
  }
});
app.listen(3000);
