//POSTデータの取り扱い
var http = require('http');
var querystring = require('querystring');
var util = require('util');
var form = require('fs').readFileSync('form.html');
var maxData = 2 * 1024 * 1024 //2MB

http.createServer(function (req, res) {
  if (req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'text/html' + ';charset=utf-8'});
    res.end(form);
  }
  if (req.method === 'POST') {
    var postData = '';
    req.on('data', function (chunk) {
      postData += chunk;
      if (postData.length > maxData) {
        postData = '';
        this.pause; //ストリーム中断 destroyにしちゃうとレスポンスを返せなくなる
        res.writeHead(413);
        res.end('POSTデータが大きすぎます。');
      }
    }).on('end', function (){
      if (!postData) {
        res.end();
        return;
      }
      var postDataObject = querystring.parse(postData);
      console.log(postDataObject);
      console.log('ユーザが次のデータをPOSTしました:\n' + postData);
      res.writeHead(200, {'Content-Type': 'text/html' + ';charset=utf-8'});
      res.end('あなたがPOSTしたデータ:\n' + util.inspect(postDataObject));
    });
  }
}).listen(8080);