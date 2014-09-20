//
// http://stackoverflow.com/a/7592235
//
String.prototype.capitalize = function() {
	return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

//
// Email regex
//
window.WGST.regex = window.WGST.regex || {};
window.WGST.regex.EMAIL = /^(([^<>()[]\.,;:s@"]+(.[^<>()[]\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;

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
    if ($('.wgst-panel[data-panel-id="' + containerId + '"]').length > 0) {

    	return 'panel';

    //
    // Fullscreen
    //
    } else if ($('.wgst-fullscreen[data-fullscreen-id="' + containerId + '"]').length > 0) {

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