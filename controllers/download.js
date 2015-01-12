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
			console.error(danger(error));
			console.error(danger(assemblyMetadata));
			res.status(500).send('Internal Server Error');
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