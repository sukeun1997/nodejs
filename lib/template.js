module.exports = {
  html: function (title, list, body, control) {
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB23 - ${title}</title>
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
  },
  list: function (topics) {
    var list = "<ul>";
    for (var i = 0; i < topics.length; i++) {
      list =
        list + `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
    }

    return (list = list + "<ul>");
  },
};
