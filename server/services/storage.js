var q = require('q');

var logger = require('utils/logging').createLogger('Storage');
var storageConnection = require('utils/storageConnection').connect();

function store(type, key, value) {
  var deferred = q.defer();

  storageConnection[type].set(key, value, function (error, result) {
    if (error) {
      logger.error('✗ Failed to store "' + key + '": ' + error);
      return deferred.reject(error);
    }

    logger.info('Successfully stored ' + key);
    deferred.resolve(result.cas);
  });

  return deferred.promise;
}

function retrieve(type, key) {
  var deferred = q.defer();

  storageConnection[type].get(key, function (error, result) {
    if (error) {
      logger.error('✗ Failed to retrieve "' + key + '": ' + error);
      return deferred.reject(error);
    }

    logger.info('Successfully retrieved ' + key);
    deferred.resolve(result.value);
  });

  return deferred.promise;
}

function Storage(type) {
  this.store = store.bind(null, type);
  this.retrieve = retrieve.bind(null, type);
}

var STORAGE_TYPES = {
  main: new Storage('main'),
  resources: new Storage('resources')
};

module.exports = function (type) {
  return STORAGE_TYPES[type];
};
