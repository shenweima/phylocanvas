$(function(){

	(function(){

	    window.WGST.exports.isAssemblyAnalyticsExists = function(assemblyFileId) {
	    	if ($('.wgst-upload-assembly__analytics[data-assembly-file-id="' + assemblyFileId + '"]').length === 0) {
	    		return false;
	    	} else {
	    		return true;
	    	}
	    };	    

	    window.WGST.exports.renderAssemblyAnalytics = function(assemblyFileId, analytics) {
	    	//
	    	// Do not render assembly analytics if it's already rendered
	    	//
	    	if (window.WGST.exports.isAssemblyAnalyticsExists(assemblyFileId)) {
	    		return;
	    	}

	    	var totalNumberOfNucleotidesInDnaStrings = analytics.totalNumberOfNucleotidesInDnaStrings,
	    		totalNumberOfContigs = analytics.totalNumberOfContigs,
	    		smallestNumberOfNucleotidesInDnaStrings = analytics.smallestNumberOfNucleotidesInDnaStrings,
	    		averageNumberOfNucleotidesInDnaStrings = analytics.averageNumberOfNucleotidesInDnaStrings,
	    		biggestNumberOfNucleotidesInDnaStrings = analytics.biggestNumberOfNucleotidesInDnaStrings,
	    		contigN50 = analytics.contigN50;

	        //
	        // 
	        // Render dropped assembly analytics
	        //
	        //
	        var droppedAssemblyAnalyticsContext = {
	            assemblyFileId: assemblyFileId,
	            // Print a number with commas as thousands separators
	            // http://stackoverflow.com/a/2901298
	            totalNumberOfNucleotidesInDnaStrings: totalNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            totalNumberOfContigs: totalNumberOfContigs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            smallestNumberOfNucleotidesInDnaStrings: smallestNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            averageNumberOfNucleotidesInDnaStrings: averageNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            biggestNumberOfNucleotidesInDnaStrings: biggestNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            contigN50: contigN50.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	        };

	        var droppedAssemblyAnalyticsTemplateHtml = $('.wgst-template[data-template-id="droppedAssemblyAnalytics"]').html();
	        var droppedAssemblyAnalyticsTemplate = Handlebars.compile(droppedAssemblyAnalyticsTemplateHtml);
	        var droppedAssemblyAnalyticsHtml = droppedAssemblyAnalyticsTemplate(droppedAssemblyAnalyticsContext);

	        $('.wgst-assembly-upload__analytics ul').append($(droppedAssemblyAnalyticsHtml));
	    };

	})();

});