exports.createAssemblyMetadata = function(assemblyId, assemblyMetadata) {
	var fs = require('fs');

	// Write assembly metadata to file for download
	//
	fs.writeFile('./public/download/' + assemblyId + '.json', JSON.stringify(assemblyMetadata, null, 4), function(error) {
		if (error) {
			console.error('[WGST] Failed to write file: ' + error);
			return;
		}

		console.log('[WGST] Wrote metadata file for assembly '+ assemblyId);
	});
};

var flattenAssemblyMetadata = function(assemblyMetadata) {
	// Geography
	//
	assemblyMetadata.location = assemblyMetadata.geography.address;
	assemblyMetadata.latitude = assemblyMetadata.geography.position.latitude;
	assemblyMetadata.longitude = assemblyMetadata.geography.position.longitude;
	delete assemblyMetadata.geography;

	return assemblyMetadata;
};

var convertJsonToCsv = function(flatJson) {
	var BabyParse = require('babyparse');

	return BabyParse.unparse({
		fields: ['assemblyId', 'userAssemblyId', 'datetime', 'location', 'latitude', 'longitude', 'source'],
		data: [flatJson]
	});
};

exports.apiGetDownloadAssemblyMetadata = function(req, res, next) {
	var assemblyId = req.params.id;
	var metadataFormat = req.params.format;

	console.log('[WGST] Getting assembly ' + assemblyId + ' metadata for download in ' + metadataFormat + ' format');

	var assemblyController = require('./assembly');

	assemblyController.getAssemblyMetadata(assemblyId, function(error, assemblyMetadata) {
		if (error) {
			res.sendStatus(500);
			return;
		}

		//
		// Check format
		//

		// CSV
		//
		if (metadataFormat === 'csv') {
			console.log('[WGST] Returning CSV file');

			// Flatten assembly metadata JSON object
			//
			var flatAssemblyMetadata = flattenAssemblyMetadata(assemblyMetadata);

			// Convert JSON to CSV
			//
			var assemblyMetadataCsv = convertJsonToCsv(flatAssemblyMetadata);

			// Send data
			//
			res.setHeader('Content-disposition', 'attachment; filename=assembly_metadata_' + assemblyId + '.csv');
			res.send(assemblyMetadataCsv);

		// JSON (default)
		//
		} else {
			console.log('[WGST] Returning JSON file');

			// Send data
			//
			res.setHeader('Content-disposition', 'attachment; filename=assembly_metadata_' + assemblyId + '.json');
			res.send(JSON.stringify(assemblyMetadata, null, 4));
		}
	});
};