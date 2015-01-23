var chalk = require('chalk');
var danger = chalk.white.bgRed;
var warning = chalk.bgYellow;
var success = chalk.bgGreen;

exports.add = function(req, res) {

	var collectionId = req.body.collectionId;
	var socketRoomId = req.body.socketRoomId;
	var userAssemblyId = req.body.userAssemblyId;
	var assemblyId = req.body.assemblyId;

	console.log('[WGST] Adding assembly ' + assemblyId + ' to collection ' + collectionId);

	// Validate request
	//
	if (! collectionId) {
		console.error(danger('[WGST] Missing collection id'));
	}
	
	if (! socketRoomId) {
		console.error(danger('[WGST] Missing socket room id'));
	}

	if (! userAssemblyId) {
		console.error(danger('[WGST] Missing user assembly id'));
	}

	if (! assemblyId) {
		console.error(danger('[WGST] Missing assembly id'));
	}

	// Send response
	//
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
	var uploadQueue;
	var notificationQueueId = 'ART_NOTIFICATION_' + assemblyId;
	var tasks = {
		// Per assembly
		FP: 'FP',
		MLST: 'MLST',
		PAARSNP: 'PAARSNP',
		CORE: 'CORE',
		// Per collection
		CORE_MUTANT_TREE: 'CORE_MUTANT_TREE',
		COLLECTION_TREE: 'COLLECTION_TREE'
	};

	// Create queue
	rabbitMQConnection.queue(notificationQueueId, 
		{
			exclusive: true
		}, function(queue){
			console.log('[WGST][RabbitMQ] Notification queue "' + queue.name + '" is open');

			queue.bind(rabbitMQExchangeNames.NOTIFICATION, "*.ASSEMBLY." + assemblyId); // binding routing key
			queue.bind(rabbitMQExchangeNames.NOTIFICATION, "CORE_TREE_RESULT.COLLECTION." + collectionId);
			queue.bind(rabbitMQExchangeNames.NOTIFICATION, "COLLECTION_TREE.COLLECTION." + collectionId);

			var receivedResults = {};

			// Subscribe to response message
			queue.subscribe(function(message, headers, deliveryInfo){
				var buffer = new Buffer(message.data);
				var bufferJSON = buffer.toString();
				var parsedMessage = JSON.parse(bufferJSON);
				var messageAssemblyId = parsedMessage.assemblyId;
				var messageUserAssemblyId = userAssemblyId;

				console.log('[WGST][RabbitMQ] Received notification message');
				console.dir(parsedMessage);

				/**
				* You'll receive only 1 of these per assembly.
				*/
				if (parsedMessage.taskType === tasks.FP) {
					console.log('[WGST][Socket.io] Emitting FP message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "FP_COMP ready",
						result: "FP_COMP",
						socketRoomId: socketRoomId
					});

					receivedResults['FP_COMP'] = 'FP_COMP';

				/**
				* You'll receive only 1 of these per assembly.
				*/
				} else if (parsedMessage.taskType === tasks.MLST) {
					console.log('[WGST][Socket.io] Emitting MLST message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "MLST ready",
						result: "MLST_RESULT",
						socketRoomId: socketRoomId
					});

					receivedResults['MLST_RESULT'] = 'MLST_RESULT';

				/**
				* You'll receive only 1 of these per assembly.
				*/
				} else if (parsedMessage.taskType === tasks.PAARSNP) {
					console.log('[WGST][Socket.io] Emitting PAARSNP message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "PAARSNP ready",
						result: "PAARSNP_RESULT",
						socketRoomId: socketRoomId
					});

					receivedResults['PAARSNP_RESULT'] = 'PAARSNP_RESULT';

				/**
				* You'll receive only 1 of these per assembly.
				*/
				} else if (parsedMessage.taskType === tasks.CORE) {
					console.log('[WGST][Socket.io] Emitting CORE message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "CORE ready",
						result: "CORE",
						socketRoomId: socketRoomId
					});

					receivedResults['CORE'] = 'CORE';

				/**
				* You'll receive it at least 1 of these per collection,
				* but sometimes more than 1, but all identical.
				*/
				} else if (parsedMessage.taskType === tasks.CORE_MUTANT_TREE) {
					console.log('[WGST][Socket.io] Emitting CORE_MUTANT_TREE message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "CORE_MUTANT_TREE ready",
						result: "CORE_MUTANT_TREE",
						socketRoomId: socketRoomId
					});

					receivedResults['CORE_MUTANT_TREE'] = 'CORE_MUTANT_TREE';

				/**
				* You'll receive it at least 1 of these per collection,
				* but sometimes more than 1, but all identical.
				*/
				} else if (parsedMessage.taskType === tasks.COLLECTION_TREE) {
					console.log('[WGST][Socket.io] Emitting COLLECTION_TREE message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "COLLECTION_TREE ready",
						result: "COLLECTION_TREE",
						socketRoomId: socketRoomId
					});

					receivedResults['COLLECTION_TREE'] = 'COLLECTION_TREE';
				}

				// Unbind queue after all results were received
				if (Object.keys(receivedResults).length === Object.keys(tasks).length) {
					//queue.unbind(notificationExchange, "*.ASSEMBLY." + assemblyId);
					//queue.unbind(notificationExchange, "COLLECTION_TREE.COLLECTION." + collectionId);
					queue.destroy();
				} // if
			});

			// -----------------------------------------------------------
			// Insert assembly metadata into Couchbase
			// -----------------------------------------------------------

			var metadataKey = 'ASSEMBLY_METADATA_' + assemblyId;
			var assemblyMetadata = req.body.metadata;
			var metadata = {
				assemblyId: assemblyId,
				userAssemblyId: req.body.userAssemblyId,
				datetime: assemblyMetadata.datetime,
				geography: assemblyMetadata.geography,
				source: assemblyMetadata.source
			};

			console.log('[WGST][Couchbase] Inserting assembly metadata with key: ' + metadataKey);
			console.dir(metadata);

			couchbaseDatabaseConnections[COUCHBASE_BUCKETS.MAIN].set(metadataKey, metadata, function(error, result) {
				if (error) {
					console.error(danger('[WGST][Couchbase][Error] ✗ Failed to insert assembly metadata: ' + error));
					return;
				}

				console.log(success('[WGST][Couchbase] Inserted assembly metadata'));

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

			//
			// Old request object
			//
			// // Prepare object to publish
			// var assembly = {
			// 	"speciesId" : "1280",
			// 	"sequences" : req.body.sequences, // Content of FASTA file
			// 	"assemblyId": assemblyId,
			// 	"userAssemblyId" : userAssemblyId,
			// 	"taskId" : "Experiment_1",
			// 	"collectionId": collectionId
			// };

			// Prepare object to publish
			//
			var assembly = {
				taskId: assemblyId,
				inputData: req.body.sequences,
				speciesId: '1280',
				assemblyId: assemblyId,
				collectionId: collectionId,
				sequences: req.body.sequences
			};

			console.log('[WGST][RabbitMQ] Uploading assembly ' + assemblyId + ' to collection ' + collectionId);
			//console.dir(assembly);

			// Publish message
			rabbitMQExchanges[rabbitMQExchangeNames.UPLOAD].publish('upload', assembly, { 
				mandatory: true,
				contentType: 'application/json',
				deliveryMode: 1,
				correlationId: 'Art', // Generate UUID?
				replyTo: uploadQueueId
			}, function(err){
				if (err) {
					console.error(danger('[WGST][RabbitMQ][Error] ✗ Error when trying to publish to upload exchange'));
					return;
				}

				console.log('[WGST][RabbitMQ] Message was published to upload exchange');
			});

			uploadQueue = rabbitMQConnection
				.queue(uploadQueueId, {
					passive: false,
					durable: false,
					exclusive: true,
					autoDelete: true,
					noDeclare: false,
					closeChannelOnUnsubscribe: false
				}, function(queue){
					console.log('[WGST][RabbitMQ] Upload queue "' + queue.name + '" is open');
				}) // Subscribe to response message
				.subscribe(function(message, headers, deliveryInfo){
					console.log('[WGST][RabbitMQ] Preparing metadata object');									

					var buffer = new Buffer(message.data);
					var bufferJSON = buffer.toString();
					var parsedMessage = JSON.parse(bufferJSON);

					console.log('[WGST][RabbitMQ] Received message from upload queue:');
					console.dir(parsedMessage);
				});
		});
};

