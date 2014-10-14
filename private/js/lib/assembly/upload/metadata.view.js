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
	        // Render dropped assembly metadata form
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

	})();

});