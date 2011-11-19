var http = require('http'),
	url = require('url'),	
	mUtil = require('./mUtil');

var HOST = 'localhost',
	PORT = 3000;


var urlMap = {
	'/' : mUtil.staticHanlder.bind(null, 'index.html'),
	'/app.js' : mUtil.staticHanlder.bind(null, 'app.js'),	
	'/backbone.js' : mUtil.staticHanlder.bind(null, 'backbone.js'),
	'/underscore.js' : mUtil.staticHanlder.bind(null, 'underscore.js'),
	'/jquery-1.7.min.js' : mUtil.staticHanlder.bind(null, 'jquery-1.7.min.js'),
	'/color/test' : function(req, res) {
		console.log('req.url : ' + req.url);
		var handler = colorMap[req.method] || mUtil.notFound;
		handler(req, res);
	}	
}
var cache = { };
var colorMap = {
	POST : function(req, res) {
		var content = '';		
		req.addListener("data", function(chunk) {
			console.log('chunk : ' + chunk);			
			content += chunk;
		});
		req.addListener("end", function() {
			//parse req.content and do stuff with it
			console.log('content : ' + content);
			mUtil.sendSuccess(res);
		});
	},
	
	GET : function(req, res) {
		console.log('cache : ' + cache);		
		mUtil.simpleJson(res, cache);
	},
	
	PUT : function(req, res) {
		var content = '';		
		req.addListener("data", function(chunk) {
			console.log('chunk : ' + chunk);
			content += chunk;
		});
		req.addListener("end", function() {
			//parse req.content and do stuff with it
			console.log('content : ' + content);
			var model = JSON.parse(content);
			//cache[model.id] = model.color;
			cache = model;
			console.log(cache);
			mUtil.sendSuccess(res);
		});		
	},
	
	DELETE : function(req, res) {
		console.log('delete called');
		
	}	
}





http.createServer(function (req, res) {				
	var pathName = mUtil.getPathString(req.url),
		handler;
	console.log('req.method : ' + req.method);
	console.log('pathName : ' + pathName);		
	handler = urlMap[pathName] || mUtil.notFound;	
	handler(req, res);		
	
}).listen(PORT, HOST);
console.log('Server running at http://' + HOST);

