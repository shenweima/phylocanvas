$(function(){

	(function(){

        window.WGST.exports.mapFullscreenTypeToTemplateId = {
            'collection-map': 'collection-map-fullscreen',
            'collection-data': 'collection-data-fullscreen',
            'collection-tree': 'collection-tree-fullscreen',
            'assembly-upload-progress': 'assembly-upload-progress-fullscreen',
            'assembly': 'assembly-fullscreen'
        };

        window.WGST.exports.mapFullscreenIdToPanelType = {
            'collection-map': 'collection-map',
            'collection-data': 'collection-data',
            'collection-tree': 'collection-tree'
        };

        window.WGST.exports.createFullscreen = function(fullscreenId, templateContext) {
            console.log('createFullscreen():');
            console.log(fullscreenId);
            console.dir(templateContext);

            //
            // Check if fullscreen already exists
            //
            if ($('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').length > 0) {
                return;
            }

            //
            // Check if template context was passed
            //
            if (typeof templateContext === 'undefined') {
                console.error('[WGST][Error] No template context were provided.');
                return;
            }

            //
            // Get container's label
            //
            var containerOptions = {
                containerName: 'fullscreen',
                containerType: templateContext.fullscreenType,
                containerId: fullscreenId 
            };

            if (containerOptions.containerType === 'assembly') {

                var additionalContainerOptions = {
                    assemblyUserId: 'AAA'
                };

                containerOptions = window.WGST.exports.extendContainerOptions(containerOptions, additionalContainerOptions);
            }

            templateContext.fullscreenLabel = window.WGST.exports.getContainerLabel(containerOptions);

            console.debug('templateContext.fullscreenType: ' + templateContext.fullscreenType);

            //
            // Render
            //
            var fullscreenTemplateId = window.WGST.exports.mapFullscreenTypeToTemplateId[templateContext.fullscreenType];

            console.debug('fullscreenTemplateId: ' + fullscreenTemplateId);
            console.log($('.wgst-template[data-template-id="' + fullscreenTemplateId + '"]').html());

            var fullscreenTemplateSource = $('.wgst-template[data-template-id="' + fullscreenTemplateId + '"]').html(),
                fullscreenTemplate = Handlebars.compile(fullscreenTemplateSource),
                fullscreenHtml = fullscreenTemplate(templateContext);

            $('.wgst-workspace').prepend(fullscreenHtml);

            //
            // Notify hidable
            //
            window.WGST.exports.happenedCreateFullscreen({
                fullscreenId: fullscreenId,
                fullscreenLabel: templateContext.fullscreenLabel
            });
        };

        window.WGST.exports.removeFullscreen = function(fullscreenId) {
            $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').remove();

            //
            // Update hidable state
            //
            window.WGST.exports.happenedRemoveFullscreen(fullscreenId);

            if (fullscreenId === 'collection-map') {

                //
                // Remove map
                //
                window.WGST.geo.map.remove();
            }
        };

        window.WGST.exports.showFullscreen = function(fullscreenId) {
            $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').removeClass('wgst--hide-this wgst--invisible-this');
        
            //
            // Update hidable state
            //
            window.WGST.exports.happenedShowFullscreen(fullscreenId);
        };

        window.WGST.exports.hideFullscreen = function(fullscreenId) {
            $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').addClass('wgst--hide-this wgst--invisible-this');
        
            //
            // Update hidable state
            //
            window.WGST.exports.happenedHideFullscreen(fullscreenId);
        };

        window.WGST.exports.isFullscreenExists = function(fullscreenId) {
            if ($('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').length > 0) {
                return true;
            } else {
                return false;
            }
        };

        window.WGST.exports.toggleFullscreen = function(fullscreenId) {

            var $fullscreen = $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]');

            //
            // Toggle fullscreen
            //
            if ($fullscreen.is('.wgst--hide-this, .wgst--invisible-this')) {

                //
                // Show fullscreen
                //
                window.WGST.exports.showFullscreen(fullscreenId);

            } else {

                //
                // Hide fullscreen
                //
                window.WGST.exports.hideFullscreen(fullscreenId);
            }
        };

        window.WGST.exports.bringFullscreenToFront = function(fullscreenId) {
            window.WGST.exports.bringContainerToFront('fullscreen', fullscreenId);
        };

        window.WGST.exports.bringFullscreenToBack = function(fullscreenId) {
            $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').css('z-index', 'auto');
        };

        window.WGST.exports.bringFullscreenToPanel = function(fullscreenId, panelWasCreated) {
            //
            // Check if fullscreen exists
            //
            if ($('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').length === 0) {
                return;
            }

            //
            // Create panel
            //
            var panelType = fullscreenId.split('__')[0],
                panelId = fullscreenId,
                collectionId = fullscreenId.split('__')[1],
                fullscreenType = panelType;

            // console.debug('[WGST][Debug] bringFullscreenToPanel | fullscreenType: ' + fullscreenType);
            // console.debug('[WGST][Debug] bringFullscreenToPanel | fullscreenId: ' + fullscreenId);
            // console.debug('[WGST][Debug] bringFullscreenToPanel | panelId: ' + panelId);
            // console.debug('[WGST][Debug] bringFullscreenToPanel | panelType: ' + panelType);
            // console.debug('[WGST][Debug] bringFullscreenToPanel | collectionID: ' + collectionId);

            // var panelContext = {
            //     panelId: panelId,
            //     panelType: panelType,
            //     collectionId: collectionId
            // };

            // if (fullscreenType === 'collection-tree') {
            //     panelContext
            // }

            var collectionId = $('[data-collection-tree-content]').attr('data-collection-id'),
                collectionTreeType = $('[data-collection-tree-content]').attr('data-collection-tree-type');


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
            // Copy panel specific content
            //

            //
            // Data
            //
            if (fullscreenType === 'collection-data') {

                var $fullscreenContent = $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').find('.wgst-panel-body');
                var $panel = $('.wgst-panel[data-panel-id="' + panelId + '"]');

                $panel.find('.wgst-panel-body').replaceWith($fullscreenContent.clone(true));

                $panel.find('.wgst-collection-controls').removeClass('wgst--hide-this');

            //
            // Map
            //
            } else if (fullscreenType === 'collection-map') {

                //
                // Copy map content to panel
                //
                $('.wgst-panel[data-panel-id="' + panelId + '"]')
                    .find('.wgst-panel-body-container')
                    .append(window.WGST.geo.map.canvas.getDiv());

            //
            // Tree
            //
            } else if (fullscreenType === 'collection-tree') {

                // var collectionId = $('[data-collection-tree-content]').attr('data-collection-id'),
                //     collectionTreeType = $('[data-collection-tree-content]').attr('data-collection-tree-type');

                //
                // Copy tree content to panel
                //
                var $collectionTreeContent = $('[data-fullscreen-type="collection-tree"]').find('[data-collection-tree-content]');

                $('.wgst-panel[data-panel-id="' + fullscreenId + '"]')
                    .find('.wgst-panel-body-container')
                    .html('')
                    .append($collectionTreeContent);

            //
            // Assembly
            //
            } else if (fullscreenType === 'assembly') {

                var $fullscreenContent = $('[data-fullscreen-type="assembly"]');

                $('.wgst-panel[data-panel-id="' + fullscreenId + '"]')
                    .find('.wgst-panel-body-container')
                    .html('')
                    .append($fullscreenContent.html());

            //
            // Assembly upload progress
            //
            } else if (fullscreenType === 'assembly-upload-progress') {

                var $fullscreenContent = $('[data-fullscreen-type="assembly-upload-progress"]');

                $('.wgst-panel[data-panel-id="' + fullscreenId + '"]')
                    .find('.wgst-panel-body-container')
                    .html('')
                    .append($fullscreenContent.html());
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
            // Resize map
            //
            if (fullscreenType === 'collection-map') {

                google.maps.event.trigger(window.WGST.geo.map.canvas, 'resize');

            //
            // Resize tree
            //
            } else if (panelType === 'collection-tree') {

                //
                // Resize tree
                //
                window.WGST.collection[collectionId].tree[collectionTreeType].canvas.resizeToContainer();
                window.WGST.collection[collectionId].tree[collectionTreeType].canvas.draw();
            }

            //
            // Bring panel to front
            //
            window.WGST.exports.bringPanelToFront(panelId);

            //
            // Notify hidable
            //
            window.WGST.exports.happenedFullscreenToPanel(fullscreenId);
        };

        window.WGST.exports.bringPanelToFullscreen = function(panelId) {
            
            var fullscreenType = panelId.split('__')[0];
            var fullscreenId = panelId;

            // console.debug('[WGST][Debug] bringPanelToFullscreen | fullscreenType: ' + fullscreenType);
            // console.debug('[WGST][Debug] bringPanelToFullscreen | fullscreenId: ' + fullscreenId);
            // console.debug('[WGST][Debug] bringPanelToFullscreen | panelId: ' + panelId);

            //
            // Check if fullscreen exists
            //
            if (window.WGST.exports.isFullscreenExists(fullscreenId)) {
                return;
            }

            //
            // Create fullscreen
            //
            window.WGST.exports.createFullscreen(fullscreenId, {
                fullscreenType: fullscreenType,
                fullscreenId: fullscreenId
            });

            //
            // Copy panel specific content
            //
            var panelType = $('.wgst-panel[data-panel-id="' + panelId + '"]').attr('data-panel-type'),
                $fullscreen = $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]');

            //
            // Collection data
            //
            if (panelType === 'collection-data') {
                var $collectionDataContent = $('.wgst-panel[data-panel-id="' + panelId + '"]').find('.wgst-panel-body');
                //$fullscreen.append($collectionDataContent.clone(true));

                $collectionDataContent.clone(true).appendTo($fullscreen);

                //
                // Hide controls
                //
                $fullscreen.find('.wgst-collection-controls').addClass('wgst--hide-this');

            //
            // Collection map
            //
            } else if (panelType === 'collection-map') {

                //
                // Copy map content to fullscreen
                //
                $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                    .find('.wgst-map')
                    .replaceWith(window.WGST.geo.map.canvas.getDiv());

            //
            // Collection tree
            //
            } else if (panelType === 'collection-tree') {

                //
                // Copy tree content to fullscreen
                //

                var $collectionTreeContent = $('[data-panel-type="collection-tree"]').find('[data-collection-tree-content]');

                $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                    .html('')
                    .append($collectionTreeContent);

            //
            // Assembly
            //
            } else if (panelType === 'assembly') {

                var $assemblyContent = $('[data-panel-type="assembly"]').find('.wgst-panel-body-container');

                $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                    .html('')
                    .append($assemblyContent.html());

            //
            // Assembly upload progress
            //
            } else if (panelType === 'assembly-upload-progress') {

                var $panelContent = $('[data-panel-type="assembly-upload-progress"]').find('.wgst-panel-body-container');

                $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                    .html('')
                    .append($panelContent.html());
            }

            //
            // Show fullscreen
            //
            window.WGST.exports.showFullscreen(fullscreenId);

            //
            // Resize map
            //
            if (panelType === 'collection-map') {

                google.maps.event.trigger(window.WGST.geo.map.canvas, 'resize');

            //
            // Resize tree
            //
            } else if (panelType === 'collection-tree') {

                //
                // Figure out how much space canvas tree should take
                //
                var $fullscreenElement = $('[data-fullscreen-type="collection-tree"]'),
                    fullscreenDimensions = {
                        width: $fullscreenElement.outerWidth(),
                        height: $fullscreenElement.outerHeight()
                    };

                console.log('fullscreenDimensions:');
                console.dir(fullscreenDimensions);

                //
                // Figure out tree controls size
                //
                var $treeControlsElement = $fullscreenElement.find('.wgst-tree-controls'),
                    treeControlsDimensions = {
                        width: $treeControlsElement.outerWidth(),
                        height: $treeControlsElement.outerHeight()
                    };

                console.log('treeControlsDimensions:');
                console.dir(treeControlsDimensions);

                //
                // Calculate tree canvas dimensions
                //
                var canvasDimensions = {
                    width: fullscreenDimensions.width,
                    height: fullscreenDimensions.height - treeControlsDimensions.height
                };

                console.log('canvasDimensions:');
                console.dir(canvasDimensions);

                $('[data-fullscreen-type="collection-tree"]').find('.wgst-tree-content').width(canvasDimensions.width);
                $('[data-fullscreen-type="collection-tree"]').find('.wgst-tree-content').height(canvasDimensions.height);

                //
                // Resize tree
                //
                var collectionId = $('[data-collection-tree-content]').attr('data-collection-id'),
                    collectionTreeType = $('[data-collection-tree-content]').attr('data-collection-tree-type');

                window.WGST.collection[collectionId].tree[collectionTreeType].canvas.resizeToContainer();
                window.WGST.collection[collectionId].tree[collectionTreeType].canvas.draw();
            }

            //
            // Remove panel
            //
            window.WGST.exports.removePanel(panelId);

            //
            // Notify hidable
            //
            window.WGST.exports.happenedPanelToFullscreen(panelId);
        };

	})();

});