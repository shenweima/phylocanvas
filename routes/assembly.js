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
    console.error("[WGST][ERROR] Notification connection: " + error);
});

var notificationExchange = undefined;

notificationConnection.on("ready", function(){
	console.log('[WGST] Notification connection is ready');

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

			console.log('[WGST] Notification exchange "' + notificationExchange.name + '" is open');
		});

});

var couchbase = require('couchbase');
var db = new couchbase.Connection({
	host: 'http://129.31.26.151:8091/pools',
	bucket: 'test_wgst',
	password: '.oneir66'
}, function(error) {
	if (error) {
		console.error('[WGST][ERROR] ' + error);
		return;
	}

	console.log('[WGST][Couchbase] Successfuly opened Couchbase connection');
});

exports.add = function(req, res) {
	console.log('[WGST] Added assembly to collection');

	var collectionId = req.body.collectionId,
		socketRoomId = req.body.socketRoomId,
		userAssemblyId = req.body.name,
		assemblyId = req.body.assemblyId;

	// TO DO: Validate request

	// Send response
	res.json({
		assemblyId: assemblyId
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
								console.log('[WGST] Emitting message for socketRoomId: ' + socketRoomId);
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
								console.log('[WGST] Emitting message for socketRoomId: ' + socketRoomId);
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
								console.log('[WGST] Emitting message for socketRoomId: ' + socketRoomId);
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
								console.log('[WGST] Emitting message for socketRoomId: ' + socketRoomId);
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
						    console.error("[WGST][ERROR] Upload connection: " + error);
						});

						uploadConnection.on("ready", function(){
							console.log('[WGST] Upload connection is ready');


									// -------------------------------------
									// CouchBase Insert Metadata
									// -------------------------------------

									//console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
									//console.log(req.body);
									//console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');

									// Insert assembly metadata into db
									var metadataKey = 'ASSEMBLY_METADATA_' + assemblyId,
										metadata = {
											assemblyId: assemblyId,
											assemblyUserId: req.body.name,
											geographicLocation: {
												type: 'Point',
												coordinates: [req.body.metadata.location.latitude, req.body.metadata.location.longitude]
											}
										};

										console.log('[WGST] Coordinates: ' + req.body.metadata.location.latitude + ', ' + req.body.metadata.location.longitude);

									// var couchbase = require('couchbase');
									// var db = new couchbase.Connection({
									// 	host: 'http://129.31.26.151:8091/pools',
									// 	bucket: 'test_wgst',
									// 	password: '.oneir66'
									// }, function(error) {
									// 	if (error) {
									// 		console.error('[WGST][ERROR] ' + error);
									// 		return;
									// 	}

										console.log('[WGST] Inserting metadata with key: ' + metadataKey);

										db.set(metadataKey, metadata, function(err, result) {
											if (err) {
												console.error('[WGST][ERROR] ' + err);
												return;
											}

											console.log('[WGST] Inserted metadata:');
											console.log(result);
										});
									// });










							var uploadQueueId = 'ART_ASSEMBLY_UPLOAD_' + assemblyId; //+ uuid.v4();

							uploadExchange = uploadConnection.exchange('wgst-ex', {
									type: 'direct',
									passive: true,
									durable: false,
									confirm: false,
									autoDelete: false,
									noDeclare: false,
									confirm: false
								}, function(exchange) {
									console.log('[WGST] Upload exchange "' + exchange.name + '" is open');
								});

							console.log('[WGST] User assembly id: ' + req.body.name);
							console.log('[WGST] Collection id: ' + collectionId);

							// Prepare object to publish
							var assembly = {
								"speciesId" : "1280",
								"sequences" : req.body.assembly, // Content of FASTA file, might need to rename to sequences
								"assemblyId": assemblyId,
								"userAssemblyId" : req.body.name,
								"taskId" : "Experiment_1",
								"collectionId": req.body.collectionId
							};

							// Publish message
							uploadExchange.publish('upload', assembly, { 
								mandatory: true,
								contentType: 'application/json',
								deliveryMode: 1,
								correlationId: 'Art', // Generate UUID?
								replyTo: uploadQueueId
							}, function(err){
								if (err) {
									console.error('[WGST][ERROR] Error when trying to publish to upload exchange');
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
									console.log(parsedMessage);

									//var assemblyId = parsedMessage.assemblyId;

									//uploadQueue.destroy();
									//uploadExchange.destroy();
									uploadConnection.end();
								});
						});
					});
};

