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
                //noFullscreenButton: true
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
                noCloseButton: true
            }
        };

        window.WGST.exports.createPanel = function(panelType, templateContext) {
            console.log('createPanel()');
            console.log('panelType:' + panelType);
            console.dir(templateContext);

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
            $.extend(templateContext, window.WGST.exports.mapPanelTypeToPanelButtonRules[panelType]);

            //
            // Get container's label
            //
            if (typeof templateContext.panelLabel === 'undefined') {

                //templateContext.panelLabel = templateContext.assemblyUserId;
                templateContext.panelLabel = window.WGST.exports.getContainerLabel({
                    containerName: 'panel', 
                    containerType: panelType,
                    containerId: templateContext.panelId,
                    additional: templateContext
                    //containerContext: templateContext
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
            // Notify hidable
            //
            window.WGST.exports.happenedCreatePanel({
                panelId: templateContext.panelId,
                panelLabel: templateContext.panelLabel
            });
        };

        window.WGST.exports.removePanel = function(panelId) {
        	$('.wgst-panel[data-panel-id="' + panelId + '"]').remove();

            //
            // Notify hidable
            //
            window.WGST.exports.happenedRemovePanel(panelId);

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
            window.WGST.exports.happenedShowPanel(panelId);
        };

        window.WGST.exports.hidePanel = function(panelId) {
        	//$('.wgst-panel[data-panel-id="' + panelId + '"]').addClass('wgst--hide-this wgst--invisible-this');
            $('.wgst-panel[data-panel-id="' + panelId + '"]').addClass('wgst--invisible-this');

        	//
        	// Update hidable state
        	//
        	window.WGST.exports.happenedHidePanel(panelId);
        };

        window.WGST.exports.isPanelExists = function(panelId) {
            if ($('.wgst-panel[data-panel-id="' + panelId + '"]').length > 0) {
                return true;
            } else {
                return false;
            }
        };

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

            console.log('Test');

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

        $('body').on('click', '[data-panel-header-control-button="fullscreen"]', function(){
            var $panel = $(this).closest('.wgst-panel'),
                panelId = $panel.attr('data-panel-id');

                console.log('X');
                console.log('panelId: ' + panelId);

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

	})();

});