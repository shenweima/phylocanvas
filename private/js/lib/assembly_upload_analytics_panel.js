$(function(){

	(function(){

		window.WGST.exports.showAssemblyUploadAnalytics = function(assemblyFileId) {
			$('.wgst-panel__assembly-upload-analytics .wgst-upload-assembly__analytics').addClass('wgst--hide-this');
			$('.wgst-panel__assembly-upload-analytics .wgst-upload-assembly__analytics[data-assembly-file-id="' + assemblyFileId + '"]').removeClass('wgst--hide-this');

			//
			// Set file name in panel's header
			//
			$('.wgst-panel__assembly-upload-analytics header').find('small').text(assemblyFileId);
		};

	})();

});