exports.get = function(req, res) {
	console.log('[WGST] Requested assembly id: ' + req.params.id);

	couchbaseDatabaseConnections[COUCHBASE_BUCKETS.MAIN].get(req.params.id, function(error, result) {
		if (error) {
			console.error(danger(error));
			console.error(danger(result));
			res.sendStatus(500);
			return;
		}

		var assembly = result.value;

		console.dir(assembly);

		res.render('app', { requestedAssemblyObject: JSON.stringify(assembly) });
	});
};

exports.getAssemblyMetadata = function(assemblyId, callback) {
	console.log('[WGST] Getting assembly metadata ' + assemblyId);

	couchbaseDatabaseConnections[COUCHBASE_BUCKETS.MAIN].get('ASSEMBLY_METADATA_' + assemblyId, function(error, result) {
		if (error) {
			console.error(danger('[WGST][Error] Failed to get assembly metadata: ' + error));
			
			//
			// Often additional information about what caused an error can be found in the result object
			//
			if (Object.keys(result).length > 0) {
				console.dir(result);
			}

			callback(error, null);
			return;
		}

		var assemblyMetadata = result.value;

		console.log('[WGST] Got assembly metadata ' + assemblyId);
		console.dir(assemblyMetadata);

		callback(null, assemblyMetadata);
	});
};

