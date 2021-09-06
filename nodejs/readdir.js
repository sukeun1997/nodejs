var test = 'data';
var fs = require('fs');

fs.readdir(test, function(error, filelist) {
  console.log(filelist);
})
