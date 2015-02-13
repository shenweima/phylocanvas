var assert = require('assert');
var rewire = require('rewire');
var sinon = require('sinon');

describe('Service: Socket', function () {

  it('should connect using the passed-in server and initialise connections',
    function () {
      var socketService = rewire('services/socket');
      var socketIOInstance = {
        sockets: {
          on: sinon.spy()
        }
      };
      var socketIOModule = {
        listen: sinon.stub().returns(socketIOInstance)
      };
      var server = {};

      socketService.__set__('socketio', socketIOModule);

      socketService.connect(server);

      assert(socketIOModule.listen.calledWith(server));
      assert(socketIOInstance.sockets.on.calledWith(
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
    var socketIOInstance = {
      sockets: {
        in: sinon.stub().returns(room)
      }
    };
    var EVENT_NAME = 'event';
    var MESSAGE_IDS = {
      socketRoomId: 0,
      collectionId: 1,
      assemblyId: 2,
      userAssemblyId: 3
    };
    var NOTIFICATION = 'result';

    socketService.__set__('io', socketIOInstance);

    socketService.notify(EVENT_NAME, MESSAGE_IDS, NOTIFICATION);

    assert(socketIOInstance.sockets.in.calledWith(MESSAGE_IDS.socketRoomId));
    assert(room.emit.calledWith(EVENT_NAME, {
      socketRoomId: MESSAGE_IDS.socketRoomId,
      collectionId: MESSAGE_IDS.collectionId,
      assemblyId: MESSAGE_IDS.assemblyId,
      userAssemblyId: MESSAGE_IDS.userAssemblyId,
      result: NOTIFICATION
    }));
  });

});