var generateStQueryKey = function(alleles) {

	// Prepare ST query key
	// 'ST_' + species id + allele ids
	var stQueryKey = 'ST_1280';
	var alleleId;

	for (allele in alleles) {
		if (alleles.hasOwnProperty(allele)) {
			// If allele id is NEW or null, then don't query ST (Sequence Types) codes
			if (alleles[allele] !== null) {
				alleleId = alleles[allele].alleleId;

				if (alleleId !== 'NEW') {
					stQueryKey = stQueryKey + '_' + alleleId;
				}			
			}
		}
	} // for

	if (stQueryKey === 'ST_1280') {
		return '';
	} else {
		return stQueryKey;
	}
};

exports.getST = function(alleles, callback) {
	console.log('[WGST] Getting ST');
	//console.dir(alleles);

	var stQueryKey = generateStQueryKey(alleles);

	if (stQueryKey === '') {
		callback(null, '');
		return;
	}

	// // Prepare ST query key
	// // 'ST_' + species id + allele ids
	// var stQueryKey = 'ST_' + '1280',
	// 	alleleId;

	// for (allele in alleles) {
	// 	if (alleles.hasOwnProperty(allele)) {
	// 		// If allele id is NEW or null, then don't query ST (Sequence Types) codes
	// 		if (alleles[allele] === null) {
	// 			callback(null, '');
	// 			return;
	// 		} else {
	// 			alleleId = alleles[allele].alleleId;
	// 			if (alleleId === 'NEW') {
	// 				callback(null, '');
	// 				return;
	// 			} else {
	// 				stQueryKey = stQueryKey + '_' + alleleId;
	// 			}			
	// 		}
	// 	}
	// } // for

	// Get ST code
	couchbaseDatabaseConnections[COUCHBASE_BUCKETS.RESOURCES].get(stQueryKey, function(error, stData) {
		if (error) {
			if (error.code === 13) {
				console.log(warning('[WGST][Warning] No ST key found: ' + stQueryKey));
				callback(null, 'New');
				return;
			} else {
				callback(error, null);
				return;
			}
		} // if

		callback(null, stData.value.stType);
	});
};

exports.getSTs = function(stQueryKeys, callback) {
	console.log('[WGST] Getting STs');
	//console.dir(alleles);

	// Get ST codes
	couchbaseDatabaseConnections[COUCHBASE_BUCKETS.RESOURCES].getMulti(stQueryKeys, {}, function(error, stData) {

		// Have to ignore error for now, because this some keys might not be found

		// if (error) {
		// 	if (error.code === 13) {
		// 		// console.log('! [WGST][Warning] No such ST key found: ' + stQueryKey);
		// 		// callback(null, 'New');
		// 		// return;

		// 		// Ignore for now
		// 	} else {
		// 		callback(error, stData);
		// 		return;
		// 	}
		// } // if

		callback(error, stData);
	});
};

var getMlstQueryKeys = function(alleles) {
	// Prepare allele query keys
	var alleleQueryKey;
	var mlstAllelesQueryKeys = [];

	for (allele in alleles) {
		if (alleles.hasOwnProperty(allele)) {
			alleleQueryKey = alleles[allele];
			// Allele can be 'null'. If that happens - replace it with 'None' and don't add it to query keys array
			if (alleleQueryKey !== null) {
				mlstAllelesQueryKeys.push(alleleQueryKey);
			}
		}
	} // for

	return mlstAllelesQueryKeys;
};

