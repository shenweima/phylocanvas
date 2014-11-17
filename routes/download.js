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