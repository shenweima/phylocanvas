var assert = require('assert');
var rewire = require('rewire');
var sinon = require('sinon');

describe('Service: Socket', function () {

  it('should connect using the passed-in server and initialise connections',
    function () {
      var socketService = rewire('services/socket');
      var io = {
        sockets: {
          on: sinon.spy()
        }
      };
      var socketio = {
        listen: sinon.stub().returns(io)
      };
      var server = {};

      socketService.__set__('socketio', socketio);

      socketService.connect(server);

      assert(socketio.listen.calledWith(server));
      assert(io.sockets.on.calledWith(
        'connection',
        require('utils/socketConnection').initialise
      ));
    }
  );

  it('should send a notification in the correct format', function () {
    var socketService = rewire('services/socket');
    var room = {
      emit: sinon.spy()
    };
    var io = {
      sockets: {
        in: sinon.stub().returns(room)
      }
    };
    var EVENT_NAME = 'event';
    var IDs = {
      socketRoomId: 0,
      collectionId: 1,
      assemblyId: 2,
      userAssemblyId: 3
    };
    var NOTIFICATION = 'result';

    socketService.__set__('io', io);

    socketService.notify(EVENT_NAME, IDs, NOTIFICATION);

    assert(io.sockets.in.calledWith(IDs.socketRoomId));
    assert(room.emit.calledWith(EVENT_NAME, {
      socketRoomId: IDs.socketRoomId,
      collectionId: IDs.collectionId,
      assemblyId: IDs.assemblyId,
      userAssemblyId: IDs.userAssemblyId,
      result: NOTIFICATION
    }));
  });

});
