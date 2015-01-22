var socketio = require('socket.io');
var uuid = require('node-uuid');

//
// Global variable on purpose - will store socket connection and will share with allcontrollers
//
global.io;
global.socket;

module.exports = function(server) {
	global.io = socketio.listen(server, { origins: 'localhost:3000' });

	global.io.sockets.on('connection', function(socketConnection) {
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
			socketConnection.emit('roomId', roomId);
		});

		global.socket = socketConnection;
	});
};