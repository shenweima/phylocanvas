$(function(){

	(function(){

		//
		//
		//
		// Model
		//
		//
		//

		window.WGST.exports.setAssemblyMetadataValue = function(options) {

			var assemblyFileId = options.assemblyFileId,
				assemblyMetadataKey = options.assemblyMetadataKey,
				assemblyMetadataValue = options.assemblyMetadataValue;

			if (assemblyMetadataKey === 'datetime') {

                //
                // Set datetime
                //
				window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.datetime = assemblyMetadataValue;

			} else if (assemblyMetadataKey === 'geography') {

                //
                // Set geography
                //
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography = {
                    address: '',
                    position: {
                        latitude: '',
                        longitude: ''
                    },
                    type: ''
                };
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.address = assemblyMetadataValue.address;
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.position.latitude = assemblyMetadataValue.position.latitude;
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.position.longitude = assemblyMetadataValue.position.longitude;
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.type = assemblyMetadataValue.type;

			} else if (assemblyMetadataKey === 'source') {

                //
                // Copy source
                //
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.source = assemblyMetadataValue;

	        }

			//
			// Notify view
			//
			window.WGST.exports.happenedSetAssemblyMetadata(options);
		};

		window.WGST.exports.copyAssemblyMetadata = function(sourceAssemblyFileId, targetAssemblyFileId) {

			//
			// For performance improvements and maintenance - store assembly metadata in a variable
			//
			var sourceAssemblyMetadata = window.WGST.upload.fastaAndMetadata[sourceAssemblyFileId].metadata;

			//
			// Copy each metadata object property
			//
			Object.keys(sourceAssemblyMetadata).map(function(metadataKey) {
				//
				// Set assembly metadata's value
				//
				window.WGST.exports.setAssemblyMetadataValue({
					assemblyFileId: targetAssemblyFileId,
					assemblyMetadataKey: metadataKey,
					assemblyMetadataValue: sourceAssemblyMetadata[metadataKey]
				});
			});
		};

		window.WGST.exports.copyAssemblyMetadataToAssembliesWithNoMetadata = function(sourceAssemblyFileId) {

			var fastaAndMetadata = window.WGST.upload.fastaAndMetadata;

			//
			// Iterate over each assembly metadata
			//
			Object.keys(fastaAndMetadata).map(function(targetAssemblyFileId) {

				var targetAssemblyMetadata = fastaAndMetadata[targetAssemblyFileId].metadata;

	        	//
	            // Only copy metadata to assemblies with no metadata
	            //
				if (Object.keys(targetAssemblyMetadata).length === 0) {
					//
					// Copy assembly metadata
					//

					//
					// Copy model
					//
					window.WGST.exports.copyAssemblyMetadata(sourceAssemblyFileId, targetAssemblyFileId);

					//
					// Copy view
					//
					window.WGST.exports.copyAssemblyMetadataView(sourceAssemblyFileId, targetAssemblyFileId);
				}
			});
		};

		//
		//
		//
		// View
		//
		//
		//

		window.WGST.exports.happenedSetAssemblyMetadata = function(options) {

			return;

			var assemblyFileId = options.assemblyFileId,
				assemblyMetadataKey = options.assemblyMetadataKey,
				assemblyMetadataValue = options.assemblyMetadataValue;

			if (assemblyMetadataKey === 'datetime') {

                //
                // Update date input
                //
                window.WGST.exports.setAssemblyMetadataTimestamp(source.assemblyFileId, targetAssemblyFileId);

			} else if (assemblyMetadataKey === 'geography') {

                //
                // Set geography
                //
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography = {
                    address: '',
                    position: {
                        latitude: '',
                        longitude: ''
                    },
                    type: ''
                };
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.address = assemblyMetadataValue.address;
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.position.latitude = assemblyMetadataValue.position.latitude;
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.position.longitude = assemblyMetadataValue.position.longitude;
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.type = assemblyMetadataValue.type;

			} else if (assemblyMetadataKey === 'source') {

                //
                // Copy source
                //
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.source = assemblyMetadataValue;

	        }
		};

	})();

});