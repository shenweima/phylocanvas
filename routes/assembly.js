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
	var uploadQueue;

	// Generate queue id
	var notificationQueueId = 'ART_NOTIFICATION_' + assemblyId;

	// Create queue
	rabbitMQConnection.queue(notificationQueueId, 
		{
			exclusive: true
		}, function(queue){
			console.log('[WGST][RabbitMQ] Notification queue "' + queue.name + '" is open');

			var readyResults = [];

			queue.bind(rabbitMQExchangeNames.NOTIFICATION, "*.ASSEMBLY." + assemblyId); // binding routing key
			queue.bind(rabbitMQExchangeNames.NOTIFICATION, "CORE_RESULT_ASSEMBLY_" + assemblyId);
			queue.bind(rabbitMQExchangeNames.NOTIFICATION, "CORE_TREE_RESULT_COLLECTION_" + collectionId);

			// Subscribe to response message
			queue.subscribe(function(message, headers, deliveryInfo){
				console.log('[WGST][RabbitMQ] Received notification message');

				var buffer = new Buffer(message.data),
					bufferJSON = buffer.toString(),
					parsedMessage = JSON.parse(bufferJSON);

				console.dir(parsedMessage);

				var messageAssemblyId = parsedMessage.assemblyId,
					messageUserAssemblyId = parsedMessage.userAssemblyId;

				console.log('[WGST] Message assembly id: ' + messageAssemblyId);
				console.log('[WGST] Message user assembly id: ' + messageUserAssemblyId);

				// Check task type
				if (parsedMessage.taskType === 'FP') {
					console.log('[WGST][Socket.io] Emitting FP message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "FP_COMP ready",
						result: "FP_COMP",
						socketRoomId: socketRoomId
					});

					readyResults.push('FP_COMP');

				} else if (parsedMessage.taskType === 'MLST') {
					console.log('[WGST][Socket.io] Emitting MLST message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "MLST ready",
						result: "MLST_RESULT",
						socketRoomId: socketRoomId
					});

					readyResults.push('MLST_RESULT');

				} else if (parsedMessage.taskType === 'PAARSNP') {
					console.log('[WGST][Socket.io] Emitting PAARSNP message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "PAARSNP ready",
						result: "PAARSNP_RESULT",
						socketRoomId: socketRoomId
					});

					readyResults.push('PAARSNP_RESULT');

				} else if (parsedMessage.taskType === 'COLLECTION_TREE') {
					console.log('[WGST][Socket.io] Emitting COLLECTION_TREE message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "COLLECTION_TREE ready",
						result: "COLLECTION_TREE",
						socketRoomId: socketRoomId
					});

					readyResults.push('COLLECTION_TREE');

				} else if (parsedMessage.taskType === 'CORE') {
					console.log('[WGST][Socket.io] Emitting CORE message for socketRoomId: ' + socketRoomId);
					io.sockets.in(socketRoomId).emit("assemblyUploadNotification", {
						collectionId: collectionId,
						assemblyId: messageAssemblyId,
						userAssemblyId: messageUserAssemblyId,
						status: "CORE ready",
						result: "CORE",
						socketRoomId: socketRoomId
					});

					readyResults.push('CORE');

				} // else if

				// Unbind queue after all results were received
				if (readyResults.length === 5) {
					//queue.unbind(notificationExchange, "*.ASSEMBLY." + assemblyId);
					//queue.unbind(notificationExchange, "COLLECTION_TREE.COLLECTION." + collectionId);
					queue.destroy();
					//notificationExchange.destroy();
					//rabbitMQConnection.end();
				} // if
			});

			// -----------------------------------------------------------
			// Insert assembly metadata into Couchbase
			// -----------------------------------------------------------

			var metadataKey = 'ASSEMBLY_METADATA_' + assemblyId,
				assemblyMetadata = req.body.metadata,
				metadata = {
					assemblyId: assemblyId,
					userAssemblyId: req.body.name,
					datetime: assemblyMetadata.datetime,
					geography: assemblyMetadata.geography,
					source: assemblyMetadata.source
				};

			console.log('[WGST][Couchbase] Inserting assembly metadata with key: ' + metadataKey);
			console.dir(metadata);

			couchbaseDatabaseConnections[testWgstBucket].set(metadataKey, metadata, function(err, result) {
				if (err) {
					console.error('✗ [WGST][Couchbase][ERROR] ' + err);
					return;
				}

				console.log('[WGST][Couchbase] Inserted assembly metadata');

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

			// Prepare object to publish
			var assembly = {
				"speciesId" : "1280",
				"sequences" : req.body.assembly, // Content of FASTA file, might need to rename to sequences
				"assemblyId": assemblyId,
				"userAssemblyId" : userAssemblyId,
				"taskId" : "Experiment_1",
				"collectionId": collectionId
			};

			console.log('[WGST][RabbitMQ] Uploading assembly ' + assemblyId + ' to collection ' + collectionId);

			// Publish message
			rabbitMQExchanges[rabbitMQExchangeNames.UPLOAD].publish('upload', assembly, { 
				mandatory: true,
				contentType: 'application/json',
				deliveryMode: 1,
				correlationId: 'Art', // Generate UUID?
				replyTo: uploadQueueId
			}, function(err){
				if (err) {
					console.error('✗ [WGST][RabbitMQ][ERROR] Error when trying to publish to upload exchange');
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

					var buffer = new Buffer(message.data),
						bufferJSON = buffer.toString(),
						parsedMessage = JSON.parse(bufferJSON);

					console.log('[WGST][RabbitMQ] Received message from upload queue:');
					console.dir(parsedMessage);
				});
		});
};

