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

	})();

});