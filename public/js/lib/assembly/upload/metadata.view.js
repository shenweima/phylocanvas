$(function(){

	(function(){

	    window.WGST.exports.isAssemblyMetadataFormExists = function(assemblyFileId) {
	    	if ($('.wgst-upload-assembly__metadata[data-assembly-file-id="' + assemblyFileId + '"]').length === 0) {
	    		return false;
	    	} else {
	    		return true;
	    	}
	    };	    

	    window.WGST.exports.renderAssemblyMetadataForm = function(assemblyFileId) {
	    	//
	    	// Do not render assembly metadata form if it's already rendered
	    	//
	    	if (window.WGST.exports.isAssemblyMetadataFormExists(assemblyFileId)) {
	    		return;
	    	}

	        //
	        // 
	        // Render date
	        //
	        //
	        var droppedAssemblyMetadataFormContext = {
	            assemblyFileId: assemblyFileId,
	            listOfYears: window.WGST.exports.generateYears(1940, 2014),
	            listOfMonths: window.WGST.exports.generateMonths(),
	            listOfDays: window.WGST.exports.generateDays()
	        };

	        //console.debug('droppedAssemblyMetadataFormContext:');
	        //console.dir(droppedAssemblyMetadataFormContext);

	        var droppedAssemblyMetadataFormTemplateHtml = $('.wgst-template[data-template-id="droppedAssemblyMetadataForm"]').html();
	        var droppedAssemblyMetadataFormTemplate = Handlebars.compile(droppedAssemblyMetadataFormTemplateHtml);
	        var droppedAssemblyMetadataFormHtml = droppedAssemblyMetadataFormTemplate(droppedAssemblyMetadataFormContext);

	        $('.wgst-assembly-upload__metadata ul').append($(droppedAssemblyMetadataFormHtml));
	    };

	    window.WGST.exports.renderAssemblyMetadataDateForm = function(assemblyFileId) {
	    	//
	    	// Do not render assembly metadata form if it's already rendered
	    	//
	    	if (window.WGST.exports.isAssemblyMetadataFormExists(assemblyFileId)) {
	    		return;
	    	}

	        //
	        // 
	        // Render date
	        //
	        //
	        var droppedAssemblyMetadataFormContext = {
	            assemblyFileId: assemblyFileId,
	            listOfYears: window.WGST.exports.generateYears(1940, 2014),
	            listOfMonths: window.WGST.exports.generateMonths(),
	            listOfDays: window.WGST.exports.generateDays()
	        };

	        //console.debug('droppedAssemblyMetadataFormContext:');
	        //console.dir(droppedAssemblyMetadataFormContext);

	        var droppedAssemblyMetadataFormTemplateHtml = $('.wgst-template[data-template-id="droppedAssemblyMetadataForm"]').html();
	        var droppedAssemblyMetadataFormTemplate = Handlebars.compile(droppedAssemblyMetadataFormTemplateHtml);
	        var droppedAssemblyMetadataFormHtml = droppedAssemblyMetadataFormTemplate(droppedAssemblyMetadataFormContext);

	        $('.wgst-assembly-upload__metadata ul').append($(droppedAssemblyMetadataFormHtml));
	    };

		window.WGST.exports.copyAssemblyMetadataView = function(sourceAssemblyFileId, targetAssemblyFileId) {
	        //
	        //
	        // Update UI
	        //
	        //
	        var $assemblyUploadMetadataPanel = $('.wgst-panel__assembly-upload-metadata');
	        var $targetAssemblyMetadata = $assemblyUploadMetadataPanel.find('.wgst-upload-assembly__metadata[data-assembly-file-id="' + targetAssemblyFileId + '"]');

	        //
	        // Update date input
	        //
	        window.WGST.exports.copyAssemblyMetadataTimestamp(sourceAssemblyFileId, targetAssemblyFileId);

	        //
	        // Copy same metadata to all assemblies with no metadata
	        //
	        var $sourceAssemblyMetadata = $assemblyUploadMetadataPanel.find('.wgst-upload-assembly__metadata[data-assembly-file-id="' + sourceAssemblyFileId + '"]');
	            $sourceAssemblyMetadataLocation = $sourceAssemblyMetadata.find('.assembly-sample-location-input'),
	            $sourceAssemblyMetadataSource = $sourceAssemblyMetadata.find('.assembly-sample-source-input');

	        //
	        // Update location input
	        //
	        $targetAssemblyMetadata.find('.assembly-sample-location-input').val($sourceAssemblyMetadataLocation.val());
	        
	        //
	        // Update source input
	        //
	        $targetAssemblyMetadata.find('.assembly-sample-source-input').val($sourceAssemblyMetadataSource.val());
	        
	        //
	        // Show all metadata blocks
	        //
	        $('.wgst-upload-assembly__metadata[data-assembly-file-id="' + targetAssemblyFileId + '"] .wgst-assembly-metadata-block').removeClass('wgst--hide-this');
		};

	})();

});