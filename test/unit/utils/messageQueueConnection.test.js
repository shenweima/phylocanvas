var assert = require('assert');
var sinon = require('sinon');
var rewire = require('rewire');

var EventEmitter = require('events').EventEmitter;

describe('Util: Message Queue Connection', function () {

  it('should create the exchanges', function () {
    var messageQueueConnection = rewire('utils/messageQueueConnection');

    var amqpConnection = new EventEmitter();
    var amqp = messageQueueConnection.__get__('amqp');
    amqp.createConnection = sinon.stub().returns(amqpConnection);
    amqpConnection.exchange = sinon.spy();

    var util = messageQueueConnection.connect();
    amqpConnection.emit('ready');

    assert(amqpConnection.exchange.calledWith(
      util.EXCHANGE_NAMES.UPLOAD,
      sinon.match({ type: 'direct' })
    ));

    assert(amqpConnection.exchange.calledWith(
      util.EXCHANGE_NAMES.NOTIFICATION,
      sinon.match({ type: 'topic' })
    ));

    assert(amqpConnection.exchange.calledWith(
      util.EXCHANGE_NAMES.COLLECTION_ID,
      sinon.match({ type: 'direct' })
    ));

    assert(amqpConnection.exchange.calledWith(
      util.EXCHANGE_NAMES.TASKS,
      sinon.match({ type: 'direct' })
    ));

  });

});
