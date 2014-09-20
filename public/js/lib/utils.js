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