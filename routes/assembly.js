var rabbitMQConnectionOptions = {
		host: '129.31.26.152', //'129.31.26.152', //'fi--didewgstcn1.dide.local',
		port: 5672
	},
	rabbitMQConnectionImplementationOptions = {
		reconnect: false,
		autoDelete: true
	};

var amqp = require('amqp');

// Create RabbitMQ connection
var notificationConnection = amqp.createConnection(rabbitMQConnectionOptions, rabbitMQConnectionImplementationOptions);

notificationConnection.on('error', function(error) {
    console.error("✗ [WGST][RabbitMQ][ERROR] Notification connection: " + error);
});

var notificationExchange = undefined;

notificationConnection.on("ready", function(){
	console.log('✔ [WGST][RabbitMQ] Notification connection is ready');

	notificationConnection.exchange('notifications-ex',
		{
			type: 'topic',
			passive: true,
			durable: false,
			confirm: false,
			autoDelete: false,
			noDeclare: false,
			confirm: false
		}, function(readyNotificationExchange) {

			notificationExchange = readyNotificationExchange;

			console.log('✔ [WGST][RabbitMQ] Notification exchange "' + notificationExchange.name + '" is open');
		});

});

exports.add = function(req, res) {

	var collectionId = req.body.collectionId,
		socketRoomId = req.body.socketRoomId,
		userAssemblyId = req.body.name,
		assemblyId = req.body.assemblyId;

	console.log('[WGST] Adding assembly ' + assemblyId + ' to collection ' + collectionId);

	// TO DO: Validate request

	// Send response
	res.json({
		assemblyId: assemblyId
	});

	console.log('[WGST] Emitting UPLOAD_OK message for socketRoomId: ' + socketRoomId);
	io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
		collectionId: collectionId,
		assemblyId: assemblyId,
		userAssemblyId: userAssemblyId,
		status: "UPLOAD_OK ready",
		result: "UPLOAD_OK",
		socketRoomId: socketRoomId
	});

	// -------------------------------------
	// RabbitMQ Notifications
	// -------------------------------------
	var uploadQueue,
		uploadExchange,
		uploadConnection;

	// Generate queue id
	var notificationQueueId = 'ART_NOTIFICATION_' + assemblyId;

	// Create queue
	var notificationQueue = notificationConnection.queue(notificationQueueId, 
		{
			exclusive: true
		}, function(queue){
			console.log('[WGST] Notification queue "' + queue.name + '" is open');

			var readyResults = [];

			queue.bind(notificationExchange, "*.ASSEMBLY." + assemblyId); // binding routing key
			queue.bind(notificationExchange, "COLLECTION_TREE.COLLECTION." + collectionId);

			// Subscribe to response message
			queue.subscribe(function(message, headers, deliveryInfo){
				console.log('[WGST] Received RabbitMQ notification message:');

				var buffer = new Buffer(message.data),
					bufferJSON = buffer.toString(),
					parsedMessage = JSON.parse(bufferJSON);

				var messageAssemblyId = parsedMessage.assemblyId,
					messageUserAssemblyId = parsedMessage.userAssemblyId;

				console.log('[WGST] Message assembly id: ' + messageAssemblyId);
				console.log('[WGST] Message user assembly id: ' + messageUserAssemblyId);

				// Check task type
				if (parsedMessage.taskType === 'FP_COMP') {
					console.log('[WGST] Emitting FP_COMP message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "FP_COMP ready",
						result: "FP_COMP",
						socketRoomId: socketRoomId
					});

					readyResults.push('FP_COMP');

				} else if (parsedMessage.taskType === 'MLST_RESULT') {
					console.log('[WGST] Emitting MLST_RESULT message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "MLST_RESULT ready",
						result: "MLST_RESULT",
						socketRoomId: socketRoomId
					});

					readyResults.push('MLST_RESULT');

				} else if (parsedMessage.taskType === 'PAARSNP_RESULT') {
					console.log('[WGST] Emitting PAARSNP_RESULT message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "PAARSNP_RESULT ready",
						result: "PAARSNP_RESULT",
						socketRoomId: socketRoomId
					});

					readyResults.push('PAARSNP_RESULT');

				} else if (parsedMessage.taskType === 'COLLECTION_TREE') {
					console.log('[WGST] Emitting COLLECTION_TREE message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "COLLECTION_TREE ready",
						result: "COLLECTION_TREE",
						socketRoomId: socketRoomId
					});

					readyResults.push('COLLECTION_TREE');

				} // else if


				console.log('[LOGGING][IMPORTANT] readyResults.length: ' + readyResults.length);

				// Destroy queue after all results were received
				if (readyResults.length === 4) {

					queue.unbind(notificationExchange, "*.ASSEMBLY." + assemblyId);
					queue.unbind(notificationExchange, "COLLECTION_TREE.COLLECTION." + collectionId);
					//queue.destroy();
					//notificationExchange.destroy();
					//notificationConnection.end();
				} // if
			});

			// -------------------------------------
			// RabbitMQ Upload
			// -------------------------------------

			uploadConnection = amqp.createConnection(rabbitMQConnectionOptions, rabbitMQConnectionImplementationOptions);

			uploadConnection.on('error', function(error) {
			    console.error("✗ [WGST][ERROR] Upload connection: " + error);
			});

			uploadConnection.on("ready", function(){
				console.log('✔ [WGST][RabbitMQ] Upload connection is ready');

				// -----------------------------------------------------------
				// Insert assembly metadata into Couchbase
				// -----------------------------------------------------------

				var metadataKey = 'ASSEMBLY_METADATA_' + assemblyId,
					metadata = {
						assemblyId: assemblyId,
						assemblyUserId: req.body.name,
						geographicLocation: {
							type: 'Point',
							coordinates: [req.body.metadata.location.latitude, req.body.metadata.location.longitude]
						}
					};

					console.log('[WGST] Inserting metadata with key: ' + metadataKey);

					couchbaseDatabaseConnection.set(metadataKey, metadata, function(err, result) {
						if (err) {
							console.error('✗ [WGST][ERROR] ' + err);
							return;
						}

						console.log('[WGST] Inserted metadata:');
						console.dir(result);

						console.log('[WGST] Emitting METADATA_OK message for socketRoomId: ' + socketRoomId);
						io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
							collectionId: collectionId,
							assemblyId: assemblyId,
							userAssemblyId: userAssemblyId,
							status: "METADATA_OK ready",
							result: "METADATA_OK",
							socketRoomId: socketRoomId
						});
					});

					// -----------------------------------------------------------
					// Upload assembly
					// -----------------------------------------------------------

					var uploadQueueId = 'ART_ASSEMBLY_UPLOAD_' + assemblyId;

					uploadExchange = uploadConnection.exchange('wgst-ex', {
							type: 'direct',
							passive: true,
							durable: false,
							confirm: false,
							autoDelete: false,
							noDeclare: false,
							confirm: false
						}, function(exchange) {
							console.log('✔ [WGST][RabbitMQ] Upload exchange "' + exchange.name + '" is open');
						});

					// Prepare object to publish
					var assembly = {
						"speciesId" : "1280",
						"sequences" : req.body.assembly, // Content of FASTA file, might need to rename to sequences
						"assemblyId": assemblyId,
						"userAssemblyId" : userAssemblyId,
						"taskId" : "Experiment_1",
						"collectionId": collectionId
					};

					console.log('[WGST] Uploading assembly ' + assemblyId + ' to collection ' + collectionId);

					// Publish message
					uploadExchange.publish('upload', assembly, { 
						mandatory: true,
						contentType: 'application/json',
						deliveryMode: 1,
						correlationId: 'Art', // Generate UUID?
						replyTo: uploadQueueId
					}, function(err){
						if (err) {
							console.error('✗ [WGST][ERROR] Error when trying to publish to upload exchange');
							return;
						}

						console.log('[WGST] Message was published to upload exchange');
					});

					uploadQueue = uploadConnection
						.queue(uploadQueueId, {
							passive: false,
							durable: false,
							exclusive: true,
							autoDelete: true,
							noDeclare: false,
							closeChannelOnUnsubscribe: false
						}, function(queue){
							console.log('[WGST] Upload queue "' + queue.name + '" is open');
						}) // Subscribe to response message
						.subscribe(function(message, headers, deliveryInfo){
							console.log('[WGST] Preparing metadata object');									

							var buffer = new Buffer(message.data),
								bufferJSON = buffer.toString(),
								parsedMessage = JSON.parse(bufferJSON);

							console.log('[WGST] Received message from upload queue:');
							console.dir(parsedMessage);

							uploadConnection.end();
						});
			});
		});
};