var getStData = function(mlstAllelesQueryKeys, callback) {
	// Get MLST alleles data
	exports.getMlstAllelesData(mlstAllelesQueryKeys, function(error, mlstAlleles){
		if (error) {
			callback(error, mlstAlleles);
			return;
		}

		var mlstAlleleValue;
		var mlstAllele;
		var locusId;

		// console.log('>>> assemblyId: ' + assemblyId);

		// Check if any MLST alleles data returned
		if (Object.keys(mlstAlleles).length > 0) {
			// Parse MLST alleles data
			for (mlstAllele in mlstAlleles) {
				if (mlstAlleles.hasOwnProperty(mlstAllele)) {
					// Get value object from query result object
					mlstAlleleValue = mlstAlleles[mlstAllele].value;
					// Get locus id from value object
					locusId = mlstAlleleValue.locusId;
					// Add allele value object to assembly object
					assembly.MLST_RESULT.alleles[locusId] = mlstAlleleValue;
				} // if
			} // for				
		} // if

		exports.getST(assembly.MLST_RESULT.alleles, function(error, stType){
			if (error) {
				callback(error, stType);
				return;
			}

			assembly.MLST_RESULT.stType = stType;

			callback(null, assembly);
		});
	});
};

var addMlstAlleleToAssembly = function(assembly, mlstAlleles) {
	var mlstAlleleValue;
	var mlstAllele;
	var locusId;

	// Check if any MLST alleles data returned
	if (Object.keys(mlstAlleles).length > 0) {
		// Parse MLST alleles data
		for (mlstAllele in mlstAlleles) {
			if (mlstAlleles.hasOwnProperty(mlstAllele)) {
				// Get value object from query result object
				mlstAlleleValue = mlstAlleles[mlstAllele].value;
				// Get locus id from value object
				locusId = mlstAlleleValue.locusId;
				// Add allele value object to assembly object
				assembly.MLST_RESULT.alleles[locusId] = mlstAlleleValue;
			} // if
		} // for				
	} // if
};

