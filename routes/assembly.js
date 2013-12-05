
/*
 * GET users listing.
 */

exports.add = function(req, res) {

	var uuid = require('node-uuid');

	// TODO: Validate request

	// Call RabbitMQ

	var amqp = require('amqp'),
		connection = amqp.createConnection({
			host: '129.31.26.152', //'fi--didewgstcn1',
			port: 5672
		}, {
			reconnect: false
		});

	connection.on('error', function(error) {
	    console.error("[MLST][ERROR] Ignoring error: " + error);
	});

	connection.on("ready", function(){

		console.log('[MLST] Connection is ready');

		var queueId = uuid.v4(),
			exchange = connection.exchange('wgst-ex', {
				type: 'direct',
				passive: true
			}, function(exchange) {
				console.log('[MLST] Exchange "' + exchange.name + '" is open');
			});

		console.log('[MLST] Assembly file content: ' + req.body.assembly.substr(0, 50) + '...');
		console.log('[MLST] User assembly id: ' + req.body.name);

		// TODO: Prepare object to publish
		var demo = {
			"speciesId" : "1280",
			"sequences" : req.body.assembly, // Content of FASTA file, might need to rename to sequences
			"userAssemblyId" : req.body.name,
			"taskId" : "Experiment_1"
		};

		// Publish message
		exchange.publish('upload', demo, { 
			mandatory: true,
			contentType: 'application/json',
			deliveryMode: 1,
			correlationId: 'Art', // Generate UUID?
			replyTo: queueId
		}, function(err){
			if (err) {
				console.log('[MLST][ERROR] Error in trying to publish');
				return; // return undefined?
			}

			console.log('[MLST] Message was published');

		});

		connection
			.queue(queueId, { // Create queue
				exclusive: true
			}, function(queue){

				console.log('[MLST] Queue "' + queue.name + '" is open');

			}) // Subscribe to response message
			.subscribe(function(message, headers, deliveryInfo){
			
				console.log('[MLST] Received response');

				var buffer = new Buffer(message.data);

				console.log(buffer.toString());

				// TODO: Insert id into db

				// Return result data
				res.json(buffer.toString());

				// End connection, however in reality it's being dropped before it's ended so listen for error too
				connection.end();

			});
	});
};

// TODO: Return fingerprint data
exports.get = function(req, res) {

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
	}

	res.json(assembly);

};