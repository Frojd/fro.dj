var http = require('http'),
	path = require('path'),
	url = require('url'),
	fs = require('fs'),
	util = require('util'),
// node_modules
	tako = require('tako'),
	mongo = require('mongodb'),
// variables
  	app = tako(),
	port = process.env.PORT || 5000,
// Mongo vars
	db,
	alias,
	mongoURI = url.parse(process.env.MONGOLAB_URI || 'mongodb://user:psw@subdomain.domain.topdomain:27017/database');


/* Set up mongo */

if( mongoURI ){
	console.log(mongoURI);
	db = new mongo.Db(mongoURI.path.substring(1), new mongo.Server(mongoURI.hostname, +mongoURI.port, {auto_reconnect: true}));

	db.open(function(err, database){
		db.authenticate(mongoURI.auth.split(':')[0], mongoURI.auth.split(':')[1], function(err, result){
			if( !err ){
				db = database;
				alias = require('./alias')({db: db});
			}
			else {
				console.log('Mongo connection failed pretty hard');
				console.log(err);
			}
		});
	});
}
else {
	console.log('Mongo connection failed really hard');
	console.log(mongoURI);
}


/* Route */

app.route('/static/*').files(path.join(__dirname, 'static'))

app.route('/')
	.file('html/index.html')
  .methods('GET');

app.route('/mini/*', function(req, res){
	var url = req.url,
		i;

	// Split the url
	url = url.split('/');
	
	// Trim empty indexes and mini
	for( i = 0; i < url.length; i++ ){
		if( url[i] === 'mini' || url[i] === '' ){
			url.splice(i--, 1);
		}
	}

	if( url.length === 1 ){
		// Needs an alias
		url[0] = decodeURIComponent(url[0]);

		alias.set(url[0], function(err, alias){
			if( !err ){
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end('{"alias": "' + alias + '"}');
			}
			else if( err.code === 400 ){
				// Malform error
				res.statusCode = 400;
				res.end('{"error": {"code": 400, "message": "The url doesn\'t look like a url..."}}');
			}
			else {
				// Server error
				res.statusCode = 500;
				res.end('{"error": {"code": 500, "message": "Something went terribly wrong, but we\'re not sure exactly what happened."}}');
			}
		});
	}
	else if( url.length === 2 ){
		url[0] = decodeURIComponent(url[0]);

		// Wants an alias
		alias.setCustom(url[0], url[1], function(err, alias){
			if( !err ){
				res.end('{"alias": "' + alias + '"}');
			}
			else if( err.code === 11000 ){
				// Server error
				res.statusCode = 409;
				res.end('{"error": {"code": 409, "message": "The alias \'' + url[1] + '\' is already taken. Please try another alias."}}');
			}
			else if( err.code === 400 ){
				// Malform error
				res.statusCode = 400;
				res.end('{"error": {"code": 400, "message": "The url or alias is not valid. The alias may only contain A-Z, a-z and 0-9"}}');
			}
			else {
				// Server error
				res.statusCode = 500;
				res.end('{"error": {"code": 500, "message": "Something went terribly wrong, but we\re not sure exactly what happened."}}');
			}
		});
	}
	else {
		// Malformed request
		res.statusCode = 400;
		res.end('{"error": {"code": 400, "message": "Malformed request. Must be /mini/URIComponentEncodedURI[/optional: desiredAlias]."}}');
	}
});

app.route('/*', function(req, res){
	alias.get(req.url.substring(1), function(err, url){
		var stat, readStream, filePath;

		if( err && err.code === 404 ){
			filePath = path.join(__dirname, 'html/404.html');
			stat = fs.statSync(filePath);

			res.writeHead(404, {
				'Content-Type': 'text/html',
				'Content-Length': stat.size
			});

			readStream = fs.createReadStream(filePath);
			util.pump(readStream, res);
		}
		else if( err || !url ){
			// Server error
			filePath = path.join(__dirname, 'html/500.html');
			stat = fs.statSync(filePath);

			res.writeHead(500, {
				'Content-Type': 'text/html',
				'Content-Length': stat.size
			});

			readStream = fs.createReadStream(filePath);
			util.pump(readStream, res);
		}
		else {
			// YAY!
			res.statusCode = 301;
			res.setHeader('Location', url);
			res.end('Redirecting to ' + url);
		}
	})
});

app.httpServer.listen(port);
console.log('Listening to port ' + port);