var amqp = require('amqp');

var appConfig = require('configuration');

var LOGGER = require('utils/logging').createLogger('Message Queue Conn.');
var CONNECTION_OPTIONS = {
  host: appConfig.server.rabbit.ip,
  port: appConfig.server.rabbit.port
};
var IMPLEMENTATION_OPTIONS = {
  reconnect: false,
  autoDelete: true
};
var EXCHANGE_NAMES = {
  NOTIFICATION: 'notifications-ex',
  UPLOAD: 'wgst-ex',
  COLLECTION_ID: 'grid-ex',
  TASKS: 'wgst-tasks-ex'
};
var exchanges = {};

function createExchange(connection, name, type) {
  connection.exchange(name, {
    type: type,
    passive: true,
    durable: false,
    confirm: false,
    autoDelete: false,
    noDeclare: false
  }, function (exchange) {
    exchanges[exchange.name] = exchange;

    LOGGER.info('✔ Exchange "' + exchange.name + '" is open');
  });
}

function connect() {
  if (appConfig.server.rabbit.on) {
    var connection =
      amqp.createConnection(CONNECTION_OPTIONS, IMPLEMENTATION_OPTIONS);

    connection.on('error', function (error) {
      LOGGER.error('✗ Connection: ' + error);
    });

    connection.on('ready', function () {
      LOGGER.info('✔ Connection is ready');

      // Exchange for uploading assemblies
      createExchange(connection, EXCHANGE_NAMES.UPLOAD, 'direct');

      // Exchange for getting notifications
      createExchange(connection, EXCHANGE_NAMES.NOTIFICATION, 'topic');

      // Exchange for getting collection id
      createExchange(connection, EXCHANGE_NAMES.COLLECTION_ID, 'direct');

      // Exchange for getting collection id
      createExchange(connection, EXCHANGE_NAMES.TASKS, 'direct');
    });

    return {
      EXCHANGE_NAMES: EXCHANGE_NAMES,
      exchanges: exchanges,
      connection: connection
    };
  }
}

module.exports = {
  connect: connect
};
