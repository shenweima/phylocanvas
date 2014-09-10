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