exports.get = function(req, res) {
	console.log('[WGST] Requested assembly id: ' + req.params.id);

	var assembly = {};

	// Get requested assembly from db
	var couchbase = require('couchbase');
	var db = new couchbase.Connection({
		host: 'http://129.31.26.151:8091/pools',
		bucket: 'test_wgst',
		password: '.oneir66'
	}, function(err) {
		if (err) throw err;
		db.get(req.params.id, function(err, result) {
			if (err) throw err;

			assembly = result.value;

			console.log(result.value);

			res.render('index', { requestedAssemblyObject: JSON.stringify(assembly) });

		});
	});
};

exports.apiGetAssembly = function(req, res) {

	var assemblyId = req.body.assemblyId;

	console.log('[WGST] Getting assembly with id: ' + assemblyId);

	// Prepare query keys
	var scoresQueryKey = 'FP_COMP_' + assemblyId,
		metadataQueryKey = 'ASSEMBLY_METADATA_' + assemblyId,
		resistanceProfileQueryKey = 'PAARSNP_RESULT_' + assemblyId,
		mlstQueryKey = 'MLST_RESULT_' + assemblyId;

	var queryKeys = [scoresQueryKey, metadataQueryKey, resistanceProfileQueryKey, mlstQueryKey];

	console.log('[WGST] Query keys: ');
	console.log(queryKeys);

	couchbaseDatabaseConnection.getMulti(queryKeys, {}, function(err, results) {
		console.log('[WGST] Got assemblies data');

		if (err) throw err;

		// Merge FP_COMP and ASSEMBLY_METADATA into one assembly object
		var assemblies = {},
			assemblyId,
			cleanAssemblyId,
			mlstAllelesQueryKeys = [];

		for (assemblyId in results) {
            // Parsing assembly scores
            if (assemblyId.indexOf('FP_COMP_') !== -1) {
            	cleanAssemblyId = assemblyId.replace('FP_COMP_','');
            	assemblies[cleanAssemblyId] = assemblies[cleanAssemblyId] || {};
				assemblies[cleanAssemblyId]['FP_COMP'] = results[assemblyId].value;
            // Parsing assembly metadata
            } else if (assemblyId.indexOf('ASSEMBLY_METADATA_') !== -1) {
            	cleanAssemblyId = assemblyId.replace('ASSEMBLY_METADATA_','');
            	assemblies[cleanAssemblyId] = assemblies[cleanAssemblyId] || {};
				assemblies[cleanAssemblyId]['ASSEMBLY_METADATA'] = results[assemblyId].value;
            // Parsing assembly resistance profile
            } else if (assemblyId.indexOf('PAARSNP_RESULT_') !== -1) {
            	cleanAssemblyId = assemblyId.replace('PAARSNP_RESULT_','');
            	assemblies[cleanAssemblyId] = assemblies[cleanAssemblyId] || {};
				assemblies[cleanAssemblyId]['PAARSNP_RESULT'] = results[assemblyId].value;
            // Parsing MLST
            } else if (assemblyId.indexOf('MLST_RESULT_') !== -1) {
            	cleanAssemblyId = assemblyId.replace('MLST_RESULT_','');
            	assemblies[cleanAssemblyId] = assemblies[cleanAssemblyId] || {};
				assemblies[cleanAssemblyId]['MLST_RESULT'] = results[assemblyId].value;
			} // if
		} // for

		console.log('[WGST] Assembly with merged FP_COMP, ASSEMBLY_METADATA, PAARSNP_RESULT and MLST_RESULT data: ');
		console.dir(assemblies);
		
		// Extract all MLST alleles query keys
		var alleles = assemblies[cleanAssemblyId]['MLST_RESULT'].alleles;

		for (allele in alleles) {
			if (alleles.hasOwnProperty(allele)) {
				mlstAllelesQueryKeys.push(alleles[allele]);
			}
		}

		// Get MLST alleles data
		getMlstAlleles(mlstAllelesQueryKeys, function(error, mlstAlleles){
			if (error) {
				throw error;
			}

			var mlstAlleleAssemblyId,
				mlstAlleleValue,
				alleleId,
				locusId;

			// Parse mlst alleles data
			for (var mlstAllele in mlstAlleles) {
				console.log('[WGST] Parsing MLST allele data: ' + mlstAllele);

				if (mlstAlleles.hasOwnProperty(mlstAllele)) {

					// Get value object from query result object
					mlstAlleleValue = mlstAlleles[mlstAllele].value;
					// Get locus id from value object
					locusId = mlstAlleleValue.locusId;
					// Add allele value object to assembly object
					assemblies[assemblyId].MLST_RESULT.alleles[locusId] = mlstAlleleValue;

				} // if
			} // for

			// Get list of all antibiotics
			getAllAntibiotics(function(error, antibiotics){
				if (error) {
					throw error;
				}

				res.json({
					assemblies: assemblies,
					antibiotics: antibiotics
				});
			});
		});
	});
};

