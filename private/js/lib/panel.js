$(function(){

	(function(){

        window.WGST.exports.mapPanelTypeToTemplateId = {
        	'assembly': 'assembly-panel',
            'collection-data': 'collection-data-panel',
            'collection-tree': 'collection-tree-panel',
            'collection-map': 'collection-map-panel',
            'assembly-upload-navigation': 'assembly-upload-navigation-panel',
            'assembly-upload-metadata': 'assembly-upload-metadata-panel',
            'assembly-upload-analytics': 'assembly-upload-analytics-panel',
            'assembly-upload-progress': 'assembly-upload-progress-panel'
        };

        window.WGST.exports.createPanel = function(panelType, templateContext) {

        	//
        	// Check if panel already exists
        	//
        	if ($('.wgst-panel[data-panel-id="' + templateContext.panelId + '"]').length > 0) {

        		//
        		// Show panel
        		//
        		window.WGST.exports.showPanel(templateContext.panelId);

        		return;
        	}

        	//
        	// Get panel's label
        	//
            templateContext.panelLabel = templateContext.assemblyUserId;


        	templateContext.panelLabel = window.WGST.exports.getContainerLabel({
        		containerName: 'panel', 
        		containerType: panelType,
        		containerId: templateContext.panelId,
                containerContext: templateContext
        	});

        	//
        	// Render
        	//
            var templateId = window.WGST.exports.mapPanelTypeToTemplateId[panelType],
                panelTemplateSource = $('.wgst-template[data-template-id="' + templateId + '"]').html(),
                panelTemplate = Handlebars.compile(panelTemplateSource),
                panelHtml = panelTemplate(templateContext);

            $('.wgst-workspace').prepend(panelHtml);

        	var $panel = $('.wgst-panel[data-panel-id="' + templateContext.panelId + '"]');

        	//
        	// Init jQuery UI draggable interaction
        	//
	        $panel.draggable({
	            handle: $panel.find('.wgst-draggable-handle'),
	            appendTo: ".wgst-page__app",
	            scroll: false,
	            stop: function(event, ui) {
	                // // Store current panel position
	                // var panelName = ui.helper.attr('data-panel-name');
	                // WGST.panels[panelName].top = ui.position.top;
	                // WGST.panels[panelName].left = ui.position.left;
	            }
	        });

	        //
	        // Create hidable
	        //
	        window.WGST.exports.createHidable(templateContext.panelId, templateContext.panelLabel);
        };

        window.WGST.exports.removePanel = function(panelId) {
        	$('.wgst-panel[data-panel-id="' + panelId + '"]').remove();

        	//
        	// Update hidable state
        	//
        	window.WGST.exports.hidablePanelRemoved(panelId);
        };

        window.WGST.exports.showPanel = function(panelId) {
        	$('.wgst-panel[data-panel-id="' + panelId + '"]').removeClass('hide-this invisible-this');

        	//
        	// Update hidable state
        	//
        	window.WGST.exports.hidablePanelShown(panelId);
        };

        window.WGST.exports.hidePanel = function(panelId) {
        	$('.wgst-panel[data-panel-id="' + panelId + '"]').addClass('hide-this');

        	//
        	// Update hidable state
        	//
        	window.WGST.exports.hidablePanelHidden(panelId);
        };

        // window.WGST.exports.hideAllPanels = function() {
        // 	$('.wgst-panel').addClass('hide-this');

        // 	//
        // 	// Update hidable state
        // 	//
        // 	window.WGST.exports.hidablePanelHidden(panelId);
        // };

        window.WGST.exports.togglePanel = function(panelId) {
        	var $panel = $('.wgst-panel[data-panel-id="' + panelId + '"]');

    		//
    		// Toggle panel
    		//
    		if ($panel.is('.hide-this, .invisible-this')) {

        		//
        		// Show panel
        		//
        		window.WGST.exports.showPanel(panelId);

    		} else {

        		//
        		// Hide panel
        		//
        		window.WGST.exports.hidePanel(panelId);

    		}
        };

	    window.WGST.exports.bringPanelToFront = function(panelId) {
	        var zIndexHighest = 0;

	        $('.wgst-panel').each(function(){
	            var zIndexCurrent = parseInt($(this).css('zIndex'), 10);
	            if (zIndexCurrent > zIndexHighest) {
	                zIndexHighest = zIndexCurrent;
	            }
	        });

	        $('[data-panel-id="' + panelId + '"]').css('zIndex', zIndexHighest + 1);
	    };

	    window.WGST.exports.maximizePanel = function(panelId) {

	        var fullscreenId = $('.wgst-fullscreen').attr('data-fullscreen-id');

	        //
	        // Bring fullscreen into panel
	        //
	        window.WGST.exports.bringFullscreenToPanel(fullscreenId);

	        //
	        // Bring panel into fullscreen
	        //
	        window.WGST.exports.bringPanelToFullscreen(panelId);

	    };

	    window.WGST.exports.getContainerLabel = function(options) {

            //
            //
	    	//
	    	// Options:
	    	//
	    	// containerName: "panel" or "fullscreen"
	    	// containerType: panelType or fullscreenType
	    	// containerId: panelId or fullscreenId
            // containerContext: context object specific to container
	    	//
	    	//
	    	//

	    	console.debug('getContainerLabel:');
        	console.dir(options);

        	var containerLabel = 'Anonymous';

        	//
        	// Prepare container's label
        	//
        	if (options.containerType === 'collection-data') {

        		containerLabel = 'Data';

        	} else if (options.containerType === 'collection-map') {

        		containerLabel = 'Map';

        	} else if (options.containerType === 'collection-tree') {

        		var treeType = options.containerId.split('__')[2];

        		containerLabel = treeType.replace(/[_]/g, ' ').toLowerCase().capitalize();

        	} else if (options.containerType === 'assembly') {

        		containerLabel = options.containerContext.assemblyUserId; // 'Assembly';

        	} else if (options.containerType === 'assembly-upload-progress') {

                containerLabel = 'Assembly Upload';

            } else if (options.containerType === 'assembly-upload-metadata') {

                containerLabel = 'Assembly Metadata';

            } else if (options.containerType === 'assembly-upload-analytics') {

                containerLabel = 'Assembly Analytics';

            } else if (options.containerType === 'assembly-upload-navigation') {

                containerLabel = 'Collection Navigation';

            }

        	return containerLabel;
	    };

		$('body').on('click', '.wgst-panel-control-button__close', function(){
			var panel = $(this).closest('.wgst-panel'),
				panelId = panel.attr('data-panel-id');

			window.WGST.exports.hidePanel(panelId);
		});

		//
	    // Bring to front selected panel
	    //
	    $('body').on('mousedown', '.wgst-panel', function(){
	        window.WGST.exports.bringPanelToFront($(this).attr('data-panel-id'));
	    });

        $('body').on('click', '.wgst-panel-control-button__maximize', function(){

	        //
	        // Bring fullscreen to panel
	        //
	        var $fullscreen = $('.wgst-fullscreen');
	        var fullscreenId = $fullscreen.attr('data-fullscreen-id');
	        var panelId = fullscreenId;

	        window.WGST.exports.bringFullscreenToPanel(fullscreenId);

	        //
	        // Bring panel to fullscreen
	        //
	        var $panel = $(this).closest('.wgst-panel');
	        var panelId = $panel.attr('data-panel-id');
	        var fullscreenId = panelId;

	        window.WGST.exports.bringPanelToFullscreen(panelId, fullscreenId);

        });

	})();

});