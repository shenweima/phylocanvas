var couchbase = require('couchbase');
var COUCHBASE_DEFAULT_ADDRESS = '127.0.0.1';
var couchbaseAddress = appConfig.server.couchbase.ip || COUCHBASE_DEFAULT_ADDRESS;

var logger = require('../utils/logging').createLogger('Couchbase');

var createCouchbaseBucketConnection = function(bucketName, password) {
	logger.info('Connecting to bucket: ' + bucketName + ' ' + password);
	return new couchbase.Connection({
		host: 'http://' + couchbaseAddress + ':8091/pools',
		bucket: bucketName,
		password: password,
		// Set timeout to 1 minute
		connectionTimeout: 60000,
		operationTimeout: 60000
	}, function(error) {
		if (error) {
			logger.error(error);
			return;
		}

		logger.info('✔ Connected to "' + bucketName + '" bucket');
	});
};

//
// Create couchbase bucket connections listed in config
//

//
// Global variable on purpose - will store socket connection and will be shared with controllers
//
couchbaseDatabaseConnections = {};
COUCHBASE_BUCKETS = {
	'MAIN': 'main',
	'RESOURCES': 'resources',
	'FRONT': 'front',
	'FEEDBACK': 'feedback'
};

module.exports = function() {
	//
	// Create couchbase bucket connections
	//
	var bucketName;
	var bucketPassword;
	var buckets = appConfig.server.couchbase.buckets;

	Object.keys(buckets).map(function(bucketType){
		bucketName = buckets[bucketType].name;
		bucketPassword = buckets[bucketType].password;
		couchbaseDatabaseConnections[bucketType] = createCouchbaseBucketConnection(bucketName, bucketPassword);
	});
};
