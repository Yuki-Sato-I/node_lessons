var http = require('http');
var formidable = require('formidable');
var form = require('fs').readFileSync('form.html');

http.createServer(function (req, res) {
  if (req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
    res.end(form);
  }
  if (req.method === 'POST') {

    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
    var incoming = new formidable.IncomingForm();
    incoming.uploadDir = 'uploads';//ファイルをアップロードするディレクトリを指定

    incoming.on('fileBegin', function (field, file){

      if (file.name) {
        file.path += '-' + file.name;
      }

    }).on('file', function (field, file) {

      if(!file.size){return;}
      res.write(file.name + 'を受け取りました\n');

    }).on('field', function (field, value){

      res.write(field + ':' + value + '\n'); //fieldはinputのname

    }).on('end', function (){

      res.end('全てのファイルを受け取りました。');

    });

    incoming.parse(req);

  }
}).listen(8080);