$(function(){

	(function(){

        //
        // Download assembly metadata in JSON format
        //
        $('body').on('click', '[data-wgst-download-assembly-metadata-json]', function(event) {
            console.debug('[WGST] Downloading assembly metadata in JSON format');

        });

        //
        // Download assembly metadata in CSV format
        //
        $('body').on('click', '[data-wgst-download-assembly-metadata-csv]', function() {
            console.debug('[WGST] Downloading assembly metadata in CSV format');
        });

	})();

});