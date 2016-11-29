

var http = require("http");
var fs = require("fs");
var util = require("util");
var multiparty = require('multiparty');
var stringify = require('stringifier');
var tls = require('tls');
var path = require('path');
var ip = '127.0.0.1';
var port = 3337;
var data = JSON.parse(fs.readFileSync('server/data','utf8'));
var options = {
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-crt.pem'),
    ca: fs.readFileSync('ca-crt.pem'),
};
var fileExtensions = {
	'.html':'text/html',
	'.css':'text/css',
	'.js':'text/javascript',
	'.json':'application/json',
	'.png':'image/png',
	'.jpg':'image/jpg'
};
logTime = function(date) {
	if(!date)
		date = new Date();
	var hour = (date.getHours() < 10 ? "0" : "") + date.getHours();
    var min  = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    var sec = (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
    var year = date.getFullYear();
    var month = ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1);
    var day = (date.getDate() < 10 ? "0" : "") + date.getDate();
    return year+month+day+hour+min+sec;
}
fs.writeFile('server/backup' + logTime() + '.json', JSON.stringify(data),'utf8');

var server = http.createServer(function(req, res) {
	var file = __dirname + req.url;
	if (req.url === '/favicon.ico') {
		var f = fs.createReadStream(file);
		f.pipe(res);
	} else
		if(req.method == 'POST'){
			handlePOST(req,res);
		} else if(req.method =='GET') {
			if(req.url === '/') {
				index = __dirname + '/index.html';
				fs.exists(index, function(exists) {
					if(exists) {
						var f = fs.createReadStream(index);
						res.writeHead(200, { 'Content-Type': fileExtensions['.html']});
						f.pipe(res);
						console.log('Served: ' + index + ', Content-Type: ' + fileExtensions['.html']);
					}
					else
						console.log(file,': Not Found');
				});
			} else
				handleGET(file, req, res);
}
}).on('connection', function(socket) {
  socket.setTimeout(8000);
}).listen(port);
handleGET = function(file, req, res) {
	console.log('Requested: ' + req.url);
	var weburl = req.url.split('/');
	//console.log(weburl);
	switch(weburl[0]+weburl[1]){
		case 'profile':
			var ext = path.extname(req.url);
			var profile = 'src/html/';
			if(ext == '.appcache')
				profile += weburl[2];
			else {
				profile += 'profile.html';

			}
			ext = path.extname(profile);
			var type = fileExtensions[ext];
			fs.exists(profile, function(exists) {
				if(exists) {
					var f = fs.createReadStream(profile);
					res.writeHead(200, { 'Content-Type': type });
					f.pipe(res);
					console.log('Served: ' + profile + ', Content-Type: ' + type);
				}
				else
					console.log(file,': Not Found');
			});
			break;
		case 'location':
			var location = 'src/html/location.html';
			var ext = path.extname(location);
			var type = fileExtensions[ext];
			fs.exists(location, function(exists) {
				if(exists) {
					var f = fs.createReadStream(location);
					res.writeHead(200, { 'Content-Type': type });
					f.pipe(res);
					console.log('Served: ' + location + ', Content-Type: ' + type);
				}
				else
					console.log(file,': Not Found');
			});
			break;
		case 'css':
			var css = 'src/css/'+ weburl[2];
			var ext = path.extname(css);
			var type = fileExtensions[ext];
			fs.exists(css, function(exists) {
				if(exists) {
					var f = fs.createReadStream(css);
					res.writeHead(200, { 'Content-Type': type});
					f.pipe(res);
					console.log('Served: ' + css + ', Content-Type: ' + type);
				}
				else
					console.log(file,': Not Found');
			});
			break;
		case 'javascript':
			var javascript = 'src/javascript/' + weburl[2];
			var ext = path.extname(javascript);
			var type = fileExtensions[ext];
			fs.exists(javascript, function(exists) {
				if(exists) {
					var f = fs.createReadStream(javascript);
					res.writeHead(200, { 'Content-Type': type });
					f.pipe(res);
					console.log('Served: ' + javascript + ', Content-Type: ' + type);
				}
				else
					console.log(file,': Not Found');
			});
			break;
		case 'img':
			var img = 'img/' + weburl[2] + '/' + weburl[3];
			var ext = path.extname(img);
			var type = fileExtensions[ext];
			fs.exists(img, function(exists) {
				if(exists) {
					var f = fs.createReadStream(img);
					res.writeHead(200, { 'Content-Type': type });
					f.pipe(res);
					console.log('Served: ' + img + ', Content-Type: ' + type);
				}
				else
					console.log(file,': Not Found');
			});
			break;
		case 'server':
			var server = 'server/' + weburl[2];
			var ext = path.extname(server);
			var type = 'text/plain';
			if(weburl[2] == 'admin') {
				type = 'text/html';
			}
			fs.exists(server, function(exists) {
				if(exists) {
					var f = fs.createReadStream(server);
					res.writeHead(200, { 'Content-Type': type });
					f.pipe(res);
					console.log('Served: ' + server + ', Content-Type: ' + type);
				}
				else
					console.log(file,': Not Found');
			});
			break;
		default:
			console.log(file,': Not Found');
	}
}
handlePOST = function(req,res) {
	var form = new multiparty.Form();
	var weburl = req.url.split('/');
	form.parse(req,function(err,fields,files){
		switch(weburl[1]) {
			case 'profile':
				for(var d in fields){
					switch(d){
						case 'add':
							data['Data']['People'][fields[d][0]]['friends'][fields[d][1]] = true;
							break;
						case 'remove':
							data['Data']['People'][fields[d][0]]['friends'][fields[d][1]] = undefined;
							break;
						default:
							break;
					}
				}
				break;
			case 'location':
				for(var d in fields) {
					data['Data']['People'][d]['locations'] = JSON.parse(fields[d][0]);
				}
				break;
			case 'server':
				for(var d in fields) {
					switch(fields[d][0]) {
						case 'reset':
							for(var k in data['Data']['People']){
								data['Data']['People'][k]['locations'] = undefined;
								data['Data']['People'][k]['friends'] = {};
							}
							break;
						default:
							break;
					}
				}
				break;
			default:
				break;
		}
		fs.writeFileSync('server/data',JSON.stringify(data),'utf8');
		res.writeHead(200,{'Action':'Okay'});
		res.end();
	});
}
console.log('Server running at http://%s:%s/',ip,port);
