$(function(){

	(function(){

        window.WGST.exports.mapFullscreenIdToTemplateId = {
            'collection-map': 'collection-map-fullscreen',
            'collection-data': 'collection-data-fullscreen'
        };

        window.WGST.exports.mapFullscreenIdToPanelType = {
            'collection-map': 'collection-map',
            'collection-data': 'collection-data'
        };

        window.WGST.exports.createFullscreen = function(fullscreenId, templateContext) {
            //
            // Check if fullscreen already exists
            //
            if ($('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').length > 0) {
                return;
            }

            console.debug('*** fullscreenId: ' + fullscreenId);

            var fullscreenTemplateId = window.WGST.exports.mapFullscreenIdToTemplateId[fullscreenId];

            console.debug('*** fullscreenTemplateId: ' + fullscreenTemplateId);

                var fullscreenTemplateSource = $('.wgst-template[data-template-id="' + fullscreenTemplateId + '"]').html(),
                fullscreenTemplate = Handlebars.compile(fullscreenTemplateSource),
                fullscreenHtml = fullscreenTemplate(templateContext);

            $('.wgst-page__app').prepend(fullscreenHtml);
        };

        window.WGST.exports.removeFullscreen = function(fullscreenId) {
            $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').remove();
        };

        window.WGST.exports.showFullscreen = function(fullscreenId) {
            $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').removeClass('hide-this invisible-this');
        };

        window.WGST.exports.bringFullscreenToPanel = function(fullscreenId, panelId, panelWasCreated) {
            //
            // Check if fullscreen exists
            //
            if ($('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').length === 0) {
                return;
            }

            //
            // Create panel
            //
            var panelType = panelId.split('__')[0],
                collectionId = panelId.split('__')[1],
                fullscreenType = panelType;

            console.debug('bringFullscreenToPanel | fullscreenType: ' + fullscreenType);
            console.debug('bringFullscreenToPanel | fullscreenId: ' + fullscreenId);
            console.debug('bringFullscreenToPanel | panelId: ' + panelId);
            console.debug('bringFullscreenToPanel | panelType: ' + panelType);
            console.debug('bringFullscreenToPanel | collectionID: ' + collectionId);

            window.WGST.exports.createPanel(panelType, {
                panelId: panelId,
                panelType: panelType,
                collectionId: collectionId
            });

            //
            // Allow to move content from fullscreen to panel before you remove fullscreen
            //
            if (typeof panelWasCreated !== 'undefined') {
                panelWasCreated();
            }

            //
            // If fullscreen is map
            //
            if (fullscreenType === 'collection-map') {

                //
                // Copy map content to panel
                //
                $('.wgst-panel[data-panel-id="' + panelId + '"]')
                    .find('.wgst-panel-body-content')
                    .html('')
                    .append(window.WGST.geo.map.canvas.getDiv());
            }

            //
            // Remove fullscreen
            //
            window.WGST.exports.removeFullscreen(fullscreenId);

            //
            // Show panel
            //
            window.WGST.exports.showPanel(panelId);
            
            //
            // Bring panel to front
            //
            window.WGST.exports.bringPanelToTop(panelId);
        };

        window.WGST.exports.bringPanelToFullscreen = function(panelId, fullscreenWasCreated) {
            
            var fullscreenType = panelId.split('__')[0];
            var fullscreenId = panelId;

            console.debug('[WGST] >>> Debug <<< fullscreenType: ' + fullscreenType);
            console.debug('[WGST] >>> Debug <<< fullscreenId: ' + fullscreenId);
            console.debug('[WGST] >>> Debug <<< panelId: ' + panelId);

            //
            // Check if fullscreen exists
            //
            if ($('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').length > 0) {
                return;
            }

            //
            // Create fullscreen
            //
            window.WGST.exports.createFullscreen(fullscreenType, {
                fullscreenType: fullscreenType,
                fullscreenId: fullscreenId
            });

            //
            // Call custom function after creating fullscreen
            //
            if (typeof panelWasCreated !== 'undefined') {
                panelWasCreated();
            }

            //
            // Copy panel specific content
            //
            var panelType = $('.wgst-panel[data-panel-id="' + panelId + '"]').attr('data-panel-type'),
                $fullscreen = $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]');

            //
            // Data panel
            //
            if (panelType === 'collection-data') {
                var $collectionDataContent = $('.wgst-panel[data-panel-id="' + panelId + '"]').find('.collection-details');
                $fullscreen.append($collectionDataContent.clone(true));
            
            //
            // Map panel
            //
            } else if (panelType === 'collection-map') {

                //
                // Copy map content to panel
                //
                $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                    .find('.wgst-map')
                    .append(window.WGST.geo.map.canvas.getDiv());

                // $('.wgst-panel[data-panel-id="' + panelId + '"]')
                //     .find('.wgst-panel-body-content')
                //     .html('')
                //     .append(window.WGST.geo.map.canvas.getDiv());


                // var $collectionDataContent = $('.wgst-panel[data-panel-id="' + panelId + '"]').find('.collection-details');
                // $fullscreen.append($collectionDataContent.clone(true));
            }

            //
            // Show fullscreen
            //
            window.WGST.exports.showFullscreen(fullscreenId);

            //
            // Remove panel
            //
            window.WGST.exports.removePanel(panelId);
        };
















        var __old__bringFullscreenToPanel = function(andShowPanel, callback) {
            var activeFullscreenElement = $('.wgst-fullscreen--active'),
                fullscreenName = activeFullscreenElement.attr('data-fullscreen-name');

            activeFullscreenElement
                .removeClass('wgst-fullscreen--active')
                .removeClass('wgst-fullscreen--visible');

            if (typeof fullscreenName !== 'undefined') {
                if (andShowPanel) {
                    showPanelBodyContent(fullscreenName);
                    showPanel(fullscreenName);
                }
            }

            if (fullscreenName === 'map') {
                $('.wgst-panel[data-panel-name="' + fullscreenName + '"] .wgst-panel-body-content')
                    .html('')
                    .append(WGST.geo.map.canvas.getDiv());

                //google.maps.event.trigger(WGST.geo.map.canvas, 'resize');
            } // if

            // Remove fullscreen content
            activeFullscreenElement.html('');

            if (typeof callback === 'function') {
                callback();
            }
        };

        var __old__bringPanelToFullscreen = function(panelId, callback) {
            var panel = $('[data-panel-id="' + panelId + '"]'),
                panelName = panel.attr('data-panel-name');

            //$('.wgst-fullscreen__' + panelName)
            var fullscreen = $('[data-fullscreen-name="' + panelName + '"]')
                .addClass('wgst-fullscreen--active')
                .addClass('wgst-fullscreen--visible');

            if (panelName === 'collection') {
                fullscreen.append($('.collection-details').clone(true));
            }

            deactivatePanel(panelName); // or closePanel() ?

            if (typeof callback === 'function') {
                callback();
            }
        };

	})();

});