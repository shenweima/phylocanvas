$(function(){

	(function(){

        //
        // Download assembly metadata in JSON format
        //
        $('body').on('click', '[data-wgst-download-assembly-metadata-json]', function() {

            var assemblyId = $(this).attr('data-wgst-assembly-id');

            console.debug('[WGST] Downloading assembly metadata in JSON format ' + assemblyId);

            // Request download
            //
            $.ajax({
                type: 'GET',
                url: '/api/download/assembly/' + assemblyId + '/metadata/json',
                datatype: 'json'
            })
            .done(function(assemblyMetadata, textStatus, jqXHR) {
                console.log('[WGST] Got assembly metadata in JSON format');
                console.dir(assemblyMetadata);
            });
        });  

        //
        // Download assembly metadata in CSV format
        //
        $('body').on('click', '[data-wgst-download-assembly-metadata-csv]', function() {

            var assemblyId = $(this).attr('data-wgst-assembly-id');

            console.debug('[WGST] Downloading assembly metadata in CSV format ' + assemblyId);

            // Request download
            //
            $.ajax({
                type: 'GET',
                url: '/api/download/assembly/' + assemblyId + '/metadata/csv',
                datatype: 'json'
            })
            .done(function(assemblyMetadata, textStatus, jqXHR) {
                console.log('[WGST] Got assembly metadata in CSV format');
                console.dir(assemblyMetadata);
            });
        });      

        //
        // Download assembly metadata
        //
        $('body').on('click', '[data-wgst-download-metadata]', function() {

            var assemblyId = $(this).attr('data-wgst-assembly-id');

            console.debug('Downloading assembly metadata ' + assemblyId);

            // Request download
            //
            $.ajax({
                type: 'GET',
                url: '/api/download/assembly/' + assemblyId + '/metadata',
                datatype: 'json'
            })
            .done(function(assemblyMetadata, textStatus, jqXHR) {
                console.log('[WGST] Got assembly metadata');
                console.dir(assemblyMetadata);
            });
        });

	})();

});