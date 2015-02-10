var assert = require('assert');
var rewire = require('rewire');
var sinon = require('sinon');

var EventEmitter = require('events').EventEmitter;

describe('Util: Socket Connection', function () {

  it('should make socket connections respond to room requests',
    function (done) {
      var socketConnectionUtil = rewire('utils/socketConnection');

      var newRoomId = sinon.stub().returns('123');
      socketConnectionUtil.__set__('newRoomId', newRoomId);

      var connection = new EventEmitter();
      connection.handshake = { headers: { host: 'localhost' } };
      connection.join = sinon.spy();

      socketConnectionUtil.initialise(connection);

      connection.on('roomId', function (roomId) {
        assert(newRoomId.called);
        assert(connection.join.calledWith(roomId));
        assert.equal(roomId, '123');
        done();
      });

      connection.emit('getRoomId');
    }
  );

});
