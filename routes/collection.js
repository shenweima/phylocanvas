exports.add = function(req, res) {

	console.error("[WGST] Received request for collection id");

	var uuid = require('node-uuid');

	// TODO: Validate request

	// Call RabbitMQ

	var amqp = require('amqp'),
		connection = amqp.createConnection({
			host: '129.31.26.152', //'129.31.26.152', //'fi--didewgstcn1.dide.local',
			port: 5672
		}, {
			reconnect: false
		});

	connection.on('error', function(error) {
	    console.error("[WGST][ERROR] Ignoring error: " + error);
	});

	connection.on("ready", function(){
		console.log('[WGST] Connection is ready');

		var queueId = uuid.v4(),
			exchange = connection.exchange('wgst-ex', {
				type: 'direct',
				passive: true
			}, function(exchange) {
				console.log('[WGST] Exchange "' + exchange.name + '" is open');
			});

		// Prepare object to publish
		var collectionRequest = {
			taskId: "wgst"
		};

		// Publish message
		exchange.publish('id-request', collectionRequest, { 
			mandatory: true,
			contentType: 'application/json',
			deliveryMode: 1,
			correlationId: 'Art', // Generate UUID?
			replyTo: queueId
		}, function(err){
			if (err) {
				console.log('[WGST][ERROR] Error in trying to publish');
				return; // return undefined?
			}

			console.log('[WGST] Message was published');
		});

		connection
			.queue(queueId, { // Create queue
				exclusive: true
			}, function(queue){
				console.log('[WGST] Queue "' + queue.name + '" is open');

			}) // Subscribe to response message
			.subscribe(function(message, headers, deliveryInfo){
			
				console.log('[WGST] Received response');

				var buffer = new Buffer(message.data);

				// Return result data
				res.json(buffer.toString());

				// End connection, however in reality it's being dropped before it's ended so listen for error too
				connection.end();
			});
	});
};

exports.get = function(req, res) {
	console.log('[WGST] Getting collection with collection id: ' + req.body.collectionId);

	// Get requested collection from db
	var couchbase = require('couchbase');
	var db = new couchbase.Connection({
		host: 'http://129.31.26.151:8091/pools',
		bucket: 'test_wgst',
		password: '.oneir66'
	}, function(err) {
		if (err) throw err;
		db.get('COLLECTION_LIST_' + req.body.collectionId, function(err, results) {
			if (err) throw err;

			console.log('[WGST] Returning collection with assembly ids');
			console.log(results);

			// Return result data
			res.json(results.value);
		});
	});

	//res.json({});
};