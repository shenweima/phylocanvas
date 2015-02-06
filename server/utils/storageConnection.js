var _ = require('lodash');
var couchbase = require('couchbase');

var appConfig = require('configuration');
var logger = require('utils/logging').createLogger('Storage Conn.');

var DEFAULT_ADDRESS = '127.0.0.1';
var address = appConfig.server.couchbase.ip || DEFAULT_ADDRESS;

function createBucketConnection(bucketName, password) {
  logger.info('Connecting to bucket: ' + bucketName + ' ' + password);
  return new couchbase.Connection({
    host: 'http://' + address + ':8091/pools',
    bucket: bucketName,
    password: password,
    // Set timeout to 1 minute
    connectionTimeout: 60000,
    operationTimeout: 60000
  }, function (error) {
    if (error) {
      logger.error('✗ ' + error);
      return;
    }
    logger.info('✔ Connected to "' + bucketName + '" bucket');
  });
}

function connect(config) {
  var buckets = config || appConfig.server.couchbase.buckets;
  var connections = {};
  _.forOwn(buckets, function (bucket, key) {
    connections[key] = createBucketConnection(bucket.name, bucket.password);
  });
  return connections;
}

module.exports = {
  connect: connect
};