exports.getAssembly = function(assemblyId, callback) {
	console.log('[WGST] Getting assembly ' + assemblyId);

	// ------------------------------------------
	// Prepare query keys
	// ------------------------------------------
	var scoresQueryKey = 'FP_COMP_' + assemblyId;
	var metadataQueryKey = 'ASSEMBLY_METADATA_' + assemblyId;
	var resistanceProfileQueryKey = 'PAARSNP_RESULT_' + assemblyId;
	var mlstQueryKey = 'MLST_RESULT_' + assemblyId;
		//coreQueryKey = 'CORE_RESULT_' + assemblyId;	

	//var assemblyQueryKeys = [scoresQueryKey, metadataQueryKey, resistanceProfileQueryKey, mlstQueryKey, coreQueryKey];
	var assemblyQueryKeys = [scoresQueryKey, metadataQueryKey, resistanceProfileQueryKey, mlstQueryKey];

	console.log('[WGST] Assembly ' + assemblyId + ' query keys:');
	console.dir(assemblyQueryKeys);

	// ------------------------------------------
	// Query assembly data
	// ------------------------------------------
	couchbaseDatabaseConnections[COUCHBASE_BUCKETS.MAIN].getMulti(assemblyQueryKeys, {}, function(error, assemblyData) {
		if (error) {
			callback(error, assemblyData);
			return;
		}
		console.log('[WGST] Got assembly ' + assemblyId + ' data');
		//console.dir(assemblyData);

		// ---------------------------------------------
		// Merge assembly data into one assembly object
		// ---------------------------------------------

		var assembly = {};

		for (assemblyKey in assemblyData) {

            // Parsing assembly scores
            if (assemblyKey.indexOf('FP_COMP_') !== -1) {
				assembly['FP_COMP'] = assemblyData[assemblyKey].value;

            // Parsing assembly metadata
            } else if (assemblyKey.indexOf('ASSEMBLY_METADATA_') !== -1) {
				assembly['ASSEMBLY_METADATA'] = assemblyData[assemblyKey].value;

            // Parsing assembly resistance profile
            } else if (assemblyKey.indexOf('PAARSNP_RESULT_') !== -1) {
				assembly['PAARSNP_RESULT'] = assemblyData[assemblyKey].value;

            // Parsing MLST
            } else if (assemblyKey.indexOf('MLST_RESULT_') !== -1) {
				assembly['MLST_RESULT'] = assemblyData[assemblyKey].value;

            // Parsing CORE
            } else if (assemblyKey.indexOf('CORE_RESULT_') !== -1) {
				assembly['CORE_RESULT'] = assemblyData[assemblyKey].value;

			} // if
		} // for

		// console.log('[WGST] Assembly with merged FP_COMP, ASSEMBLY_METADATA, PAARSNP_RESULT and MLST_RESULT data: ');
		// console.dir(assembly);

		// ---------------------------------------------
		// Get ST
		// ---------------------------------------------

		// Prepare allele query keys
		// var alleles = assembly['MLST_RESULT'].alleles,
		// 	alleleQueryKey,
		// 	mlstAllelesQueryKeys = [];

		// for (allele in alleles) {
		// 	if (alleles.hasOwnProperty(allele)) {
		// 		alleleQueryKey = alleles[allele];
		// 		// Allele can be 'null'. If that happens - replace it with 'None' and don't add it to query keys array
		// 		if (alleleQueryKey !== null) {
		// 			mlstAllelesQueryKeys.push(alleleQueryKey);
		// 		}
		// 	}
		// }
		var mlstAllelesQueryKeys = getMlstQueryKeys(assembly['MLST_RESULT'].alleles);

		// Get MLST alleles data
		console.log('[WGST] Getting assembly ' + assemblyId + ' MLST alleles data');
		exports.getMlstAllelesData(mlstAllelesQueryKeys, function(error, mlstAlleles){
			if (error) {
				callback(error, mlstAlleles);
				return;
			}

			console.log('[WGST] Got assembly ' + assemblyId + ' MLST alleles data');

			addMlstAlleleToAssembly(assembly, mlstAlleles);

			// Get ST
			console.log('[WGST] Getting assembly ' + assemblyId + ' ST data');
			exports.getST(assembly.MLST_RESULT.alleles, function(error, stType){
				if (error) {
					callback(error, stType);
					return;
				}
				console.log('[WGST] Got assembly ' + assemblyId + ' ST data');

				assembly.MLST_RESULT.stType = stType;

				callback(null, assembly);
			});
		});
	});
};

exports.apiGetAssembly = function(req, res) {
	var assemblyId = req.body.assemblyId;

	exports.getAssembly(assemblyId, function(error, assembly){
		if (error) {
			console.error(danger(error));
			console.error(danger(assembly));
			res.sendStatus(500);
			return;
		}

		exports.getAllAntibiotics(function(error, antibiotics){
			if (error) {
				console.error(danger(error));
				console.error(danger(antibiotics));
				res.sendStatus(500);
				return;
			}

			res.json({
				assembly: assembly,
				antibiotics: antibiotics
			});
		});
	});
};

exports.getMlstAllelesData = function(queryKeys, callback) {
	if (queryKeys.length === 0) {
		callback(null, {});
		return;
	}

	console.log('[WGST] Getting MLST alleles data');
	couchbaseDatabaseConnections[COUCHBASE_BUCKETS.RESOURCES].getMulti(queryKeys, {}, function(error, mlstAllelesData) {
		if (error) {
			callback(error, mlstAllelesData);
			return;
		}
		console.log('[WGST] Got MLST alleles data');

		callback(null, mlstAllelesData);
	});
};

