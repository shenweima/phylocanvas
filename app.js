
/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	user = require('./routes/user'),
	assembly = require('./routes/assembly'),
	collection = require('./routes/collection');
	http = require('http'),
	path = require('path'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	socket = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
// http://stackoverflow.com/a/19965089
app.use(express.json({limit: '500mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// App home route
app.get('/', routes.index);

app.post('/representative-tree-metadata', routes.getRepresentativeTreeMetadata);

// User routes
app.get('/users', user.list);
app.get('/users/name/:name', user.name);

// Collection routes
app.post('/collection/', collection.get);
app.post('/collection/add', collection.add);

// Assembly routes
app.get('/assembly/:id', assembly.get);
//app.post('/assembly', assembly.getData);

app.post('/api/assembly', assembly.apiGetAssembly);
app.post('/api/assemblies', assembly.apiGetAssemblies);

app.post('/assembly/add', assembly.add);

app.post('/api/assembly/resistance-profile', assembly.getResistanceProfile);

// Data routes
app.get('/api/all-antibiotics', assembly.getAllAntibiotics);

// Test routes
app.get('/dev/d3tree', require('./routes/dev').d3tree);
app.get('/dev/d3test', require('./routes/dev').d3test);
app.get('/dev/d3dots-svg', require('./routes/dev').d3dotsSVG);
app.get('/dev/d3dots-canvas', require('./routes/dev').d3dotsCanvas);
app.get('/dev/canvas', require('./routes/dev').canvas);

//app.post('/join', user.join);
//app.post('/signin', user.signIn);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Sockets.io

var io = socket.listen(server);

io.sockets.on('connection', function (socket) {
	console.log('[WGST][Socket.IO] Connnected');

	socket.on('disconnect', function (socket) {
		console.log('[WGST][Socket.IO] Disconnnected');
	});

	socket.emit("pong", { hello: "world" });

	socket.on('ping', function (data) {
		console.log('[WGST][Socket.IO] Received ping');

		socket.emit("pong", { say: "It works!" });
	});
});