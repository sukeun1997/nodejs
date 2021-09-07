var a = function() {
  console.log('A');
}

function show(callback) {
  callback();
}

show(a);