exports.apiGetAssemblies = function(req, res) {
	var assemblyIds = req.body.assemblyIds;

	console.log('[WGST] Getting assemblies with ids:');
	console.dir(assemblyIds);

	// ------------------------------------------
	// Prepare query keys
	// ------------------------------------------

	// Prepend FP_COMP_ to each assembly id
	var scoresAssemblyIds = assemblyIds.map(function(assemblyId){
		return 'FP_COMP_' + assemblyId;
	});

	// Prepend ASSEMBLY_METADATA_ to each assembly id
	var metadataAssemblyIds = assemblyIds.map(function(assemblyId){
		return 'ASSEMBLY_METADATA_' + assemblyId;
	});

	// Prepend PAARSNP_RESULT_ to each assembly id
	var resistanceProfileAssemblyIds = assemblyIds.map(function(assemblyId){
		return 'PAARSNP_RESULT_' + assemblyId;
	});

	// Prepend MLST_RESULT_ to each assembly id
	var mlstAssemblyIds = assemblyIds.map(function(assemblyId){
		return 'MLST_RESULT_' + assemblyId;
	});

	// Merge all assembly ids
	var assemblyIdQueryKeys = scoresAssemblyIds
						.concat(metadataAssemblyIds)
						.concat(resistanceProfileAssemblyIds)
						.concat(mlstAssemblyIds);

	console.log('[WGST] Querying keys:');
	console.log(assemblyIdQueryKeys);

	// ------------------------------------------
	// Query assembly data
	// ------------------------------------------
	couchbaseDatabaseConnections[COUCHBASE_BUCKETS.MAIN].getMulti(assemblyIdQueryKeys, {}, function(error, results) {
		console.log('[WGST][Couchbase] Got assemblies data:');
		//console.log(results);

		if (error) {
			console.error(danger(error));
			console.error(danger(results));
			res.sendStatus(500);
			return;
		}

		// ---------------------------------------------
		// Merge assembly data into one assembly object
		// ---------------------------------------------
		var assemblies = {};
		var assemblyId;
		var cleanAssemblyId;

		for (assemblyId in results) {
			if (results.hasOwnProperty(assemblyId)) {
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
	            // Parsing mlst
	            } else if (assemblyId.indexOf('MLST_RESULT_') !== -1) {
	            	cleanAssemblyId = assemblyId.replace('MLST_RESULT_','');
	            	assemblies[cleanAssemblyId] = assemblies[cleanAssemblyId] || {};
					assemblies[cleanAssemblyId]['MLST_RESULT'] = results[assemblyId].value;
				} // if
			} // if
		} // for

		console.log('[WGST] Assemblies with merged FP_COMP, ASSEMBLY_METADATA, PAARSNP_RESULT and MLST_RESULT data: ');
		console.dir(assemblies);

		// ---------------------------------------------
		// Get ST for all assemblies
		// 1. Extract all alleles query keys and query them.
		// ---------------------------------------------
		var assemblyId;
		var assembly;
		var assemblyMlstAllelesQueryKeys = [];
		var allAssembliesMlstAllelesQueryKeys = [];
		var mlstAllelesQueryKeysToAssemblyMap = {};

		for (assemblyId in assemblies) {
			if (assemblies.hasOwnProperty(assemblyId)) {
				assembly = assemblies[assemblyId];

				// Get mlst alleles query keys for this assembly
				assemblyMlstAllelesQueryKeys = getMlstQueryKeys(assembly['MLST_RESULT'].alleles);

				// Put all mlst alleles query keys in to single array for query
				allAssembliesMlstAllelesQueryKeys = allAssembliesMlstAllelesQueryKeys.concat(assemblyMlstAllelesQueryKeys);
				
				// ---------------------------------------------------------
				// Group assemblies by mlst alleles query keys
				// Example:
				// { 'MLST_1280_4vKkf4rbZy6tac02Ppbu37LVWyM=' : ['a4bb3c91-2d8b-43fd-87e8-64501b3de82c', '42c88107-7f58-4577-9957-f5f469acfdff']}
				// ---------------------------------------------------------
				var assemblyMlstAllelesQueryKey;
				for (var i = 0; i < assemblyMlstAllelesQueryKeys.length; i++) {
					assemblyMlstAllelesQueryKey = assemblyMlstAllelesQueryKeys[i];
					// Track which assemblies belong to which mlst alleles query keys
					// Map assembly ids to mlst alleles query keys
					mlstAllelesQueryKeysToAssemblyMap[assemblyMlstAllelesQueryKey] = mlstAllelesQueryKeysToAssemblyMap[assemblyMlstAllelesQueryKey] || [];
					mlstAllelesQueryKeysToAssemblyMap[assemblyMlstAllelesQueryKey].push(assemblyId);
				} // for
			} // if
		} // for

		// Get MLST alleles data
		exports.getMlstAllelesData(allAssembliesMlstAllelesQueryKeys, function(error, mlstAllelesData){
			if (error) {
				console.error(danger(error));
				console.error(danger(mlstAllelesData));
				res.sendStatus(500);
				return;
			}

			// Group mlst alleles data by assembly id
			// ---------------------------------------------------------
			// Group mlst alleles data by assembly id
			// Example:
			// { 'a4bb3c91-2d8b-43fd-87e8-64501b3de82c' : { 'MLST_1280_ySUwgFjEbIx5XpoyomFs+W3poI0=': { cas: [Object], flags: 0, value: [Object] },
			// 												'MLST_1280_uS1ci2t4E82d/sCVd6k2OC+3nw0=': { cas: [Object], flags: 0, value: [Object] }}
			// ---------------------------------------------------------
			var mlstAlleleQueryKey;
			var assemblyIdsWithMlstAlleleQueryKey;
			var assemblyIdWithMlstAlleleQueryKey;
			var assemblyIdToMlstAllelesDataMap = {};

			for (mlstAlleleQueryKey in mlstAllelesData) {
				if (mlstAllelesData.hasOwnProperty(mlstAlleleQueryKey)) {
					assemblyIdsWithMlstAlleleQueryKey = mlstAllelesQueryKeysToAssemblyMap[mlstAlleleQueryKey];
					for (var i = 0; i < assemblyIdsWithMlstAlleleQueryKey.length; i++) {
						assemblyIdWithMlstAlleleQueryKey = assemblyIdsWithMlstAlleleQueryKey[i];
						assemblyIdToMlstAllelesDataMap[assemblyIdWithMlstAlleleQueryKey] = assemblyIdToMlstAllelesDataMap[assemblyIdWithMlstAlleleQueryKey] || {};
						assemblyIdToMlstAllelesDataMap[assemblyIdWithMlstAlleleQueryKey][mlstAlleleQueryKey] = mlstAllelesData[mlstAlleleQueryKey];
					}
				}
			}

			// ---------------------------------------------------------
			// Add mlst allele data to each assembly object
			// ---------------------------------------------------------
			var assemblyId;
			for (assemblyId in assemblyIdToMlstAllelesDataMap) {
				if (assemblyIdToMlstAllelesDataMap.hasOwnProperty(assemblyId)) {
					addMlstAlleleToAssembly(assemblies[assemblyId], assemblyIdToMlstAllelesDataMap[assemblyId]);
				}
			}

			var allelesData = [];
			var assemblyId;
			var assembly;

			for (assemblyId in assemblies) {
				if (assemblies.hasOwnProperty(assemblyId)) {
					assembly = assemblies[assemblyId];

					allelesData.push({
						assemblyId: assemblyId,
						assemblyAlleles: assembly.MLST_RESULT.alleles
					});
				}
			}

			// ---------------------------------------------------------
			// Create ST query keys
			// ---------------------------------------------------------

			var stQueryKeys = [];
			var stQueryKey;
			var assemblyAllelesData;
			var stQueryKeyToAssemblyIdMap = {};

			for (var i = 0; i < allelesData.length; i++) {
				// Get allele
				assemblyAllelesData = allelesData[i].assemblyAlleles;
				stQueryKey = generateStQueryKey(assemblyAllelesData);
				// Do not query empty keys
				if (stQueryKey !== '') {
					// Store st query key
					stQueryKeys.push(stQueryKey);
					// Map st query key to assembly id
					stQueryKeyToAssemblyIdMap[stQueryKey] = stQueryKeyToAssemblyIdMap[stQueryKey] || [];
					stQueryKeyToAssemblyIdMap[stQueryKey].push(allelesData[i].assemblyId);
				}
			} // for

			// ---------------------------------------------------------
			// Query STs for all assemblies with one query
			// ---------------------------------------------------------

			exports.getSTs(stQueryKeys, function(error, allStData) {
				if (error) {}
				// Most likely error returns 1 when some of the keys were not found.
				// In this case we need set ST value for missing keys as 'NEW'.

				var stQuery;
				var stData;
				var st;
				var assemblyId;
				var assembly;
				var assemblyIds;

				for (stQuery in allStData) {
					stData = allStData[stQuery];

					if (typeof stData.value === 'undefined') {
						st = 'NEW'
					} else {
						st = stData.value.stType;
					}

					assemblyIds = stQueryKeyToAssemblyIdMap[stQuery];
					for (var i = 0; i < assemblyIds.length; i++) {
						assemblyId = assemblyIds[i];

						assemblies[assemblyId].MLST_RESULT.stType = st;
					}
				} // for

				res.json(assemblies);
			});
		});
	});
};

