var getCollectionId = function() {
	// Do something
};

exports.add = function(req, res) {
	console.log("[WGST] Received request for collection id");
	console.log('User assembly ids:');
	console.log(req.body.userAssemblyIds);

	var uuid = require('node-uuid'),
		userAssemblyIds = req.body.userAssemblyIds;

	// TODO: Validate request

	// Call RabbitMQ

	var amqp = require('amqp'),
		connection = amqp.createConnection({
			host: '129.31.26.152', //'129.31.26.152', //'fi--didewgstcn1.dide.local',
			port: 5670
		}, {
			reconnect: false,
			autoDelete: true
		});

	connection.on('error', function(error) {
	    console.error('[WGST][ERROR] Ignoring error: ' + error);
	});

	connection.on("ready", function(){
		console.log('[WGST] Connection is ready');

		var queueId = 'ART_CREATE_COLLECTION_' + uuid.v4(),
			exchange = connection.exchange('wgst-ex', {
				type: 'direct',
				passive: true,
				durable: false,
				confirm: false,
				autoDelete: false,
				noDeclare: false,
				confirm: false
			}, function(exchange) {
				console.log('[WGST] Exchange "' + exchange.name + '" is open');
			});

		// Prepare object to publish
		var collectionRequest = {
			taskId: 'new',
			userAssemblyIds: userAssemblyIds
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
				passive: false,
				durable: false,
				exclusive: true,
				autoDelete: true,
				noDeclare: false,
				closeChannelOnUnsubscribe: false
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

	var collectionId = req.body.collectionId,
		collection = {};

	console.log('[WGST] Getting collection ' + collectionId);

	// Get requested collection from db
	var couchbase = require('couchbase');
	var db = new couchbase.Connection({
		host: 'http://129.31.26.151:8091/pools',
		bucket: 'test_wgst',
		password: '.oneir66'
	}, function(err) {
		if (err) throw err;

		db.get('COLLECTION_LIST_' + collectionId, function(err, assemblyIdsData) {
			if (err) throw err;

			var assemblyIds = assemblyIdsData.value;

			console.log('[WGST] Returning collection ' + collectionId + ' with assembly ids:');
			console.log(assemblyIds);

			// Return result data
			//res.json(results.value);

			collection.assemblyIds = assemblyIds;

			// Get collection tree
			db.get('COLLECTION_TREE_' + collectionId, function(err, collectionTreeData) {

				console.log('COLLECTION_TREE_' + collectionId);

				if (err) throw err;

				var collectionTree = collectionTreeData.value;

				console.log('[WGST] Returning collection tree for collection id ' + collectionId + ':');
				console.log(collectionTree);

				collection.tree = collectionTree;

				// Return result data
				//res.json(results.value);
				res.json(collection);
			});		


		});

	});

	//res.json({});
};