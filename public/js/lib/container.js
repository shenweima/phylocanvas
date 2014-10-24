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

		    //
		    // Find the highest z index
		    //
		    $('.wgst-panel, .wgst-fullscreen').each(function(){

		    	var $currentContainer = $(this);

		    	//
		    	// Get element's current z index
		    	//
		        zIndexCurrent = parseInt($currentContainer.css('z-index'), 10);

		        //
		        // Check if current z index is higher or equal to highest z index
		        //
		        if (zIndexCurrent >= zIndexHighest) {

		        	//
		        	// Set highest z index
		        	//
		            zIndexHighest = zIndexCurrent;

		            // //
		            // // Decrement current element's z index by one
		            // //
		            // $currentContainer.css('z-index', zIndexHighest - 1);
		        }
		    });

		    //
		    // Panel
		    //
		    if (containerType === 'panel') {

		    	//
		    	// Set container's z index to be the highest
		    	//
		        $('[data-panel-id="' + containerId + '"]').css('z-index', zIndexHighest + 1);

		    //
		    // Fullscreen
		    //
		    } else if (containerType === 'fullscreen') {

		    	//
		    	// Set container's z index to be the highest
		    	//
		        $('[data-fullscreen-id="' + containerId + '"]').css('z-index', zIndexHighest + 1);
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

        window.WGST.exports.extendContainerOptions = function(containerOptions, additionalContainerOptions) {
            $.extend(containerOptions, {
                additional: additionalContainerOptions
            });

            return containerOptions;
        };

	    window.WGST.exports.getContainerLabel = function(options) {
	    	console.log('getContainerLabel():');
	    	console.dir(options);

            //
            //
	    	//
	    	// Options:
	    	//
	    	// containerName: "panel" or "fullscreen"
	    	// containerType: panelType or fullscreenType
	    	// containerId: panelId or fullscreenId
            // additional: additional container options (specific to each container)
	    	//
	    	//
	    	//

        	var containerLabel = 'Anonymous';

        	//
        	// Prepare container's label
        	//
        	if (options.containerType === 'collection-data') {

        		containerLabel = 'Data';

        	} else if (options.containerType === 'collection-map') {

        		containerLabel = 'Map';

        	} else if (options.containerType === 'collection-tree') {

                containerLabel = 'Tree';

        		// var treeType = options.containerId.split('__')[2];
        		// containerLabel = treeType.replace(/[_]/g, ' ').toLowerCase().capitalize();

        	} else if (options.containerType === 'assembly') {

        		containerLabel = options.additional.assemblyUserId; // 'Assembly';

        	} else if (options.containerType === 'assembly-upload-progress') {

                containerLabel = 'Upload Progress';

            } else if (options.containerType === 'assembly-upload-metadata') {

                containerLabel = 'Assembly Metadata';

            } else if (options.containerType === 'assembly-upload-analytics') {

                containerLabel = 'Assembly Analytics';

            } else if (options.containerType === 'assembly-upload-navigation') {

                containerLabel = 'Collection Navigation';

            }

        	return containerLabel;
	    };

	})();

});