var getMlstAlleles = function(queryKeys, callback) {
	console.log('[WGST] Getting MLST alleles data.');

	var couchbase = require('couchbase');
	var db = new couchbase.Connection({
		host: 'http://129.31.26.151:8091/pools',
		bucket: 'test_wgst_resources',
		password: '.oneir66'
	}, function(err) {
		if (err) throw err;

		// Get list of antibiotics
		db.getMulti(queryKeys, {}, function(err, result) {
			console.log('[WGST] Got MLST alleles data: ');
			console.log(result);

			if (err) {
				callback(err, result);
			}

			callback(null, result);
		});
	});
};

// Return fingerprint data
exports.apiGetAssemblies = function(req, res) {
	console.log('[WGST] Getting assemblies with ids: ' + req.body.assemblyIds);

	//var assemblies = [];

	// Get requested assembly from db
	var couchbase = require('couchbase');
	var db = new couchbase.Connection({
		host: 'http://129.31.26.151:8091/pools',
		bucket: 'test_wgst',
		password: '.oneir66'
	}, function(err) {
		if (err) throw err;

		// Prepend FP_COMP_ to each assembly id
		var scoresAssemblyIds = req.body.assemblyIds.map(function(assemblyId){
			return 'FP_COMP_' + assemblyId;
		});

		// Prepend ASSEMBLY_METADATA_ to each assembly id
		var metadataAssemblyIds = req.body.assemblyIds.map(function(assemblyId){
			return 'ASSEMBLY_METADATA_' + assemblyId;
		});

		// Prepend PAARSNP_RESULT_ to each assembly id
		var resistanceProfileAssemblyIds = req.body.assemblyIds.map(function(assemblyId){
			return 'PAARSNP_RESULT_' + assemblyId;
		});

		// Merge all assembly ids
		var assemblyIds = scoresAssemblyIds
							.concat(metadataAssemblyIds)
							.concat(resistanceProfileAssemblyIds);

		console.log('[WGST] Querying keys: ');
		console.log(assemblyIds);

		db.getMulti(assemblyIds, {}, function(err, results) {
			console.log('[WGST] Got assemblies data: ');
			console.log(results);

			if (err) throw err;

			// Merge FP_COMP and ASSEMBLY_METADATA into one assembly object
			var assemblies = {},
				assemblyId,
				cleanAssemblyId;

			for (assemblyId in results) {
                // Parsing assembly scores
                if (assemblyId.indexOf('FP_COMP_') !== -1) {
                	cleanAssemblyId = assemblyId.replace('FP_COMP_','');
                	assemblies[cleanAssemblyId] = assemblies[cleanAssemblyId] || {};
					assemblies[cleanAssemblyId]['FP_COMP'] = results[assemblyId].value;
                // Parsing assembly metadata
                } else if (assemblyId.indexOf('ASSEMBLY_METADATA_') !== -1) {
                	cleanAssemblyId = assemblyId.replace('ASSEMBLY_METADATA_','');
                	assemblies[cleanAssemblyId] = assemblies[cleanAssemblyId] || {};
					assemblies[cleanAssemblyId]['ASSEMBLY_METADATA'] = results[assemblyId].value;
                // Parsing assembly resistance profile
                } else if (assemblyId.indexOf('PAARSNP_RESULT_') !== -1) {
                	cleanAssemblyId = assemblyId.replace('PAARSNP_RESULT_','');
                	assemblies[cleanAssemblyId] = assemblies[cleanAssemblyId] || {};
					assemblies[cleanAssemblyId]['PAARSNP_RESULT'] = results[assemblyId].value;
				}
			}

			console.log('[WGST] Assemblies with merged FP_COMP, ASSEMBLY_METADATA and PAARSNP_RESULT data: ');
			console.log(assemblies);

			res.json(assemblies);
		});
	});
};

