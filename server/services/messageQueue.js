var rabbit = require('utils/messageQueueConnection').connect();

var logger = require('utils/logging').createLogger('Message Queue');

/**
 * "Nodefying" Decorator Function
 *
 * The decorated method will expect a `function (err, message) {...}` callback,
 * this allows for more "Node-style" error handling.
 */
function parseMessagesAsJson(queue) {
  var delegate = queue.subscribe;

  queue.subscribe = function (callback) {
    delegate(function (message) {
      var buffer = new Buffer(message.data);
      var bufferJSON = buffer.toString();
      try {
        var parsedMessage = JSON.parse(bufferJSON);
        callback(null, parsedMessage);
      } catch (error) {
        callback(error);
      }
    });
  };
}

function newAssemblyNotificationQueue(ids, callback) {
  rabbit.connection.queue(
    'ART_NOTIFICATION',
    { exclusive: true },
    function (queue) {
      logger.info('Notification queue "' + queue.name + '" is open');

      // binding routing key
      queue.bind(
        rabbit.EXCHANGE_NAMES.NOTIFICATION,
        '*.ASSEMBLY.' + ids.assemblyId
      );
      queue.bind(
        rabbit.EXCHANGE_NAMES.NOTIFICATION,
        'CORE_TREE_RESULT.COLLECTION.' + ids.collectionId
      );
      queue.bind(
        rabbit.EXCHANGE_NAMES.NOTIFICATION,
        'COLLECTION_TREE.COLLECTION.' + ids.collectionId
      );

      parseMessagesAsJson(queue);

      callback(queue);
    }
  );
}

module.exports = {
  newAssemblyNotificationQueue: newAssemblyNotificationQueue
};
