require('longjohn');

//======================================================
// Read config file
//======================================================
console.log('[WGST] ✔ Reading app config file');

var fs = require('fs'),
	file = __dirname + '/config.json',
	COUCHBASE_DEFAULT_ADDRESS = '127.0.0.1';

var appConfigData = fs.readFileSync(file, 'utf8');
// Global var on purpose
appConfig = JSON.parse(appConfigData);
console.dir(appConfig);

//======================================================
// SSL
//======================================================
// var sslOptions = {
//   key: fs.readFileSync('./ssl/server.key'),
//   cert: fs.readFileSync('./ssl/server.crt'),
//   ca: fs.readFileSync('./ssl/ca.crt'),
//   requestCert: true,
//   rejectUnauthorized: false
// };

//======================================================
// Module dependencies
//======================================================
var express = require('express'),
	//favicon = require('serve-favicon'),
	morgan  = require('morgan'),
	bodyParser = require('body-parser'),
	//methodOverride = require('method-override'),
	//cookieParser = require('cookie-parser'),
	//session = require('express-session'),
	router = express.Router(),
	routes = require('./routes'),
	user = require('./routes/user'),
	assembly = require('./routes/assembly'),
	collection = require('./routes/collection');
	http = require('http'),
	//https = require('https'),
	path = require('path'),
	socketio = require('socket.io');
	uuid = require('node-uuid'),
	swig = require('swig'),
	app = express();

app.set('port', process.env.PORT || appConfig.server.node.port);
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
//app.use(favicon(__dirname + '/favicon.ico'));
app.use(morgan('dev', { immediate: true }));
// http://stackoverflow.com/a/19965089
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({
	extended: true,
	limit: '50mb'
}));
//app.use(methodOverride('X-HTTP-Method-Override'));
//app.use(cookieParser());
// app.use(session({
//     secret: 'keyboard cat',
//     proxy: true // if you do SSL outside of node.
// }));
// app.use(passport.initialize());
// app.use(passport.session());
//app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));

//
// Set our own x-powered-by header
//
app.use(function(req, res, next){
    res.header("X-powered-by", "Blood, sweat, and tears");
    next();
});

// App home route
app.get('/', routes.index);

app.post('/feedback', routes.feedback);
app.post('/subscribe', routes.subscribe);

// User routes
app.get('/users', user.list);
app.get('/users/name/:name', user.name);

// Collection routes
app.post('/collection/', collection.apiGetCollection);
app.post('/collection/add', collection.add);
app.get('/collection/new', collection.newCollection);

//app.get('/collection/representative', routes.getRepresentativeTreeMetadata);
app.get('/api/collection/representative/metadata', collection.apiGetRepresentativeCollection);
app.get('/collection/:id', collection.get);

app.post('/api/collection/tree/merge', collection.mergeCollectionTrees);
app.post('/api/collection/merged', collection.apiGetMergeTree);

// Assembly routes
app.get('/assembly/:id', assembly.get);
//app.post('/assembly', assembly.getData);

app.post('/api/assembly', assembly.apiGetAssembly);
app.post('/api/assemblies', assembly.apiGetAssemblies);
app.post('/api/assembly/table-data', assembly.apiGetAssemblyTableData);

//app.post('/api/assemblies', assembly.apiGetAssemblies);

app.post('/assembly/add', assembly.add);

app.post('/api/assembly/resistance-profile', assembly.apiGetResistanceProfile);

// Data routes
//
app.get('/api/all-antibiotics', assembly.apiGetAllAntibiotics);

// Download
//
app.get('/api/download/assembly/:id/metadata', assembly.apiGetDownloadAssemblyMetadata);

// 404
app.use(function(req, res, next){
    res.status(404).render('404');
});

// Test routes
// app.get('/dev/d3tree', require('./routes/dev').d3tree);
// app.get('/dev/d3test', require('./routes/dev').d3test);
// app.get('/dev/d3dots-svg', require('./routes/dev').d3dotsSVG);
// app.get('/dev/d3dots-canvas', require('./routes/dev').d3dotsCanvas);
// app.get('/dev/canvas', require('./routes/dev').canvas);

//app.post('/join', user.join);
//app.post('/signin', user.signIn);
var server = http.createServer(app).listen(app.get('port'), function(){
//var secureServer = https.createServer(sslOptions, app).listen(app.get('port'), function(){
  console.log('[WGST] ✔ Express server listening on port ' + app.get('port'));
});

//======================================================
// Hack: Redirects to HTTPS
//======================================================

// var net = require('net'),
// 	handle = net.createServer().listen(80);

// http.createServer(function(request,response){
//    	response.statusCode = 302; 
//     response.setHeader("Location", "https://" + request.headers.host + request.url);
//     response.end();
// }).listen(handle);

//======================================================
// Socket.io
//======================================================

var socketio = require('socket.io');

