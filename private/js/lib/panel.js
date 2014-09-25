$(function(){

	(function(){

        window.WGST.exports.mapPanelTypeToPanelHeaderTemplateId = {
            'assembly': 'panel-header__assembly',
            'collection-data': 'panel-header__collection-data',
            'collection-tree': 'panel-header__collection-tree',
            'collection-map': 'panel-header__collection-map',
            'assembly-upload-metadata': 'panel-header__assembly-upload-metadata',
            'assembly-upload-navigation': 'panel-header__assembly-upload-navigation',
            'assembly-upload-analytics': 'panel-header__assembly-upload-analytics',
            'assembly-upload-progress': 'panel-header__assembly-upload-progress'
        };

        window.WGST.exports.mapPanelTypeToPanelBodyTemplateId = {
            'assembly': 'panel-body__assembly',
            'collection-data': 'panel-body__collection-data',
            'collection-tree': 'panel-body__collection-tree',
            'collection-map': 'panel-body__collection-map',
            'assembly-upload-metadata': 'panel-body__assembly-upload-metadata',
            'assembly-upload-navigation': 'panel-body__assembly-upload-navigation',
            'assembly-upload-analytics': 'panel-body__assembly-upload-analytics',
            'assembly-upload-progress': 'panel-body__assembly-upload-progress'
        };

        window.WGST.exports.mapPanelTypeToPanelButtonRules = {
            'assembly': {
                noFullscreenButton: true
            },
            'collection-data': {
                noCloseButton: true
            },
            'collection-tree': {
                //noFullscreenButton: true,
                noCloseButton: true
            },
            'collection-map': {
                noCloseButton: true
            },
            'assembly-upload-metadata': {
                noFullscreenButton: true,
                noCloseButton: true
            },
            'assembly-upload-navigation': {
                noFullscreenButton: true,
                noCloseButton: true
            },
            'assembly-upload-analytics': {
                noFullscreenButton: true,
                noCloseButton: true
            },
            'assembly-upload-progress': {
                noFullscreenButton: true,
                noCloseButton: true
            }
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

                //
                // And do nothing else
                //
        		return;
        	}

            //
            // Extend template context with panel button rules
            //
            templateContext = $.extend(templateContext, window.WGST.exports.mapPanelTypeToPanelButtonRules[panelType]);

            if (typeof templateContext.panelLabel === 'undefined') {
                //
                // Get panel's label
                //
                //templateContext.panelLabel = templateContext.assemblyUserId;
                templateContext.panelLabel = window.WGST.exports.getContainerLabel({
                    containerName: 'panel', 
                    containerType: panelType,
                    containerId: templateContext.panelId,
                    containerContext: templateContext
                });
            }

        	//
        	// Render
        	//
            var //templateId = window.WGST.exports.mapPanelTypeToTemplateId[panelType],
                panelTemplateSource = $('.wgst-template[data-template-id="panel"]').html(),
                panelTemplate = Handlebars.compile(panelTemplateSource);


            //
            // Panel's header
            //
            var panelHeaderTemplateId = window.WGST.exports.mapPanelTypeToPanelHeaderTemplateId[panelType];
            Handlebars.registerPartial('header', $('.wgst-template[data-template-id="' + panelHeaderTemplateId + '"]').html());

            //
            // Panel's body
            //
            var panelBodyTemplateId = window.WGST.exports.mapPanelTypeToPanelBodyTemplateId[panelType];
            Handlebars.registerPartial('body', $('.wgst-template[data-template-id="' + panelBodyTemplateId + '"]').html());

            //
            // Html
            //
            var panelHtml = panelTemplate(templateContext);
            $('.wgst-workspace').prepend(panelHtml);

        	//
        	// Init jQuery UI draggable interaction
        	//
            var $panel = $('.wgst-panel[data-panel-id="' + templateContext.panelId + '"]');

	        $panel.draggable({
	            handle: $panel.find('.wgst-draggable-handle'),
	            appendTo: ".wgst-page__app",
	            scroll: false//,
	            //stop: function(event, ui) {
	                // // Store current panel position
	                // var panelName = ui.helper.attr('data-panel-name');
	                // WGST.panels[panelName].top = ui.position.top;
	                // WGST.panels[panelName].left = ui.position.left;
	            //}
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

            if (panelId === 'collection-map') {

                //
                // Remove map
                //
                window.WGST.geo.map.remove();
            }
        };

        window.WGST.exports.showPanel = function(panelId) {
        	$('.wgst-panel[data-panel-id="' + panelId + '"]').removeClass('wgst--hide-this wgst--invisible-this');

            // if (panelId === 'collection-map') {
            //     google.maps.event.trigger(window.WGST.geo.map.canvas, 'resize');
            // }

        	//
        	// Update hidable state
        	//
        	//window.WGST.exports.hidablePanelShown(panelId);
            window.WGST.exports.happenedShowPanel(panelId);
        };

        window.WGST.exports.hidePanel = function(panelId) {
        	//$('.wgst-panel[data-panel-id="' + panelId + '"]').addClass('wgst--hide-this wgst--invisible-this');
            $('.wgst-panel[data-panel-id="' + panelId + '"]').addClass('wgst--invisible-this');

        	//
        	// Update hidable state
        	//
            //window.WGST.exports.hidablePanelHidden(panelId);
        	window.WGST.exports.happenedHidePanel(panelId);
        };

        window.WGST.exports.isPanelExists = function(panelId) {
            if ($('.wgst-panel[data-panel-id="' + panelId + '"]').length > 0) {
                return true;
            } else {
                return false;
            }
        };

        // window.WGST.exports.hideAllPanels = function() {
        // 	$('.wgst-panel').addClass('wgst--hide-this');

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
    		if ($panel.is('.wgst--hide-this, .wgst--invisible-this')) {

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
            window.WGST.exports.bringContainerToFront('panel', panelId);
	    };

	    window.WGST.exports.maximizePanel = function(panelId) {

	        var fullscreenId = $('.wgst-fullscreen').attr('data-fullscreen-id');

	        //
	        // Bring fullscreen into panel
	        //
	        window.WGST.exports.bringFullscreenToPanel(fullscreenId);

            //
            // Hide panel
            //
            window.WGST.exports.hidePanel(fullscreenId);

	        //
	        // Bring panel into fullscreen
	        //
	        window.WGST.exports.bringPanelToFullscreen(panelId);

            google.maps.event.trigger(window.WGST.geo.map.canvas, 'resize');

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

        		containerLabel = options.containerContext.assemblyUserId; // 'Assembly';

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

        $('body').on('click', '[data-panel-header-control-button="fullscreen"]', function(){
            var $panel = $(this).closest('.wgst-panel'),
                panelId = $panel.attr('data-panel-id');

            $('[data-hidable-id="' + panelId + '"]').find('[data-wgst-hidable-button="fullscreen"]').trigger('click');

        });

		$('body').on('click', '[data-panel-header-control-button="close"]', function(){
			var $panel = $(this).closest('.wgst-panel'),
				panelId = $panel.attr('data-panel-id');

            $('[data-hidable-id="' + panelId + '"]').find('[data-wgst-hidable-button="close"]').trigger('click');

		});

        $('body').on('click', '[data-panel-header-control-button="hide"]', function(){
            var $panel = $(this).closest('.wgst-panel'),
                panelId = $panel.attr('data-panel-id');

            $('[data-hidable-id="' + panelId + '"]').find('[data-wgst-hidable-button="hide"]').trigger('click');

        });

		//
	    // Bring to front selected panel
	    //
	    $('body').on('mousedown', '.wgst-panel', function(){
	        window.WGST.exports.bringPanelToFront($(this).attr('data-panel-id'));
	    });

        // $('body').on('click', '.wgst-panel-control-button__maximize', function(){

	       //  //
	       //  // Bring fullscreen to panel
	       //  //
	       //  var $fullscreen = $('.wgst-fullscreen');
	       //  var fullscreenId = $fullscreen.attr('data-fullscreen-id');
	       //  var panelId = fullscreenId;

	       //  window.WGST.exports.bringFullscreenToPanel(fullscreenId);

	       //  //
	       //  // Bring panel to fullscreen
	       //  //
	       //  var $panel = $(this).closest('.wgst-panel');
	       //  var panelId = $panel.attr('data-panel-id');
	       //  var fullscreenId = panelId;

	       //  window.WGST.exports.bringPanelToFullscreen(panelId, fullscreenId);

        // });

	})();

});