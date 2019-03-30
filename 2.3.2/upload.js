var http = require('http');
var fs = require('fs');
var urlOpts = {
  host: 'localhost',
  path: '/',
  port: '8080',
  method: 'POST'
};
var boundary = Date.now();
urlOpts.headers = {
  'Content-Type': 'multipart/form-data; boundary="' + boundary + '"'
};

boundary = '--' + boundary;
var request = http.request(urlOpts, function(res){
  res.on('data', function (chunk) {
    console.log(chunk.toString());
  });
}).on('error', function(e){
  console.log('error!!!:' + e.stack);
});

(function multipartAssembler(files){
  var f = files.shift();//shiftメソッドは0番目のインデックスの要素を削除してインデックスの連番の値をシフトし、 削除した値を返す。
  var fSize = fs.statSync(f).size;
  var progress = 0;
  fs.createReadStream(f)
  .once('open', function(){
    request.write(boundary + '\r\n' + 'Content-Disposition: form-data; name="userfile"; filename="' + f + '"\r\n' +
                  'Content-Type: application/octet-stream\r\n' + 'Content-Transfer-Encoding: binary\r\n\r\n');
  }).on('data', function(chunk){
    request.write(chunk);
    progress += chunk.length;
    console.log(f + ': ' + Math.round((progress / fSize) * 10000) / 100 + '%');
  }).on('end', function(){
    if(files.length){
      request.write('\r\n');
      multipartAssembler(files);
      return;
    }
    request.end('\r\n' + boundary + '--\r\n\r\n\r\n');
  });
}(process.argv.splice(2, process.argv.length)));//files = [file1, file2, fileN]
//functionに()がついているので即実行