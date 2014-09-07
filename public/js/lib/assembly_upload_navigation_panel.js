$(function(){

	(function(){

	    $('body').on('change', '.wgst-dropped-assembly-list', function(){
	    	var selectedAssemblyFileId = $(this).val();
	    	window.WGST.exports.showAssemblyUpload(selectedAssemblyFileId);
	    });

	    $('body').on('click', '.wgst-dropped-assembly-list-navigation-button__previous', function(){
	    	window.WGST.exports.showPreviousAssemblyUpload();
	    });

	    $('body').on('click', '.wgst-dropped-assembly-list-navigation-button__next', function(){
	    	window.WGST.exports.showNextAssemblyUpload();
	    });

	    window.WGST.exports.showPreviousAssemblyUpload = function() {
	       	var $previousOption = $('.wgst-dropped-assembly-list option:selected').prev();
	        if ($previousOption.length) {
	        	$previousOption.prop('selected', 'selected').change();
	        }
	    };

	    window.WGST.exports.showNextAssemblyUpload = function() {
	        var $nextOption = $('.wgst-dropped-assembly-list option:selected').next();
	        if ($nextOption.length) {
	        	$nextOption.prop('selected', 'selected').change();
	        }
	    };

	    window.WGST.exports.showAssemblyUpload = function(assemblyFileId) {

	    	if (typeof assemblyFileId === 'undefined') {
	    		return false;
	    	}

	    	console.log('assemblyFileId: ' + assemblyFileId);

	    	window.WGST.exports.showAssemblyUploadAnalytics(assemblyFileId);
	    	window.WGST.exports.showAssemblyUploadMetadata(assemblyFileId);



	        // $('.wgst-upload-assembly__analytics').hide();
	        // $('.wgst-upload-assembly__analytics[data-file-uid="' + assemblyFileId + '"]').show();
	        // $('.wgst-upload-assembly__metadata').hide();
	        // $('.wgst-upload-assembly__metadata[data-file-uid="' + assemblyFileId + '"]').show();

	        //
	        // Quite an elegant way of finding object by it's property value in array
	        //
	        // var loadedFile = window.WGST.dragAndDrop.loadedFiles.filter(function(loadedFile) {
	        //     return loadedFile.uid === assemblyFileId; // filter out appropriate one
	        // })[0];

	        // // Set file name in metadata panel title
	        // $('.wgst-panel__assembly-upload-metadata .header-title small').text(loadedFile.file.name);

	        // // Set file name in analytics panel title
	        // $('.wgst-panel__assembly-upload-analytics .header-title small').text(loadedFile.file.name);
	    
	        // // Set file name in navigator
	        // $('.assembly-file-name').text(loadedFile.file.name);
	    };

	})();

});