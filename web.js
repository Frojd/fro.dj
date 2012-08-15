var http = require('http'),
		path = require('path'),
		fs = require('fs'),
		util = require('util'),
		// node_modules
		tako = require('tako'),
		mongo = require('mongodb'),
		// variables
  	app = tako(),
		port = process.env.PORT || 5000;

/* Set up mongo */

var dbhost = process.env['MONGO_NODE_DRIVER_HOST'] || 'localhost',
	dbport = process.env['MONGO_NODE_DRIVER_PORT'] || 27017;

console.log("Connecting to " + dbhost + ":" + dbport);

var db = new mongo.Db('frodj', new mongo.Server(dbhost, dbport, {auto_reconnect: true})),
	alias = require('./alias.js')({db: db});

/* Route */

app.route('/static/*').files(path.join(__dirname, 'static'))

app.route('/')
	.file('html/index.html')
  .methods('GET');

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