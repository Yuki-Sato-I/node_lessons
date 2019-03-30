var http = require('http');
var fs = require('fs');

var options = {};
options.file = '50meg';
options.fileSize = fs.statSync(options.file).size;
options.kbps = 32;

http.createServer(function(req, res) {
  var download = Object.create(options); //optionsオブジェクトを継承するオブジェクト
  download.chunks = Buffer.alloc(download.fileSize);
  download.bufferOffset = 0;
  res.writeHeader(200, {'Content-Length': options.fileSize});
  fs.createReadStream(download.file)
  .on('data', function(chunk) {
    chunk.copy(download.chunks, download.bufferOffset);
    download.bufferOffset += chunk.length;
  }).once('open', function(){
    var handleAbort = throttle(download, function (send){
      res.write(send);
    });
    req.on('close', function(){
      handleAbort();
    });
  });
}).listen(8080);

function throttle(download, cb){
  var chunkOutSize = download.kbps * 1024;
  var timer = 0;
  (function loop(bytesSent){
    if(!download.aborted) {
      setTimeout(function (){
        var bytesOut = bytesSent + chunkOutSize;
        if(download.bufferOffset > bytesOut){
          timer = 1000;
          cb(download.chunks.slice(bytesSent, bytesOut));
          loop(bytesOut);
          return;
        }
        if(bytesOut >= download.chunks.length){
          cb(download.chunks.slice(bytesSent));
          return;
        }
        loop(bytesSent);
      }, timer);
    }
  }(0));
  return function(){
    download.aborted = true;
  };
}