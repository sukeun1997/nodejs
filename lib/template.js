var connection = require(`./db`);

module.exports = {
  html: function (title, list, body, control) {
    return `
    <!doctype html>
    <html>
    <head>
    <title>WEB - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      <a href ="/author">author</a>
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
      list = list + `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
    }

    return (list = list + "<ul>");
  },
  author: function (authors, author_id) {
    var tag = ``;
    var i = 0;
    while (i < authors.length) {
      var selected = ``;
      if (authors[i].id == author_id) {
        selected = `selected`;
      }
      tag += `<option value="${authors[i].id}"${selected}>${authors[i].name}</option>`;
      i++;
    }
    return `
    <select name= "author">
    ${tag}
  </select>
  `;
  },
  authorTable: function (authors) {
    var authorTable;
    var table = ``;
    for (var i = 0; i < authors.length; i++) {
      table += `<tr>
        <td>${authors[i].name}</td>
        <td>${authors[i].profile}</td>
        <td><a href = "/update_author?id=${authors[i].id}">update</a></td>
        <td><a href = "/process_delete_author?id=${authors[i].id}">delete</a></td>
        </tr>`;
    }
    authorTable = `<table>
    <tr>
      <th>title</th>
      <th>profile</th>
      <th>update</th>
      <th>delete</th>
    </tr>
    ${table}
  </table>
  
  <style>
  table {
      border : 2px solid; border-collapse: collapse;
  }
  th,td {
      border: 1px solid;
    }
  </style>
    `;

    return authorTable;
  },
  authorCreate: function () {
    return `<form class="" action="/process_create_author" method="post">
    <p>
      <input type="text" name="name" placeholder="name">
    </p>
    <p>
      <textarea name="description" placeholder="description"></textarea>
    </p>
    <p>
      <input type="submit">
    </p>
    </form>`;
  },
  authorUpdate: function (author) {
    var body = ``;
    body += `
      <p>
        <input type="text" name="name" placeholder="${author[0].name}">
      </p>
      <input type = "hidden" name = "id" value= "${author[0].id}">
      <p>
        <textarea name="description" placeholder="${author[0].profile}"></textarea>
      </p>
      <p>
        <input type="submit" value="update">
      </p>
      `;
    return `
    <form class="" action="/process_update_author" method="post">
    ${body}
    </form>
    `;
  },
};
