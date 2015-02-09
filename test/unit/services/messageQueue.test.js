var assert = require('assert');
var sinon = require('sinon');
var rewire = require('rewire');

var EventEmitter = require('events').EventEmitter;

describe('Service: Message Queue', function () {

  function mockConnectionQueue(messageQueueService, mockQueue) {
    var rabbit = messageQueueService.__get__('rabbit');
    rabbit.connection = {
      queue: sinon.stub().yields(mockQueue)
    };
    messageQueueService.__set__('rabbit', rabbit);
  }

  function createEventEmittingQueue(eventName) {
    var queue = new EventEmitter();
    queue.subscribe = queue.on.bind(queue, eventName || 'message');
    queue.bind = function () {};
    return queue;
  }

  describe('Feature: Assembly Notification Queue', function () {

    it('should bind to the correct messages', function (done) {
      var messageQueueService = rewire('services/messageQueue');
      var rabbit = require('utils/messageQueueConnection').connect();

      var queueSpy = { bind: sinon.spy() };
      mockConnectionQueue(messageQueueService, queueSpy);

      messageQueueService.newAssemblyNotificationQueue(
        { assemblyId: 'assembly1', collectionId: 'collection1' },
        function (queue) {
          assert(queue.bind.calledWith(
            rabbit.EXCHANGE_NAMES.NOTIFICATION,
            '*.ASSEMBLY.assembly1'
          ));

          assert(queue.bind.calledWith(
            rabbit.EXCHANGE_NAMES.NOTIFICATION,
            'CORE_TREE_RESULT.COLLECTION.collection1'
          ));

          assert(queue.bind.calledWith(
            rabbit.EXCHANGE_NAMES.NOTIFICATION,
            'COLLECTION_TREE.COLLECTION.collection1'
          ));

          done();
        }
      );
    });

    it('should parse messages as JSON', function (done) {
      var messageQueueService = rewire('services/messageQueue');

      var queue = createEventEmittingQueue();
      mockConnectionQueue(messageQueueService, queue);

      messageQueueService.newAssemblyNotificationQueue(
        {},
        function (queue) {
          queue.subscribe(function (error, message) {
            assert(error === null);
            assert(message.hello === 'world');
            done();
          });
          queue.emit('message', { data: JSON.stringify({ hello: 'world' }) });
        }
      );
    });

    it('should surface JSON parsing errors', function (done) {
      var messageQueueService = rewire('services/messageQueue');

      var queue = createEventEmittingQueue();
      mockConnectionQueue(messageQueueService, queue);

      messageQueueService.newAssemblyNotificationQueue(
        {},
        function (queue) {
          queue.subscribe(function (error) {
            assert(error && error.message === 'JSON could not be parsed.');
            done();
          });
          queue.emit('message', { data: '{ hello: world }' });
        }
      );
    });

  });

});
