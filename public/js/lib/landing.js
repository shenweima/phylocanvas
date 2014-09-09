$(function() {

	if (! window.chrome) {
		//$('.wgst-landing-buttons').hide();
		$('.wgst-chrome-only').removeClass('hide-this');
	}

	$('.wgst-button__create-new-collection').on('click', function(){
		mixpanel.track("Create new collection");
	});

	$('.wgst-button__open-sample-collection').on('click', function(){
		mixpanel.track("Open sample collection");
	});

});