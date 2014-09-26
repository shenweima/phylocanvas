$(function(){

	(function(){

		window.WGST.exports.showSidebar = function() {
			//$('.wgst-sidebar').removeClass('wgst--hide-this');
			$('[data-wgst-sidebar]').removeClass('wgst--hide-this');
		};

		window.WGST.exports.hideSidebar = function() {
			//$('.wgst-sidebar').addClass('wgst--hide-this');
			$('[data-wgst-sidebar]').addClass('wgst--hide-this');
		};

	})();

});