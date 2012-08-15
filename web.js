var http = require('http'),
		path = require('path'),
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

app.httpServer.listen(port);