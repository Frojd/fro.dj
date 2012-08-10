var http = require('http'),
		path = require('path'),
		// node_modules
		tako = require('tako'),
		// variables
  	app = tako(),
		port = process.env.PORT || 5000;

app.route('/static/*').files(path.join(__dirname, 'static'))

app.route('/')
	.file('html/index.html')
  .methods('GET');

app.httpServer.listen(port)