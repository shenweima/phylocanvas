$(function(){

	$('.wgst-navigation__collection-panels').on('click', function(event) {
		event.preventDefault();
	});

	//
	// Data
	//

	$('.wgst-navigation__collection-data').on('click', function(event) {
		console.debug('wgst-navigation-item__collection-data');

		window.WGST.openPanel('collection');
		event.preventDefault();
	});

	//
	// Close data
	// 

	$('.wgst-navigation__close-collection-data').on('click', function(event){
		console.debug('wgst-navigation__close-collection-data');

		$('[data-panel-name="collection"] .wgst-panel-control-button__close').trigger('click');
		event.preventDefault();
	});

	//
	// Tree
	//

	$('.wgst-navigation__collection-tree').on('click', function(event) {
		console.debug('wgst-navigation-item__collection-tree');
		console.debug('Opened collection id: ' + WGST.collection.opened);

		window.WGST.openPanel('collectionTree__' + WGST.collection.opened + '__CORE_TREE_RESULT');
		event.preventDefault();
	});

	//
	// Close tree
	//

	$('.wgst-navigation__close-collection-tree').on('click', function(event){
		console.debug('wgst-navigation__close-collection-tree');

		$('[data-panel-id="' + 'collectionTree__' + WGST.collection.opened + '__CORE_TREE_RESULT' + '"] .wgst-panel-control-button__close').trigger('click');
		event.preventDefault();
	});

	//
	// Map
	//

	$('.wgst-navigation__collection-map').on('click', function(event) {
		console.debug('wgst-navigation-item__collection-map');

		window.WGST.openPanel('map');
		event.preventDefault();
	});

	//
	// Close map
	// 

	$('.wgst-navigation__close-collection-map').on('click', function(event){
		console.debug('wgst-navigation__close-collection-map');

		$('[data-panel-name="map"] .wgst-panel-control-button__close').trigger('click');
		event.preventDefault();
	});

});