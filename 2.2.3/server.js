var http = require('http');
var fs = require('fs');
var form = fs.readFileSync('put_upload.html');

http.createServer(function (req, res) {
  if (req.method === 'GET') {
    res.writeHead(200, {'Contnt-Type': 'text/html'});
    res.end(form);
  }
  if (req.method === 'PUT') {
    var fileData = Buffer.alloc(+req.headers['content-length']);
    var bufferOffset = 0;

    req.on('data', function (chunk) {
      chunk.copy(fileData, bufferOffset);
      bufferOffset += chunk.length;
    }).on('end', function(){
      var rand = (Math.random() * Math.random()).toString(16).replace('.', '');
      var to = 'uploads/' + rand + '-' + req.headers['x-uploadedfilename'];
      fs.writeFile(to, fileData, function(err) {
        if (err) { throw err; }
        console.log('ファイルを' + to + 'に保存しました。');
        res.end();
      });
    });
  }
}).listen(8080);