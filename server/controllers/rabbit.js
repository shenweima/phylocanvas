var appConfig = require('configuration');
var logger = require('../utils/logging').createLogger('RabbitMQ');

var rabbitMQConnectionOptions = {
  host: appConfig.server.rabbit.ip,
  port: appConfig.server.rabbit.port
};

var rabbitMQConnectionImplementationOptions = {
  reconnect: false,
  autoDelete: true
};

//
// Global vars on purpose
//
global.rabbitMQExchanges = {};
global.rabbitMQExchangeNames = {
  NOTIFICATION: 'notifications-ex',
  UPLOAD: 'wgst-ex',
  COLLECTION_ID: 'grid-ex',
  TASKS: 'wgst-tasks-ex'
};

var createExchange = function(exchangeName, exchangeProperties) {
  rabbitMQConnection.exchange(exchangeName, {
    type: exchangeProperties.type,
    passive: true,
    durable: false,
    confirm: false,
    autoDelete: false,
    noDeclare: false,
    confirm: false
  }, function(exchange) {
    global.rabbitMQExchanges[exchange.name] = exchange;

    logger.info('✔ Exchange "' + exchange.name + '" is open');
  });
};

module.exports = function() {
  if (appConfig.server.rabbit.on) {
    var amqp = require('amqp');

    rabbitMQConnection = amqp.createConnection(rabbitMQConnectionOptions, rabbitMQConnectionImplementationOptions);

    rabbitMQConnection.on('error', function(error) {
      logger.error(error);
    });

    rabbitMQConnection.on('ready', function() {
      logger.info('✔ Connection is ready');

      // Exchange for uploading assemblies
      createExchange(global.rabbitMQExchangeNames.UPLOAD, {
        type: 'direct'
      });

      // Exchange for getting notifications
      createExchange(global.rabbitMQExchangeNames.NOTIFICATION, {
        type: 'topic'
      });

      // Exchange for getting collection id
      createExchange(global.rabbitMQExchangeNames.COLLECTION_ID, {
        type: 'direct'
      });

      // Exchange for getting collection id
      createExchange(global.rabbitMQExchangeNames.TASKS, {
        type: 'direct'
      });
    });
  }
};