// Return resistance profile
exports.apiGetResistanceProfile = function(req, res) {
	exports.getResistanceProfile(function(error, resistanceProfile){

		if (error) {
			console.error(danger(error));
			console.error(danger(resistanceProfile));
			res.sendStatus(500);
			return;
		}

		res.json({
			resistanceProfile: resistanceProfile
		});
	});
};

exports.getResistanceProfile = function(callback) {
	console.log('[WGST] Getting resistance profile for assembly ids: ' + req.body.assemblyIds);

	// Prepend PAARSNP_RESULT_ to each assembly id
	var resistanceProfileQueryKeys = req.body.assemblyIds.map(function(assemblyId){
		return 'PAARSNP_RESULT_' + assemblyId;
	});

	console.log('[WGST] Resistance profile query keys: ');
	console.log(resistanceProfileQueryKeys);

	couchbaseDatabaseConnections[COUCHBASE_BUCKETS.MAIN].getMulti(resistanceProfileQueryKeys, {}, function(error, results) {
		console.log('[WGST][Couchbase] Got resistance profile data:');
		console.dir(results);

		if (error) {
			callback(error, results);
			return;
		}

		callback(null, results);
	});
};

// Return list of all antibiotics grouped by class name
exports.apiGetAllAntibiotics = function(req, res) {
	exports.getAllAntibiotics(function(error, antibiotics) {
		if (error) {
			console.error(danger(error));
			console.error(danger(antibiotics));
			res.sendStatus(500);
			return;
		}

		res.json(antibiotics);
	});
};

