var logger = require('utils/logging').createLogger('Antibiotic Model');

function getAll(callback) {
  logger.info('Getting list of all antibiotics');

  // Get list of all antibiotics
  couchbaseDatabaseConnections[COUCHBASE_BUCKETS.RESOURCES].get('ANTIMICROBIALS_ALL', function (error, result) {
    if (error) {
      callback(error, result);
      return;
    }

    var antibiotics = result.value.antibiotics;

    logger.info('Got the list of all antibiotics');

    callback(null, antibiotics);
  });
}

module.exports = {
  getAll: getAll
};
