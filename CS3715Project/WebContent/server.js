var http = require("http");
var fs = require("fs");
http.createServer(function(req, res) {
	var file = __dirname + req.url;
	if(req.url === '/') {
		file = __dirname + '//index.html'
	}
	fileServer(file, req, res);

}).listen(80);
fileServer= function(file, req, res) {
    var fs = require('fs'),
    ext = require('path').extname(file),
    type = '',
    fileExtensions = {
		'html':'text/html',
		'css':'text/css',
		'js':'text/javascript',
		'json':'application/json',
		'png':'image/png',
		'jpg':'image/jpg'
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
			fs.createReadStream(file).pipe(res);
			console.log('Served: '+req.url);
		} else {
			console.log(file,': Not Found');
		}
    });
}
// Console will print the message
console.log('Server running at http://127.0.0.1:80/');
