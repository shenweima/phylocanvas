var assert = require('assert');
var sinon = require('sinon');
var rewire = require('rewire');

describe('Service: Message Queue', function () {

  describe('Feature: Assembly Notification Queue', function () {

    it('should bind to the correct messages', function (done) {
      var messageQueueService = rewire('services/messageQueue');

      // mocking
      var queueSpy = { bind: sinon.spy() };
      var rabbit = messageQueueService.__get__('rabbit');
      rabbit.connection = {
        queue: sinon.stub().yields(queueSpy)
      };
      messageQueueService.__set__('rabbit', rabbit);

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

  });

});