// Global variable on purpose - will store socket connection and will share with routes
socket = undefined;
io = socketio.listen(server);
//io = socketio.listen(secureServer);

io.sockets.on('connection', function(socketConnection) {

	//console.dir(socketConnection);

	console.log('[WGST][Socket.io] Client connected: ' + socketConnection.handshake.headers.host);

	socketConnection.on('disconnect', function() {
		console.log('[WGST][Socket.io] Client disconnnected: ' + socketConnection.handshake.headers.host);
	});

	socketConnection.on('getRoomId', function() {
		console.log('[WGST][Socket.io] Received request for room id from client: ' + socketConnection.handshake.headers.host);

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
var couchbaseAddress = appConfig.server.couchbase.ip || COUCHBASE_DEFAULT_ADDRESS;

var createCouchbaseBucketConnection = function(bucketName, password) {
	console.log('[WGST][Couchbase] Connecting to bucket: ' + bucketName + ' ' + password);
	return new couchbase.Connection({
		host: 'http://' + couchbaseAddress + ':8091/pools',
		bucket: bucketName,
		password: password,
		// Set timeout to 1 minute
		connectionTimeout: 60000,
		operationTimeout: 60000
	}, function(error) {
		if (error) {
			console.error('[WGST][Couchbase][Error] ✗ ' + error);
			return;
		}

		console.log('[WGST][Couchbase] ✔ Connected to "' + bucketName + '" bucket');
	});
};

//
// Create buckets from config
//
// Global variable on purpose - will store socket connection and will be shared with routes
couchbaseDatabaseConnections = {};
COUCHBASE_BUCKETS = {
	'MAIN': 'main',
	'RESOURCES': 'resources',
	'FRONT': 'front',
	'FEEDBACK': 'feedback'
};

var bucketName,
	bucketPassword;

Object.keys(appConfig.server.couchbase.buckets).map(function(bucketType){
	bucketName = appConfig.server.couchbase.buckets[bucketType].name;
	bucketPassword = appConfig.server.couchbase.buckets[bucketType].password;
	couchbaseDatabaseConnections[bucketType] = createCouchbaseBucketConnection(bucketName, bucketPassword);
});

// testWgstBucket = 'wgsa';
// testWgstResourcesBucket = 'wgsa_resources';
// testWgstFrontBucket = 'wgsa_front';

// couchbaseDatabaseConnections[testWgstBucket] = createCouchbaseConnection(testWgstBucket);
// couchbaseDatabaseConnections[testWgstResourcesBucket] = createCouchbaseConnection(testWgstResourcesBucket);
// couchbaseDatabaseConnections[testWgstFrontBucket] = createCouchbaseConnection(testWgstFrontBucket);

//======================================================
// RabbitMQ
//======================================================
var rabbitMQConnectionOptions = {
		host: appConfig.server.rabbit.ip, //'129.31.26.152', //'fi--didewgstcn1.dide.local',
		port: appConfig.server.rabbit.port
	},
	rabbitMQConnectionImplementationOptions = {
		reconnect: false,
		autoDelete: true
	};

rabbitMQExchanges = {};
rabbitMQExchangeNames = {
	NOTIFICATION: 'notifications-ex',
	UPLOAD: 'wgst-ex',
	COLLECTION_ID: 'grid-ex',
	TASKS: 'wgst-tasks-ex'
};

if (appConfig.server.rabbit.on) {
	var amqp = require('amqp');

	rabbitMQConnection = amqp.createConnection(rabbitMQConnectionOptions, rabbitMQConnectionImplementationOptions);

	rabbitMQConnection.on('error', function(error) {
	    console.error('[WGST][RabbitMQ][Error] ✗ Connection: ' + error);
	});

	rabbitMQConnection.on("ready", function(){
		console.log('[WGST][RabbitMQ] ✔ Connection is ready');

		// Exchange for uploading assemblies
		createExchange(rabbitMQExchangeNames.UPLOAD, {
			type: 'direct'
		});

		// Exchange for getting notifications
		createExchange(rabbitMQExchangeNames.NOTIFICATION, {
			type: 'topic'
		});

		// Exchange for getting collection id
		createExchange(rabbitMQExchangeNames.COLLECTION_ID, {
			type: 'direct'
		});

		// Exchange for getting collection id
		createExchange(rabbitMQExchangeNames.TASKS, {
			type: 'direct'
		});
	});
}

var createExchange = function(exchangeName, exchangeProperties) {
	rabbitMQConnection.exchange(exchangeName, {
			type: exchangeProperties.type,
			passive: true,
			durable: false,
			confirm: false,
			autoDelete: false,
			noDeclare: false,
			confirm: false
		}, function(exchange) {
			rabbitMQExchanges[exchange.name] = exchange;

			console.log('[WGST][RabbitMQ] ✔ Exchange "' + exchange.name + '" is open');
		});
};