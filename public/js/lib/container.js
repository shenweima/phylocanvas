$(function(){

	(function(){

		window.WGST.exports.isContainerExists = function(containerId) {
			//
			// Figure out container's type
			//

			//
			// Panel
			//
			if (window.WGST.exports.isPanelExists(containerId)) {
				return true;

			//
			// Fullscreen
			//
			} else if (window.WGST.exports.isFullscreenExists(containerId)) {
				return true;
			}

			return false;
		};

		//
		// Get container type
		//
		window.WGST.exports.getContainerType = function(containerId) {
		    //
		    // Panel or fullscreen?
		    //

		    //
		    // Panel
		    //
		    if (window.WGST.exports.isPanelExists(containerId)) {

		    	return 'panel';

		    //
		    // Fullscreen
		    //
		    } else if (window.WGST.exports.isFullscreenExists(containerId)) {

		    	return 'fullscreen';

		   	//
		   	// Unknown
		   	//
		    } else {

		    	return 'unknown';
		    }
		};

		//
		// Bring container to front
		//
		window.WGST.exports.bringContainerToFront = function(containerType, containerId) {

		    //
		    // Calculate the highest z index
		    //
		    var zIndexHighest = 0,
		        zIndexCurrent;

		    $('.wgst-panel, .wgst-fullscreen').each(function(){
		        zIndexCurrent = parseInt($(this).css('z-index'), 10);

		        if (zIndexCurrent >= zIndexHighest) {
		            zIndexHighest = zIndexCurrent;
		            $(this).css('z-index', zIndexHighest - 1);
		        }
		    });

		    //
		    // Panel
		    //
		    if (containerType === 'panel') {
		        $('[data-panel-id="' + containerId + '"]').css('z-index', zIndexHighest);

		    //
		    // Fullscreen
		    //
		    } else if (containerType === 'fullscreen') {
		        $('[data-fullscreen-id="' + containerId + '"]').css('z-index', zIndexHighest);

		    }
		};

		window.WGST.exports.removeContainer = function(containerId) {
			//
			// Figure out container's type
			//

			//
			// Panel
			//
			if (window.WGST.exports.getContainerType(containerId) === 'panel') {
				window.WGST.exports.removePanel(containerId);

			//
			// Fullscreen
			//
			} else if (window.WGST.exports.getContainerType(containerId) === 'fullscreen') {
				window.WGST.exports.removeFullscreen(containerId);
			}
		};

	})();

});