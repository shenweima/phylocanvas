window.WGST = window.WGST || {};

$(function() {

	if (! window.chrome) {
		//$('.wgst-landing-buttons').hide();
		$('.wgst-chrome-only').removeClass('wgst--hide-this');
	}

});