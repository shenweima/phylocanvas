$(function(){

	(function(){

        window.WGST.exports.showBackground = function(backgroundId) {
            $('[data-wgst-background-id="' + backgroundId + '"]').removeClass('wgst--hide-this');

            // $('[data-wgst-background-id="' + backgroundId + '"]').fadeIn('slow', function(){
            //     $(this).removeClass('wgst--hide-this');
            // });
        };

        window.WGST.exports.hideBackground = function(backgroundId) {
            $('[data-wgst-background-id="' + backgroundId + '"]').addClass('wgst--hide-this');

            // $('[data-wgst-background-id="' + backgroundId + '"]').fadeOut('slow', function(){
            //     $(this).addClass('wgst--hide-this');
            // });
        };

	})();

});