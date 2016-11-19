var http = require("http");
var fs = require("fs");
var express = require("express");
var util = require("util");
var multiparty = require('multiparty');
var stringify = require('stringifier');
var path = require('path');
var app = express();
var ip = '127.0.0.1';
var port = 8080;
http.createServer(function(req, res) {
	var file = __dirname + req.url;
	if(req.method == 'POST'){
		handlePOST(req);
	} else if(req.method =='GET') {
		if(req.url === '/') {
			file = __dirname + '//index.html'
		}
		handleGET(file, req, res);
	}
}).listen(port);
handleGET = function(file, req, res) {
    var ext = path.extname(file);
    var type = '';
    fileExtensions = {
		'.html':'text/html',
		'.css':'text/css',
		'.js':'text/javascript',
		'.json':'application/json',
		'.png':'image/png',
		'.jpg':'image/jpg'
	};
    console.log('Requested: ' + req.url);
	for(var i in fileExtensions) {
		if(ext === i) {
			type = fileExtensions[i];
			break;
		}
	}
    fs.exists(file, function(exists) {
		if(exists) {
			res.writeHead(200, { 'Content-Type': type });
			var f = fs.createReadStream(file);
			f.pipe(res);
			console.log('Served: ' + req.url + ', Content-Type: ' + type);
		} else {
			console.log(file,': Not Found');
		}
    });
}
handlePOST = function(request) {
	var form = new multiparty.Form();
	form.parse(request,function(err,fields,files){
		body = fields;
		console.log(body);
		for(var k in body){
			switch(k){
				case 'add':
					console.log(body[k]);
					break;
				default:
					break;
			}
		}
	});
}
console.log('Server running at http://%s:%s/',ip,port);
