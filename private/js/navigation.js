$(function(){

	$('.wgst-navigation__collection-data').on('click', function(event) {
		console.debug('wgst-navigation-item__collection-data');

		window.WGST.openPanel('collection');
		event.preventDefault();
	});

	$('.wgst-navigation__collection-tree').on('click', function(event) {
		console.debug('wgst-navigation-item__collection-tree');
		console.debug('Opened collection id: ' + WGST.collection.opened);

		window.WGST.openPanel('collectionTree__' + WGST.collection.opened + '__CORE_TREE_RESULT');
		event.preventDefault();
	});

	$('.wgst-navigation__collection-map').on('click', function(event) {
		console.debug('wgst-navigation-item__collection-map');

		window.WGST.openPanel('map');
		event.preventDefault();
	});

});