exports.get = function(req, res) {
	console.log('[WGST] Requested assembly id: ' + req.params.id);

	couchbaseDatabaseConnections[testWgstBucket].get(req.params.id, function(err, result) {
		if (err) throw err;

		var assembly = result.value;

		console.dir(assembly);

		res.render('index', { requestedAssemblyObject: JSON.stringify(assembly) });
	});
};

var generateStQueryKey = function(alleles) {

	// Prepare ST query key
	// 'ST_' + species id + allele ids
	var stQueryKey = 'ST_1280',
		alleleId;

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
	couchbaseDatabaseConnections[testWgstResourcesBucket].get(stQueryKey, function(error, stData) {
		if (error) {
			if (error.code === 13) {
				console.log('! [WGST][Warning] No such ST key found: ' + stQueryKey);
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
	couchbaseDatabaseConnections[testWgstResourcesBucket].getMulti(stQueryKeys, {}, function(error, stData) {

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
	var alleleQueryKey,
		mlstAllelesQueryKeys = [];

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

		var mlstAlleleValue,
			mlstAllele,
			locusId;

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
	var mlstAlleleValue,
		mlstAllele,
		locusId;

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
	var scoresQueryKey = 'FP_COMP_' + assemblyId,
		metadataQueryKey = 'ASSEMBLY_METADATA_' + assemblyId,
		resistanceProfileQueryKey = 'PAARSNP_RESULT_' + assemblyId,
		mlstQueryKey = 'MLST_RESULT_' + assemblyId;
		//coreQueryKey = 'CORE_RESULT_' + assemblyId;	

	//var assemblyQueryKeys = [scoresQueryKey, metadataQueryKey, resistanceProfileQueryKey, mlstQueryKey, coreQueryKey];
	var assemblyQueryKeys = [scoresQueryKey, metadataQueryKey, resistanceProfileQueryKey, mlstQueryKey];

	console.log('[WGST] Assembly ' + assemblyId + ' query keys: ');
	console.dir(assemblyQueryKeys);

	// ------------------------------------------
	// Query assembly data
	// ------------------------------------------
	couchbaseDatabaseConnections[testWgstBucket].getMulti(assemblyQueryKeys, {}, function(error, assemblyData) {
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

			console.log('>>>> assemblyKey: ' + assemblyKey); //LLL

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

			// var mlstAlleleValue,
			// 	mlstAllele,
			// 	locusId;

			// // Check if any MLST alleles data returned
			// if (Object.keys(mlstAlleles).length > 0) {
			// 	// Parse MLST alleles data
			// 	for (mlstAllele in mlstAlleles) {
			// 		if (mlstAlleles.hasOwnProperty(mlstAllele)) {
			// 			// Get value object from query result object
			// 			mlstAlleleValue = mlstAlleles[mlstAllele].value;
			// 			// Get locus id from value object
			// 			locusId = mlstAlleleValue.locusId;
			// 			// Add allele value object to assembly object
			// 			assembly.MLST_RESULT.alleles[locusId] = mlstAlleleValue;
			// 		} // if
			// 	} // for				
			// } // if
			addMlstAlleleToAssembly(assembly, mlstAlleles);

			// console.log('Looking for this');
			// console.log(assembly.MLST_RESULT.alleles);

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
			throw error;
		}

		// Get list of all antibiotics
		exports.getAllAntibiotics(function(error, antibiotics){
			if (error) {
				throw error;
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
	couchbaseDatabaseConnections[testWgstResourcesBucket].getMulti(queryKeys, {}, function(error, mlstAllelesData) {
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
	couchbaseDatabaseConnections[testWgstBucket].getMulti(assemblyIdQueryKeys, {}, function(error, results) {
		console.log('[WGST][Couchbase] Got assemblies data:');
		//console.log(results);

		if (error) {
			throw error;
		}

		// ---------------------------------------------
		// Merge assembly data into one assembly object
		// ---------------------------------------------
		var assemblies = {},
			assemblyId,
			cleanAssemblyId;

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
		var assemblyId,
			assembly,
			assemblyMlstAllelesQueryKeys = [],
			allAssembliesMlstAllelesQueryKeys = [],
			mlstAllelesQueryKeysToAssemblyMap = {};

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
				throw error;
			}

			// Group mlst alleles data by assembly id
			// ---------------------------------------------------------
			// Group mlst alleles data by assembly id
			// Example:
			// { 'a4bb3c91-2d8b-43fd-87e8-64501b3de82c' : { 'MLST_1280_ySUwgFjEbIx5XpoyomFs+W3poI0=': { cas: [Object], flags: 0, value: [Object] },
			// 												'MLST_1280_uS1ci2t4E82d/sCVd6k2OC+3nw0=': { cas: [Object], flags: 0, value: [Object] }}
			// ---------------------------------------------------------
			var mlstAlleleQueryKey,
				assemblyIdsWithMlstAlleleQueryKey,
				assemblyIdWithMlstAlleleQueryKey,
				assemblyIdToMlstAllelesDataMap = {};

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

			var allelesData = [],
				assemblyId,
				assembly;

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

			var stQueryKeys = [],
				stQueryKey,
				assemblyAllelesData,
				stQueryKeyToAssemblyIdMap = {};

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

				var stQuery,
					stData,
					st,
					assemblyId,
					assembly,
					assemblyIds;

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

		if (error) throw error;

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

	couchbaseDatabaseConnections[testWgstBucket].getMulti(resistanceProfileQueryKeys, {}, function(error, results) {
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
		if (error) throw error;

		res.json(antibiotics);
	});
};

exports.getAllAntibiotics = function(callback) {
	console.log('[WGST] Getting list of all antibiotics');

	// Get list of all antibiotics
	couchbaseDatabaseConnections[testWgstResourcesBucket].get('ANTIMICROBIALS_ALL', function(error, result) {
		if (error) {
			callback(error, result);
			return;
		}

		var antibiotics = result.value.antibiotics;

		console.log('[WGST] Got the list of all antibiotics');

		callback(null, antibiotics);
	});
};