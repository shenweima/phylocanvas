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

exports.apiGetDownloadAssemblyMetadata = function(req, res, next) {
	var assemblyId = req.params.id;
	var metadataFormat = req.params.format;

	console.log('[WGST] Getting assembly ' + assemblyId + ' metadata for download in ' + metadataFormat + ' format');

	var assemblyController = require('./assembly');

	assemblyController.getMetadata(assemblyId, function(error, assemblyMetadata){
		if (error) {
			res.send(500);
			return;
		}

		//
		// Check format
		//

		// CSV
		//
		if (metadataFormat === 'csv') {
			// Convert to CSV
			//
			var BabyParse = require('babyparse');
			assemblyMetadataCsv = BabyParse.unparse(assemblyMetadata);

			// Send data
			//
			res.setHeader('Content-disposition', 'attachment; filename=assembly_metadata_' + assemblyId + '.csv');
			res.setHeader('Content-type', 'text/csv');
			res.charset = 'UTF-8';
			res.write(assemblyMetadataCsv);
			res.end();

		// JSON (default)
		//
		} else {

			// Send data
			//
			res.setHeader('Content-disposition', 'attachment; filename=assembly_metadata_' + assemblyId + '.json');
			res.setHeader('Content-type', 'text/json');
			res.charset = 'UTF-8';
			res.write(JSON.stringify(assemblyMetadata, null, 4));
			res.end();
		}
	});
};