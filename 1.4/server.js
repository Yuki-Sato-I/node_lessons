var http = require('http');
var path = require('path');
var fs = require('fs');

var mimeTypes = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css'
};

var cache = {
  store:{},
  maxSize: 26214400, //バイト単位25MB
  maxAge: 5400 * 1000, //1.5時間
  cleanAfter: 7200 * 1000,
  cleanedAt: 0,
  clean: function(now) {
    if(now - this.cleanAfter > this.cleanedAt){
      this.cleanedAt = now;
      var that = this; //thisを次のループで使用する為、変数に入れとく
      Object.keys(this.store).forEach(function(file){
        if (now > that.store[file].timestamp + that.maxAge) {
          delete that.store[file];
        } 
      });
    }
  }
};

http.createServer(function (request, response) {
  var lookup = path.basename(decodeURI(request.url)) || 'index.html';
  f = 'content/' + lookup;

  fs.exists(f, function (exists){
    if(exists){
      var headers = {'Content-Type': mimeTypes[path.extname(f)]};
      if(cache[f]){
        response.writeHead(200, headers);
        response.end(cache[f].content);
        return;
      }

      var s = fs.createReadStream(f).once('open', function (){ //ストリームはopenイベントを一度しか発生させない
        response.writeHead(200, headers);
        this.pipe(response);
      }).once('error', function(e){ //エラー時
        console.log(e);
        response.writeHead(500);
        response.end('server error!');
      });

      fs.stat(f, function(err, stats){
        if(stats.size < cache.maxSize) { //特定のサイズ以下のファイルだけキャッシュ
          var bufferOffset = 0;
          cache.store[f] = {content: Buffer.alloc(stats.size), timestamp: Date.now()};
          s.on('data', function (data){
            data.copy(cache.store[f].content, bufferOffset);
            bufferOffset += data.length;
          });
        }
      });
      return;
    }
    response.writeHead(404);
    response.end('page not found');
  });
  cache.clean(Date.now());
}).listen(8080);