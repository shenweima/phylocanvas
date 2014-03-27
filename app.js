require('longjohn');

//======================================================
// Read config file
//======================================================
console.log('✔ [WGST] Reading app config file');

var fs = require('fs'),
	file = __dirname + '/config.json';

var appConfigData = fs.readFileSync(file, 'utf8');

// Global var on purpose
appConfig = JSON.parse(appConfigData);

console.dir(appConfig);

//======================================================
// Module dependencies.
//======================================================
var express = require('express'),
	routes = require('./routes'),
	user = require('./routes/user'),
	assembly = require('./routes/assembly'),
	collection = require('./routes/collection');
	http = require('http'),
	path = require('path'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	socketio = require('socket.io');
	uuid = require('node-uuid');

var app = express();

// all environments
app.set('port', process.env.PORT || appConfig.server.port);
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
app.post('/collection/', collection.apiGetCollection);
app.post('/collection/add', collection.add);
app.get('/collection/:id', collection.get);

// Assembly routes
app.get('/assembly/:id', assembly.get);
//app.post('/assembly', assembly.getData);

app.post('/api/assembly', assembly.apiGetAssembly);
app.post('/api/assemblies', assembly.apiGetAssemblies);

app.post('/assembly/add', assembly.add);

app.post('/api/assembly/resistance-profile', assembly.getResistanceProfile);

// Data routes
app.get('/api/all-antibiotics', assembly.apiGetAllAntibiotics);

// Test routes
app.get('/dev/d3tree', require('./routes/dev').d3tree);
app.get('/dev/d3test', require('./routes/dev').d3test);
app.get('/dev/d3dots-svg', require('./routes/dev').d3dotsSVG);
app.get('/dev/d3dots-canvas', require('./routes/dev').d3dotsCanvas);
app.get('/dev/canvas', require('./routes/dev').canvas);

//app.post('/join', user.join);
//app.post('/signin', user.signIn);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('✔ [WGST] Express server listening on port ' + app.get('port'));
});

//======================================================
// Socket.io
//======================================================

var socketio = require('socket.io');

// Global variable on purpose - will store socket connection and will be shared with routes
socket = undefined;
io = socketio.listen(server);

io.sockets.on('connection', function (socketConnection) {
	console.log('✔ [WGST][Socket.io] Connnected');

	socketConnection.on('disconnect', function() {
		console.log('[WGST][Socket.io] Disconnnected');
	});

	socketConnection.on('getRoomId', function() {
		console.log('[WGST][Socket.io] Received request for room id');

		// Generate new room id
		var roomId = uuid.v4();

		// Join room
		socketConnection.join(roomId);

		console.log('[WGST][Socket.io] Emitting message with room id: ' + roomId);

		// Let client know their room id
		socketConnection.emit("roomId", roomId);
	});

	socket = socketConnection;
});

//======================================================
// Couchbase
//======================================================

var couchbase = require('couchbase');

// Global variable on purpose - will store socket connection and will be shared with routes
couchbaseDatabaseConnections = {},
testWgstBucket = 'test_wgst',
testWgstResourcesBucket = 'test_wgst_resources';

var createCouchbaseConnection = function(bucketName) {
	return new couchbase.Connection({
		host: 'http://129.31.26.151:8091/pools',
		bucket: bucketName,
		password: '.oneir66'
	}, function(error) {
		if (error) {
			console.error('✗ [WGST][Couchbase][ERROR] ' + error);
			return;
		}

		console.log('✔ [WGST][Couchbase] Successfuly opened Couchbase connection to "' + bucketName + '" bucket');
	});
};

couchbaseDatabaseConnections[testWgstBucket] = createCouchbaseConnection(testWgstBucket);
couchbaseDatabaseConnections[testWgstResourcesBucket] = createCouchbaseConnection(testWgstResourcesBucket);

// couchbaseDatabaseConnections[testWgstBucket] = new couchbase.Connection({
// 	host: 'http://129.31.26.151:8091/pools',
// 	bucket: testWgstBucket,
// 	password: '.oneir66'
// }, function(error) {
// 	if (error) {
// 		console.error('✗ [WGST][Couchbase][ERROR] ' + error);
// 		return;
// 	}

// 	console.log('✔ [WGST][Couchbase] Successfuly opened Couchbase connection to "' + testWgstBucket + '" bucket');
// });

// couchbaseDatabaseConnections[testWgstResourcesBucket] = new couchbase.Connection({
// 	host: 'http://129.31.26.151:8091/pools',
// 	bucket: testWgstResourcesBucket,
// 	password: '.oneir66'
// }, function(error) {
// 	if (error) {
// 		console.error('✗ [WGST][Couchbase][ERROR] ' + error);
// 		return;
// 	}

// 	console.log('✔ [WGST][Couchbase] Successfuly opened Couchbase connection to "' + testWgstResourcesBucket + '" bucket');
// });