$(function(){

	(function(){
	    $('body').on('click', '.wgst-dropped-assembly-list-navigation-button__previous', function(){
	    	showPreviousAssembly();
	    });
	    $('body').on('click', '.wgst-dropped-assembly-list-navigation-button__next', function(){
	    	showNextAssembly();
	    });
	    var showPreviousAssembly = function() {
	       	var $previousOption = $('.wgst-dropped-assembly-list option:selected').prev();
	        if ($previousOption.length) {
	        	$previousOption.prop('selected', 'selected').change();
	        }
	    };
	    var showNextAssembly = function() {
	        var $nextOption = $('.wgst-dropped-assembly-list option:selected').next();
	        if ($nextOption.length) {
	        	$nextOption.prop('selected', 'selected').change();
	        }
	    };

	    $('.wgst-dropped-assembly-list').on('change', function(){
	    	console.log('Assembly changed!');

	    	var selectedAssemblyFileId = $(this).val();
	    	showDroppedAssembly(selectedAssemblyFileId);
	    });

	    var showDroppedAssembly = function(assemblyFileId) {

	    	if (typeof assemblyFileId === 'undefined') {
	    		return false;
	    	}

	        $('.wgst-upload-assembly__analytics').hide();
	        $('.wgst-upload-assembly__analytics[data-file-uid="' + assemblyFileId + '"]').show();
	        $('.wgst-upload-assembly__metadata').hide();
	        $('.wgst-upload-assembly__metadata[data-file-uid="' + assemblyFileId + '"]').show();

	        //
	        // Quite an elegant way of finding object by it's property value in array
	        //
	        var loadedFile = window.WGST.dragAndDrop.loadedFiles.filter(function(loadedFile) {
	            return loadedFile.uid === assemblyFileId; // filter out appropriate one
	        })[0];

	        // Set file name in metadata panel title
	        $('.wgst-panel__assembly-upload-metadata .header-title small').text(loadedFile.file.name);

	        // Set file name in analytics panel title
	        $('.wgst-panel__assembly-upload-analytics .header-title small').text(loadedFile.file.name);
	    
	        // Set file name in navigator
	        $('.assembly-file-name').text(loadedFile.file.name);
	    };

	    window.WGST.exports.showDroppedAssembly = showDroppedAssembly;
	})();

});