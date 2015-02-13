var socketio = require('socket.io');

var socketConnection = require('utils/socketConnection');

var LOGGER = require('utils/logging').createLogger('SocketIO');

var io; // module-wide variable because initialisation and usage are separate
function connect(server) {
  io = socketio.listen(server);
  io.sockets.on('connection', socketConnection.initialise);
}

function notify(eventName, ids, result) {

  LOGGER.info(
    'Emitting ' + result + ' message for socketRoomId: ' + ids.socketRoomId
  );

  io.sockets.in(ids.socketRoomId).emit(eventName, {
    collectionId: ids.collectionId,
    assemblyId: ids.assemblyId,
    userAssemblyId: ids.userAssemblyId,
    result: result,
    socketRoomId: ids.socketRoomId
  });
}

module.exports.connect = connect;
module.exports.notify = notify;
