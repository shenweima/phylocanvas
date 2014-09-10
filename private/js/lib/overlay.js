$(function(){

	(function(){

        window.WGST.exports.mapOverlayTypeToTemplateId = {
        	'feedback': 'feedback-overlay'
        };

        window.WGST.exports.createOverlay = function(overlayType, templateContext) {

        	//
        	// Check if overlay already exists
        	//
        	if ($('.wgst-overlay[data-overlay-id="' + overlayType + '"]').length > 0) {
        		return;
        	}

        	//
        	// Check if template context was passed
        	//
        	if (typeof templateContext === 'undefined') {
        		templateContext = {};
        	}

            var templateId = window.WGST.exports.mapOverlayTypeToTemplateId[overlayType],
                overlayTemplateSource = $('.wgst-template[data-template-id="' + templateId + '"]').html(),
                overlayTemplate = Handlebars.compile(overlayTemplateSource),
                overlayHtml = overlayTemplate(templateContext);

            $('.wgst-page__app').prepend(overlayHtml);
        };

        window.WGST.exports.removeOverlay = function(overlayId) {
        	$('.wgst-overlay[data-overlay-id="' + overlayId + '"]').remove();
        };

        $('body').on('click', '.wgst-close-overlay', function(event){
        	var overlayId = $(this).closest('.wgst-overlay').attr('data-overlay-id');

        	window.WGST.exports.removeOverlay(overlayId);

        	event.preventDefault();
        });














  //       window.WGST.exports.showOverlay = function(overlayId) {
  //       	$('.wgst-overlay[data-overlay-id="' + overlayId + '"]').removeClass('hide-this invisible-this');
  //       };

  //       window.WGST.exports.hidePanel = function(panelId) {
  //       	$('.wgst-panel[data-panel-id="' + panelId + '"]').addClass('hide-this');
  //       };

	 //    window.WGST.exports.bringPanelToTop = function(panelId) {
	 //        var zIndexHighest = 0;

	 //        $('.wgst-panel').each(function(){
	 //            var zIndexCurrent = parseInt($(this).css('zIndex'), 10);
	 //            if (zIndexCurrent > zIndexHighest) {
	 //                zIndexHighest = zIndexCurrent;
	 //            }
	 //        });

	 //        $('[data-panel-id="' + panelId + '"]').css('zIndex', zIndexHighest + 1);
	 //    };

		// $('body').on('click', '.wgst-panel-control-button__close', function(){
		// 	var panel = $(this).closest('.wgst-panel'),
		// 		panelId = panel.attr('data-panel-id');

		// 	window.WGST.exports.hidePanel(panelId);
		// });

		// //
	 //    // Bring to front selected panel
	 //    //
	 //    $('body').on('mousedown', '.wgst-panel', function(){
	 //        window.WGST.exports.bringPanelToTop($(this).attr('data-panel-id'));
	 //    });

  //       $('body').on('click', '.wgst-panel-control-button__maximize', function(){

	 //        //
	 //        // Bring fullscreen to panel
	 //        //
	 //        var $fullscreen = $('.wgst-fullscreen');
	 //        var fullscreenId = $fullscreen.attr('data-fullscreen-id');
	 //        var panelId = fullscreenId;

	 //        window.WGST.exports.bringFullscreenToPanel(fullscreenId, panelId);

	 //        //
	 //        // Bring panel to fullscreen
	 //        //
	 //        var $panel = $(this).closest('.wgst-panel');
	 //        var panelId = $panel.attr('data-panel-id');
	 //        var fullscreenId = panelId;

	 //        window.WGST.exports.bringPanelToFullscreen(panelId, fullscreenId);

  //       });

	})();

});