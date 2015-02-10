var assert = require('assert');
var rewire = require('rewire');
var sinon = require('sinon');
var _ = require('lodash');

describe('Service: Socket', function () {

  it('should connect using the passed-in server and initialise connections',
    function () {
      var socketService = rewire('services/socket');

      var io = { sockets: { on: sinon.spy() } };
      var socketio = {
        listen: sinon.stub().returns(io)
      };
      socketService.__set__('socketio', socketio);
      var server = {};

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

    var room = { emit: sinon.spy() };
    var io = { sockets: { in: sinon.stub().returns(room) } };
    socketService.__set__('io', io);

    var ids = {
      socketRoomId: 0,
      collectionId: 1,
      assemblyId: 2,
      userAssemblyId: 3
    };

    socketService.notify('event', ids, 'result');

    assert(io.sockets.in.calledWith(ids.socketRoomId));
    assert(room.emit.calledWith(
      'event',
      _.extend(ids, { result: 'result' })
    ));
  });

});