// Return resistance profile
exports.getResistanceProfile = function(req, res) {
	getResistanceProfile(function(error, resistanceProfile){

		if (error) throw error;

		res.json({
			resistanceProfile: resistanceProfile
		});
	});
};

var getResistanceProfile = function(callback) {
	console.log('[WGST] Getting resistance profile for assembly ids: ' + req.body.assemblyIds);

	// Get requested assembly from db
	var couchbase = require('couchbase');
	var db = new couchbase.Connection({
		host: 'http://129.31.26.151:8091/pools',
		bucket: 'test_wgst',
		password: '.oneir66'
	}, function(err) {
		if (err) throw err;

		// Prepend PAARSNP_RESULT_ to each assembly id
		var resistanceProfileQueryKeys = req.body.assemblyIds.map(function(assemblyId){
			return 'PAARSNP_RESULT_' + assemblyId;
		});

		console.log('[WGST] Query keys: ');
		console.log(resistanceProfileQueryKeys);

		db.getMulti(resistanceProfileQueryKeys, {}, function(error, results) {
			console.log('[WGST] Got resistance profile data: ');
			console.log(results);

			if (error) {
				callback(error, results);
			}

			callback(null, results);

			/*
			var resistanceProfilesAndAntibiotics = {
				antibiotics: '',
				resistanceProfiles: results
			};

			var db2 = new couchbase.Connection({
				host: 'http://129.31.26.151:8091/pools',
				bucket: 'test_wgst_resources',
				password: '.oneir66'
			}, function(err) {
				if (err) throw err;

				// Get list of antibiotics
				db2.get('ANTIMICROBIALS_ALL', function(err, result) {
					console.log('[WGST] Got list of antibiotics: ');
					console.log(result);

					if (err) throw err;

					resistanceProfilesAndAntibiotics.antibiotics = result.value;

					res.json(resistanceProfilesAndAntibiotics);
				});

			});*/
		});
	});
};

// Return list of all antibiotics grouped by class name
exports.getAllAntibiotics = function(req, res) {
	getAllAntibiotics(function(error, antibiotics){
		if (error) throw error;

		res.json(antibiotics);
	});
};

var getAllAntibiotics = function(callback) {
	console.log('[WGST] Getting list of all antibiotics.');

	var couchbase = require('couchbase');
	var db = new couchbase.Connection({
		host: 'http://129.31.26.151:8091/pools',
		bucket: 'test_wgst_resources',
		password: '.oneir66'
	}, function(err) {
		if (err) throw err;

		// Get list of antibiotics
		db.get('ANTIMICROBIALS_ALL', function(err, result) {

			var antibiotics = result.value.antibiotics;

			console.log('[WGST] Got list of all antibiotics: ');
			console.log(antibiotics);

			if (err) {
				callback(err, result);
			}

			callback(null, antibiotics);
		});
	});
};