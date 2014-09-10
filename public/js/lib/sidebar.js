$(function(){

	(function(){

		window.WGST.exports.createHidable = function(hidableId, hidableLabel) {

        	//
        	// Check if hidable already exists
        	//
        	if ($('.wgst-hidable[data-hidable-id="' + hidableId + '"]').length > 0) {
        		return;
        	}

            var templateId = 'hidable',
            	templateContext = {
            		hidableId: hidableId,
            		hidableLabel: hidableLabel
            	},
                hidableTemplateSource = $('.wgst-template[data-template-id="' + templateId + '"]').html(),
                hidableTemplate = Handlebars.compile(hidableTemplateSource),
                hidableHtml = hidableTemplate(templateContext);

            $('.wgst-hidables').prepend(hidableHtml);
		};

		window.WGST.exports.removeHidable = function(hidableId) {
        	$('.wgst-hidable[data-hidable-id="' + hidableId + '"]').remove();
        };

        window.WGST.exports.hidablePanelShown = function(panelId) {
        	$('.wgst-hidable[data-hidable-id="' + panelId + '"]')
        		.find('.wgst-hidable-panel')
        		.find('.fa-square-o')
        		.removeClass('fa-square-o')
        		.addClass('fa-square');
        };

        window.WGST.exports.hidablePanelHidden = function(panelId) {
        	$('.wgst-hidable[data-hidable-id="' + panelId + '"]')
        		.find('.wgst-hidable-panel')
        		.find('.fa-square')
        		.removeClass('fa-square')
        		.addClass('fa-square-o');
        };

        window.WGST.exports.hidablePanelRemoved = function(panelId) {
        	window.WGST.exports.hidablePanelHidden(panelId);
        };

        $('body').on('mouseenter', '.wgst-hidable', function() {

        	console.log('mouseenter');

        	var hidableId = $(this).attr('data-hidable-id');

        	//
        	// Show hidable controls
        	//
        	$(this).find('.wgst-hidable-toggle').addClass('hide-this');
        	$(this).find('.wgst-hidable-controls').removeClass('hide-this');

        	//
        	// Bring panel to front
        	//
        	window.WGST.exports.bringPanelToFront(hidableId);
        });

        $('body').on('mouseleave', '.wgst-hidable', function() {

        	console.log('mouseleave');

        	var hidableId = $(this).attr('data-hidable-id');

        	//
        	// Show hidable label
        	//
        	$(this).find('.wgst-hidable-controls').addClass('hide-this');
        	$(this).find('.wgst-hidable-toggle').removeClass('hide-this');
        });

        $('body').on('click', '.wgst-hidable-panel', function(event){

        	var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

        	//
        	// Check if fullscreen exists
        	//
        	if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

        		window.WGST.exports.bringFullscreenToPanel(hidableId);

        	//
        	// Fullscreen doesnt exist
        	// 
        	} else {

        		//
        		// Toggle panel
        		//
        		window.WGST.exports.togglePanel(hidableId);

        	}

        	event.preventDefault();
        });

        $('body').on('click', '.wgst-hidable-fullscreen', function(event){

        	var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

        	//
        	// Check if panel exists
        	//
        	if ($('.wgst-panel[data-panel-id="' + hidableId + '"]').length > 0) {

        		//
        		// Maximize panel
        		//
        		window.WGST.exports.maximizePanel(hidableId);

        	}

        	event.preventDefault();
        });

	})();

});