// Return fingerprint data
exports.get = function(req, res) {

	console.log('[WGST] Received assembly id: ' + req.params.id);

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

	/*
	var assembly = {
		"type": "FINGERPRINT_COMPARISON",
		"documentKey": "FINGERPRINT_COMPARISON_100547576489977442319713545768032221790",
		"assemblyId": "100547576489977442319713545768032221790",
		"speciesId": "1280",
		"timestamp": "20131203_170734",
		"scores": {
			"gi|82655308|emb|AJ938182.1|": {
				"targetFp": "gi|82655308|emb|AJ938182.1|",
				"score": 0
			},
			"gi|47118324|dbj|BA000018.3|": {
				"targetFp": "gi|47118324|dbj|BA000018.3|",
				"score": 0
			},
			"gi|150373012|dbj|AP009351.1|": {
				"targetFp": "gi|150373012|dbj|AP009351.1|",
				"score": 0
			},
			"gi|49240382|emb|BX571856.1|": {
				"targetFp": "gi|49240382|emb|BX571856.1|",
				"score": 0
			},
			"gi|386829725|ref|NC_017763.1|": {
				"targetFp": "gi|386829725|ref|NC_017763.1|",
				"score": 0
			},
			"gi|87125858|gb|CP000255.1|": {
				"targetFp": "gi|87125858|gb|CP000255.1|",
				"score": 0
			},
			"gi|283469229|emb|AM990992.1|": {
				"targetFp": "gi|283469229|emb|AM990992.1|",
				"score": 0
			},
			"gi|156720466|dbj|AP009324.1|": {
				"targetFp": "gi|156720466|dbj|AP009324.1|",
				"score": 0
			},
			"gi|87201381|gb|CP000253.1|": {
				"targetFp": "gi|87201381|gb|CP000253.1|",
				"score": 0
			},
			"gi|49243355|emb|BX571857.1|": {
				"targetFp": "gi|49243355|emb|BX571857.1|",
				"score": 0
			},
			"gi|312436391|gb|CP002110.1|": {
				"targetFp": "gi|312436391|gb|CP002110.1|",
				"score": 0
			},
			"gi|302749911|gb|CP002120.1|": {
				"targetFp": "gi|302749911|gb|CP002120.1|",
				"score": 0
			},
			"gi|47118312|dbj|BA000033.2|": {
				"targetFp": "gi|47118312|dbj|BA000033.2|",
				"score": 0
			},
			"gi|329312723|gb|CP002643.1|": {
				"targetFp": "gi|329312723|gb|CP002643.1|",
				"score": 0
			},
			"gi|312828563|emb|FR714927.1|": {
				"targetFp": "gi|312828563|emb|FR714927.1|",
				"score": 0
			},
			"gi|147739516|gb|CP000703.1|": {
				"targetFp": "gi|147739516|gb|CP000703.1|",
				"score": 0
			},
			"gi|298693322|gb|CP001996.1|": {
				"targetFp": "gi|298693322|gb|CP001996.1|",
				"score": 0
			},
			"gi|311222926|gb|CP001844.2|": {
				"targetFp": "gi|311222926|gb|CP001844.2|",
				"score": 0
			},
			"gi|262073980|gb|CP001781.1|": {
				"targetFp": "gi|262073980|gb|CP001781.1|",
				"score": 0
			},
			"gi|47208328|dbj|BA000017.4|": {
				"targetFp": "gi|47208328|dbj|BA000017.4|",
				"score": 0
			},
			"gi|344176319|emb|FR821779.1|": {
				"targetFp": "gi|344176319|emb|FR821779.1|",
				"score": 0
			},
			"gi|304365608|gb|CP002114.2|": {
				"targetFp": "gi|304365608|gb|CP002114.2|",
				"score": 0
			},
			"gi|269939526|emb|FN433596.1|": {
				"targetFp": "gi|269939526|emb|FN433596.1|",
				"score": 0
			},
			"gi|160367075|gb|CP000730.1|": {
				"targetFp": "gi|160367075|gb|CP000730.1|",
				"score": 0
			},
			"gi|149944932|gb|CP000736.1|": {
				"targetFp": "gi|149944932|gb|CP000736.1|",
				"score": 0
			}
		},
		"fingerprintSize": 0,
		"fingerprintId": "100547576489977442319713545768032221790",
		"parameters": {
			"blastLibrary": "/nfs/wgst/blast_libs/1280_fingerprints",
			"referenceResourceId": "ref_fps_1280"
		}
	};
	*/

	/*
	var assembly = 
	{
		"type": "FINGERPRINT_COMPARISON",
		"documentKey": "FINGERPRINT_COMPARISON_321180662083474624985282092499360010641",
		"assemblyId": "321180662083474624985282092499360010641",
		"speciesId": "1280",
		"timestamp": "20131205_150511",
		"scores": {
			"gi|150373012|dbj|AP009351.1|": 231,
			"gi|47118324|dbj|BA000018.3|": 197,
			"gi|49240382|emb|BX571856.1|": 81,
			"gi|156720466|dbj|AP009324.1|": 206,
			"gi|302749911|gb|CP002120.1|": 197,
			"gi|312436391|gb|CP002110.1|": 76,
			"gi|47118312|dbj|BA000033.2|": 480,
			"gi|312828563|emb|FR714927.1|": 196,
			"gi|329312723|gb|CP002643.1|": 195,
			"gi|262073980|gb|CP001781.1|": 195,
			"gi|304365608|gb|CP002114.2|": 93,
			"gi|344176319|emb|FR821779.1|": 78,
			"gi|269939526|emb|FN433596.1|": 194,
			"gi|149944932|gb|CP000736.1|": 201,
			"gi|82655308|emb|AJ938182.1|": 68,
			"gi|386829725|ref|NC_017763.1|": 128,
			"gi|87125858|gb|CP000255.1|": 236,
			"gi|283469229|emb|AM990992.1|": 82,
			"gi|87201381|gb|CP000253.1|": 235,
			"gi|49243355|emb|BX571857.1|": 529,
			"gi|147739516|gb|CP000703.1|": 201,
			"gi|311222926|gb|CP001844.2|": 197,
			"gi|298693322|gb|CP001996.1|": 86,
			"gi|47208328|dbj|BA000017.4|": 206,
			"gi|160367075|gb|CP000730.1|": 234
		},
		"fingerprintSize": 1062,
		"fingerprintId": "321180662083474624985282092499360010641",

		"parameters": {
			"blastLibrary": "/nfs/wgst/blast_libs/1280_fingerprints",
			"referenceResourceId": "ref_fps_1280"
		}
	}
	*/

};