exports.getAllAntibiotics = function(callback) {
	console.log('[WGST] Getting list of all antibiotics');

	// Get list of all antibiotics
	couchbaseDatabaseConnections[COUCHBASE_BUCKETS.RESOURCES].get('ANTIMICROBIALS_ALL', function(error, result) {
		if (error) {
			callback(error, result);
			return;
		}

		var antibiotics = result.value.antibiotics;

		console.log('[WGST] Got the list of all antibiotics');

		callback(null, antibiotics);
	});
};

exports.apiGetAssemblyTableData = function(req, res) {
	var assemblyIds = req.body.assemblyIds;

	getAssemblyTableData(assemblyIds, function(error, assemblyTableData) {
		if (error) {
			res.json(500, { error: error });
			return;
		}

		res.json(reduceAssemblyTableData(assemblyTableData));
	});
};

var reduceAssemblyTableData = function(assemblyDataTable) {
	var reducedAssemblyDataTable = {};
	var assembly;

	for (assemblyDataTableQueryKey in assemblyDataTable) {
		if (assemblyDataTable.hasOwnProperty(assemblyDataTableQueryKey)) {
			assembly = assemblyDataTable[assemblyDataTableQueryKey].value;
			reducedAssemblyDataTable[assembly.assemblyId] = {
				assemblyId: assembly.assemblyId,
				completeAlleles: assembly.completeAlleles
			};
		}
	}

	return reducedAssemblyDataTable;
}

var getAssemblyTableData = function(assemblyIds, callback) {
	console.log('[WGST] Getting table data for assemblies: ' + assemblyIds.join(', '));

	var assemblyTableQueryKeys = assemblyIds.map(function(assemblyId){
		return 'CORE_RESULT_' + assemblyId;
	});

	console.log('[WGST][Couchbase] Prepared query keys: ' + assemblyTableQueryKeys.join(', '));

	couchbaseDatabaseConnections[COUCHBASE_BUCKETS.MAIN].getMulti(assemblyTableQueryKeys, {}, function(error, assemblyTableData) {
		if (error) {
			console.error(danger('[WGST][Couchbase][Error] ✗ ' + error));
			callback(error, null);
			return;
		}

		console.log('[WGST] Got table data for assemblies ' + assemblyIds.join(', '));
		console.dir(assemblyTableData);

		callback(null, assemblyTableData);
	});
};

exports.apiGetCoreResult = function(req, res, next) {
	exports.getCoreResult(req.params.id, function (err, result) {
	  if (err) {
	    return next(err);
	  }
	  res.send(result);
	});
}

exports.getCoreResult = function(id, callback) {
  var bucket = couchbaseDatabaseConnections[COUCHBASE_BUCKETS.MAIN];
  bucket.get('CORE_RESULT_' + id, {}, function(error, result) {
    if (error) {
      return callback(error);
    }

    callback(null, {
      totalCompleteCoreMatches: result.value.totalCompleteCoreMatches,
      totalCompleteAlleleMatches: result.value.totalCompleteAlleleMatches
    });
  });
}
