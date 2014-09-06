$(function(){

	(function(){

		// ----------------- New code ---------------------- //

        window.WGST.exports.mapPanelTypeToTemplateId = {
        	'assembly': 'assembly-panel',
            'collection-data': 'collection-data-panel',
            'collection-tree': 'collection-tree-panel',
            'collection-map': 'collection-map-panel',
            'assembly-upload-navigation': 'assembly-upload-navigation-panel',
            'assembly-upload-metadata': 'assembly-upload-metadata-panel',
            'assembly-upload-analytics': 'assembly-upload-analytics-panel'
        };

        window.WGST.exports.createPanel = function(panelType, templateContext) {

        	console.debug('window.WGST.exports.mapPanelTypeToTemplateId[panelType]: ' + window.WGST.exports.mapPanelTypeToTemplateId[panelType]);

            var templateId = window.WGST.exports.mapPanelTypeToTemplateId[panelType],
                panelTemplateSource = $('.wgst-template[data-template-id="' + templateId + '"]').html(),
                panelTemplate = Handlebars.compile(panelTemplateSource),
                panelHtml = panelTemplate(templateContext);

            $('.wgst-page__app').prepend(panelHtml);

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
        };

	    window.WGST.exports.bringPanelToTop = function(panelId) {
	        var zIndexHighest = 0;

	        $('.wgst-panel').each(function(){
	            var zIndexCurrent = parseInt($(this).css('zIndex'), 10);
	            if (zIndexCurrent > zIndexHighest) {
	                zIndexHighest = zIndexCurrent;
	            }
	        });

	        $('[data-panel-id="' + panelId + '"]').css('zIndex', zIndexHighest + 1);
	    };

		$('body').on('click', '.wgst-panel-control-button__close', function(){
			var panel = $(this).closest('.wgst-panel'),
				panelId = panel.attr('data-panel-id');

			console.debug(panelId);

			window.WGST.exports.togglePanel(panelId);

		    // if ($(this).hasClass('wgst-panel-control-button--active')) {
		    //     var panel = $(this).closest('.wgst-panel'),
		    //         panelName = panel.attr('data-panel-name');

		    //     deactivatePanel(panelName);

		    //     if (panelName === 'collection') {
		    //         //var collectionId = panel.attr('data-collection-id');
		    //         //closeCollection(collectionId);
		    //     } else if (panelName === 'representativeCollectionTree') {
		    //         var collectionId = panel.attr('data-collection-id');
		    //         deselectAllTreeNodes(collectionId);
		    //     }
		    // } // if
		});







		// ----------------- Old code ---------------------- //

	    window.WGST.exports.isPanelActive = function(panelName) {
	        var panelElement = $('[data-panel-name="' + panelName + '"]');

	        if (panelElement.hasClass('wgst-panel--active')) {
	            return true;
	        } else {
	            return false;
	        }
	    };

	    window.WGST.exports.isPanelVisible = function(panelName) {
	        var panelElement = $('[data-panel-name="' + panelName + '"]');

	        if (panelElement.hasClass('wgst-panel--visible')) {
	            return true;
	        } else {
	            return false;
	        }
	    };

	    window.WGST.exports.togglePanel = function(panelId, callback) {
	    	$('.wgst-panel[data-panel-id="' + panelId + '"').toggleClass('hide-this');
	    };

	    //
	    // Deprecate
	    //
	    window.WGST.exports.activatePanel = function(panelNames, callback) {
	    	return;

	        // Overwrite function
	        var activatePanel = function(panelName) {
	            var panel = $('[data-panel-name="' + panelName + '"]');

	            // Set position
	            panel.css('top', WGST.panels[panelName].top);
	            panel.css('left', WGST.panels[panelName].left);

	            // Activate, but don't show
	            panel.css('visibility', 'hidden');
	            //panel.fadeIn('fast');
	            panel.show();
	            panel.addClass('wgst-panel--active');
	        };

	        // Process multiple panels
	        if ($.isArray(panelNames)) {

	            var panelNameCounter = panelNames.length,
	                panelName;

	            for (;panelNameCounter !== 0;) {
	                panelNameCounter = panelNameCounter - 1;

	                panelName = panelNames[panelNameCounter];

	                activatePanel(panelName);
	            } // for

	        // Process single panel
	        } else {
	            activatePanel(panelNames);
	        }
	        // Callback
	        if (typeof callback === 'function') {
	            callback();
	        }
	    };

	    window.WGST.exports.deactivatePanel = function(panelNames, callback) {
	        // Overwrite function
	        var deactivatePanel = function(panelName) {
	            var panel = $('[data-panel-name="' + panelName + '"]'),
	                panelBodyContent = panel.find('.wgst-panel-body-content');

	            panel.hide();
	            panel.removeClass('wgst-panel--active');
	            panel.removeClass('wgst-panel--visible');
	        };

	        // Process multiple panels
	        if ($.isArray(panelNames)) {

	            var panelNameCounter = panelNames.length,
	                panelName;

	            for (;panelNameCounter !== 0;) {
	                panelNameCounter = panelNameCounter - 1;

	                panelName = panelNames[panelNameCounter];

	                deactivatePanel(panelName);
	            } // for

	        // Process single panel
	        } else {
	            deactivatePanel(panelNames);
	        }
	        // // Callback
	        // if (typeof callback === 'function') {
	        //     callback();
	        // }
	    };

	    window.WGST.exports.openPanel = function(panelName) {
	        if (isFullscreenActive(panelName)) {
	            bringFullscreenToPanel(true);
	        }

	        activatePanel(panelName);
	        endPanelLoadingIndicator(panelName);
	        showPanelBodyContent(panelName);
	        showPanel(panelName);
	        bringPanelToTop(panelName);
	    };

	    window.WGST.exports.showPanelBodyContent = function(panelNames) {
	        // Overwrite function
	        var showPanelBodyContent = function(panelName) {
	            var panelBodyContent = $('[data-panel-name="' + panelName + '"] .wgst-panel-body-content');
	            panelBodyContent.css('visibility', 'visible');
	        };

	        // Process multiple panels
	        if ($.isArray(panelNames)) {

	            var panelNameCounter = panelNames.length,
	                panelName;

	            for (;panelNameCounter !== 0;) {
	                panelNameCounter = panelNameCounter - 1;

	                panelName = panelNames[panelNameCounter];

	                showPanelBodyContent(panelName);
	            } // for

	        // Process single panel
	        } else {
	            showPanelBodyContent(panelNames);
	        }
	    };

	    window.WGST.exports.showPanel = function(panelNames) {
	        // Overwrite function
	        var showPanel = function(panelName) {
	            $('[data-panel-name="' + panelName + '"]')
	                .addClass('wgst-panel--visible')
	                .css('visibility', 'visible');
	        };

	        // Process multiple panels
	        if ($.isArray(panelNames)) {

	            var panelNameCounter = panelNames.length,
	                panelName;

	            for (;panelNameCounter !== 0;) {
	                panelNameCounter = panelNameCounter - 1;

	                panelName = panelNames[panelNameCounter];

	                showPanel(panelName);
	            } // for

	        // Process single panel
	        } else {
	            showPanel(panelNames);
	        }
	    };

	    window.WGST.exports.hidePanelBodyContent = function(panelNames) {
	        // Overwrite function
	        var hidePanelBodyContent = function(panelName) {
	            var panelBodyContent = $('[data-panel-name="' + panelName + '"] .wgst-panel-body-content');
	            panelBodyContent.css('visibility', 'hidden');
	        };

	        // Process multiple panels
	        if ($.isArray(panelNames)) {

	            var panelNameCounter = panelNames.length,
	                panelName;

	            for (;panelNameCounter !== 0;) {
	                panelNameCounter = panelNameCounter - 1;

	                panelName = panelNames[panelNameCounter];

	                hidePanelBodyContent(panelName);
	            } // for

	        // Process single panel
	        } else {
	            hidePanelBodyContent(panelNames);
	        }
	    };

	    window.WGST.exports.hidePanel = function(panelNames) {
	        // Overwrite function
	        var hidePanel = function(panelName) {
	            $('[data-panel-name="' + panelName + '"]').css('visibility', 'hidden');
	        };

	        // Process multiple panels
	        if ($.isArray(panelNames)) {

	            var panelNameCounter = panelNames.length,
	                panelName;

	            for (;panelNameCounter !== 0;) {
	                panelNameCounter = panelNameCounter - 1;

	                panelName = panelNames[panelNameCounter];

	                hidePanel(panelName);
	            } // for

	        // Process single panel
	        } else {
	            hidePanel(panelNames);
	        }
	    };

	    window.WGST.exports.startPanelLoadingIndicator = function(panelName) {
	        // Hide body content
	        // var panelBodyContent = $('[data-panel-name="' + panelName + '"] .wgst-panel-body-content');
	        // panelBodyContent.css('visibility', 'hidden');
	        // Show animated loading circle
	        var panelLoadingIndicator = $('[data-panel-name="' + panelName + '"] .wgst-panel-loading');
	        panelLoadingIndicator.show();
	    };

	    window.WGST.exports.endPanelLoadingIndicator = function(panelName) {
	        // Hide animated loading circle
	        var panelLoadingIndicator = $('[data-panel-name="' + panelName + '"] .wgst-panel-loading');
	        panelLoadingIndicator.hide();
	        // Show body content
	        // var panelBodyContent = $('[data-panel-name="' + panelName + '"] .wgst-panel-body-content');
	        // panelBodyContent.css('visibility', 'visible');
	    };

	    // Bring to front selected panel
	    $('body').on('mousedown', '.wgst-panel', function(){

	        window.WGST.exports.bringPanelToTop($(this).attr('data-panel-name'));

	        /*
	        // Change z index for all panels
	        $('.wgst-panel').css('z-index', 100);
	        // Set the  highest z index for this (selected) panel
	        $(this).css('z-index', 101);
	        */
	    });

	    //window.WGST.exports.showDroppedAssembly = showDroppedAssembly;
	})();

});