exports.apiGetAssembly = function(req, res) {
	console.log('[WGST] Getting assembly with id: ' + req.body.assemblyId);

	var requestedAssemblyId = req.body.assemblyId;

	// Get requested assembly from db
	var couchbase = require('couchbase');
	var db = new couchbase.Connection({
		host: 'http://129.31.26.151:8091/pools',
		bucket: 'test_wgst',
		password: '.oneir66'
	}, function(err) {
		if (err) throw err;

		// Prepare query keys
		var scoresQueryKey = 'FP_COMP_' + requestedAssemblyId,
			metadataQueryKey = 'ASSEMBLY_METADATA_' + requestedAssemblyId,
			resistanceProfileQueryKey = 'PAARSNP_RESULT_' + requestedAssemblyId,
			mlstQueryKey = 'MLST_RESULT_' + requestedAssemblyId;

		var queryKeys = [scoresQueryKey, metadataQueryKey, resistanceProfileQueryKey, mlstQueryKey];

		console.log('[WGST] Query keys: ');
		console.log(queryKeys);

		db.getMulti(queryKeys, {}, function(err, results) {
			console.log('[WGST] Got assemblies data: ');
			console.log(results);

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
			console.log(assemblies);




			
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
						assemblies[requestedAssemblyId].MLST_RESULT.alleles[locusId] = mlstAlleleValue;

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
			console.log('[WGST] Got list of all antibiotics: ');
			console.log(result);

			if (err) {
				callback(err, result);
			}

			callback(null, result.value.antibiotics);
		});
	});
};