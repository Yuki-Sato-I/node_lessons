var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');//file status

http.createServer(function (request, response) {
  var lookup = url.parse(decodeURI(request.url)).pathname;
  lookup = (lookup === '/') ? '/index.html-serve' : lookup + '-serve';
  var f = 'content-pseudosafe' + lookup;
  console.log(f);
  fs.exists(f, function (exists) {
    if (!exists) {
      response.writeHead(404);
      response.end();
      return;
    }
    fs.readFile(f, function (err, data) {
      response.end(data);
    });
  });


}).listen(8080);