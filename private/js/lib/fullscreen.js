$(function(){

	(function(){

        window.WGST.exports.mapFullscreenIdToTemplateId = {
            'collection-map': 'collection-map-fullscreen',
            'collection-data': 'collection-data-fullscreen',
            'collection-tree': 'collection-tree-fullscreen'
        };

        window.WGST.exports.mapFullscreenIdToPanelType = {
            'collection-map': 'collection-map',
            'collection-data': 'collection-data',
            'collection-tree': 'collection-tree'
        };

        window.WGST.exports.createFullscreen = function(fullscreenId, templateContext) {

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
            // Get fullscreen's label
            //
            templateContext.fullscreenLabel = window.WGST.exports.getContainerLabel({
                containerName: 'fullscreen',
                containerType: templateContext.fullscreenType,
                containerId: fullscreenId
            });

            console.debug('templateContext.fullscreenType: ' + templateContext.fullscreenType);

            //
            // Render
            //
            var fullscreenTemplateId = window.WGST.exports.mapFullscreenIdToTemplateId[templateContext.fullscreenType];

            console.debug('fullscreenTemplateId: ' + fullscreenTemplateId);

            var fullscreenTemplateSource = $('.wgst-template[data-template-id="' + fullscreenTemplateId + '"]').html(),
                fullscreenTemplate = Handlebars.compile(fullscreenTemplateSource),
                fullscreenHtml = fullscreenTemplate(templateContext);

            $('.wgst-workspace').prepend(fullscreenHtml);

            //
            // Create hidable
            //
            window.WGST.exports.createHidable(fullscreenId, templateContext.fullscreenLabel);

        };

        window.WGST.exports.removeFullscreen = function(fullscreenId) {
            $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').remove();

            //
            // Update hidable state
            //
            window.WGST.exports.hidableFullscreenRemoved(fullscreenId);

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
            //window.WGST.exports.hidableFullscreenShown(fullscreenId);
            window.WGST.exports.happenedShowFullscreen(fullscreenId);
        };

        window.WGST.exports.hideFullscreen = function(fullscreenId) {
            $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').addClass('wgst--hide-this wgst--invisible-this');
        
            //
            // Update hidable state
            //
            //window.WGST.exports.hidableFullscreenHidden(fullscreenId);
            window.WGST.exports.happenedHideFullscreen(fullscreenId);
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
        
            //
            // Update hidable state
            //
            //window.WGST.exports.hidableFullscreenShown(fullscreenId);
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

//$('[data-toggle="tooltip"]').tooltip('destroy');

            //
            // Map
            //
            } else if (fullscreenType === 'collection-map') {

                //
                // Copy map content to panel
                //
                $('.wgst-panel[data-panel-id="' + panelId + '"]')
                    .find('.wgst-panel-body-content')
                    .append(window.WGST.geo.map.canvas.getDiv());

            //
            // Tree
            //
            } else if (fullscreenType === 'collection-tree') {

                //
                // Copy tree content to panel
                //
                var $collectionTreeContent = $('[data-fullscreen-type="collection-tree"]').find('[data-collection-tree-content]');

                $('.wgst-panel[data-panel-id="' + fullscreenId + '"]')
                    .find('.wgst-panel-body-content')
                    .html('')
                    .append($collectionTreeContent);

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
                var collectionId = $('[data-collection-tree-content]').attr('data-collection-id'),
                    collectionTreeType = $('[data-collection-tree-content]').attr('data-collection-tree-type');

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

        window.WGST.exports.bringPanelToFullscreen = function(panelId, fullscreenWasCreated) {
            
            var fullscreenType = panelId.split('__')[0];
            var fullscreenId = panelId;

            console.debug('[WGST][Debug] bringPanelToFullscreen | fullscreenType: ' + fullscreenType);
            console.debug('[WGST][Debug] bringPanelToFullscreen | fullscreenId: ' + fullscreenId);
            console.debug('[WGST][Debug] bringPanelToFullscreen | panelId: ' + panelId);

            //
            // Check if fullscreen exists
            //
            if ($('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').length > 0) {
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
                var $collectionDataContent = $('.wgst-panel[data-panel-id="' + panelId + '"]').find('.wgst-panel-body');
                //$fullscreen.append($collectionDataContent.clone(true));

                $collectionDataContent.clone(true).appendTo($fullscreen);

                //
                // Hide controls
                //
                $fullscreen.find('.wgst-collection-controls').addClass('wgst--hide-this');

            //
            // Map panel
            //
            } else if (panelType === 'collection-map') {

                //
                // Copy map content to fullscreen
                //
                $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                    .find('.wgst-map')
                    .replaceWith(window.WGST.geo.map.canvas.getDiv());

            //
            // Tree panel
            //
            } else if (panelType === 'collection-tree') {

                //
                // Copy tree content to fullscreen
                //

                var $collectionTreeContent = $('[data-panel-type="collection-tree"]').find('[data-collection-tree-content]');

                $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                    .html('')
                    .append($collectionTreeContent);





                //window.redrawOriginalTree();

                    //.replaceWith($treePanelContent);

                // //
                // // Copy map content to panel
                // //
                // $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                //     .find('.wgst-map')
                //     .replaceWith(window.WGST.geo.map.canvas.getDiv());


                // var $content = $('[data-fullscreen-type="collection-tree"]').find('.wgst-tree-content')[0];


                // console.debug($('[data-fullscreen-type="collection-tree"]').find('.wgst-tree-content').length);
                // console.debug($content.offsetWidth);
                // console.debug($content.offsetHeight);

                // // var canvasNode = $('[data-fullscreen-type="collection-tree"]').find('canvas')[0];
                // // canvasNode.width = 50;
                // // canvasNode.height = 50;

                // window.WGST.collection["c0ca8c57-11b9-4e27-93a5-6ffe841e7768"].tree["COLLECTION_TREE"].canvas.setSize(10,10);

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

                //window.WGST.collection["c0ca8c57-11b9-4e27-93a5-6ffe841e7768"].tree["COLLECTION_TREE"].canvas.setSize(canvasDimensions.width, canvasDimensions.height);
                //window.WGST.collection["c0ca8c57-11b9-4e27-93a5-6ffe841e7768"].tree["COLLECTION_TREE"].canvas.redrawOriginalTree();
                //window.WGST.collection["c0ca8c57-11b9-4e27-93a5-6ffe841e7768"].tree["COLLECTION_TREE"].canvas.draw();

                // var $treePanelContent = $('[data-panel-type="collection-tree"]').find('.wgst-panel-body-content');

                // //
                // // Copy tree content to fullscreen
                // //
                // $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                //     .html('')
                //     .append($treePanelContent);

                //window.redrawOriginalTree();

                    //.replaceWith($treePanelContent);

                // //
                // // Copy map content to panel
                // //
                // $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                //     .find('.wgst-map')
                //     .replaceWith(window.WGST.geo.map.canvas.getDiv());





                // var $content = $('[data-fullscreen-type="collection-tree"]').find('.wgst-tree-content')[0];


                // console.debug($('[data-fullscreen-type="collection-tree"]').find('.wgst-tree-content').length);
                // console.debug($content.offsetWidth);
                // console.debug($content.offsetHeight);

                // // var canvasNode = $('[data-fullscreen-type="collection-tree"]').find('canvas')[0];
                // // canvasNode.width = 50;
                // // canvasNode.height = 50;

                // window.WGST.collection["c0ca8c57-11b9-4e27-93a5-6ffe841e7768"].tree["COLLECTION_TREE"].canvas.setSize(10,10);

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