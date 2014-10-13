$(function(){

	(function(){

		//
		//
		//
		// Model
		//
		//
		//

		window.WGST.exports.setAssemblyMetadata = function(options) {

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
			var sourceAssemblyMetadata = window.WGST.upload.fastaAndMetadata[sourceAssemblyFileId].metadata;

			Object.keys(sourceAssemblyMetadata).map(function(metadataKey){

				window.WGST.exports.setAssemblyMetadata({
					assemblyFileId: targetAssemblyFileId,
					assemblyMetadataKey: metadataKey,
					assemblyMetadataValue: sourceAssemblyMetadata[metadataKey]
				});
			});
		};

		window.WGST.exports.copyAssemblyMetadataToAssembliesWithNoMetadata = function(sourceAssemblyFileId) {
			//
			// Iterate over each assembly metadata
			//
			Object.keys(window.WGST.upload.fastaAndMetadata).map(function(targetAssemblyFileId) {

				var targetAssemblyMetadata = window.WGST.upload.fastaAndMetadata[targetAssemblyFileId].metadata;

	        	//
	            // Only copy metadata to assemblies with no metadata
	            //
				if (Object.keys(targetAssemblyMetadata).length === 0) {
					//
					// Copy assembly metadata
					//
					window.WGST.exports.copyAssemblyMetadata(sourceAssemblyFileId, targetAssemblyFileId);
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
			var assemblyFileId = options.assemblyFileId,
				assemblyMetadataKey = options.assemblyMetadataKey,
				assemblyMetadataValue = options.assemblyMetadataValue;

			if (assemblyMetadataKey === 'datetime') {

                //
                // Update date input
                //
                setAssemblyMetadataTimestamp(source.assemblyFileId, targetAssemblyFileId);

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