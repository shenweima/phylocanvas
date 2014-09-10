$(function(){

        window.WGST.exports.createHidable = function(hidableId, hidableLabel, options) {
            //
            //
            // Options:
            //
            // noFullscreen: true - hides fullscreen control
            // noPanel: true - hides panel control
            //
            //

            //
            // Demo special - REMOVE AFTER
            //
            if (typeof hidableId.split('__')[2] !== 'undefined') {
                if (hidableId.split('__')[2] === 'COLLECTION_TREE' || hidableId.split('__')[2] === 'CORE_ALLELE_TREE') {
                    return;

                } else if (hidableId.split('__')[2] === 'CORE_TREE_RESULT') {
                    var options = options || {};
                    options.hidableLabel = "Tree";
                }
            }

            //
            // Make this hidable active
            //
            $('.wgst-hidable[data-hidable-id="' + hidableId + '"]')
                .addClass('wgst-hidable--active');  

            //
            // Check if hidable already exists
            //
            if ($('.wgst-hidable[data-hidable-id="' + hidableId + '"]').length > 0) {

                return;
            }

            var templateId = 'hidable',
                templateContext = {
                    hidableId: hidableId,
                    hidableLabel: hidableLabel
                };

            //
            // Extend template context if needed - turn off/on controls
            //
            if (typeof options !== 'undefined') {
                $.extend(templateContext, options);
            }

            //
            // Set/overwrite options
            //
            //

            //
            // Filter out trees
            //
            if (typeof hidableId.split('__')[2] !== 'undefined') {
                templateContext.noFullscreen = true;
            }

            //
            // Filter out assembly
            //
            else if (typeof hidableId.split('__')[0] !== 'undefined' && hidableId.split('__')[0] === 'assembly') {
                templateContext.noFullscreen = true;
                templateContext.close = true;
            }

            //
            // Filter out assembly upload panels
            //
            else if (hidableId === 'assembly-upload-navigation'
                    || hidableId === 'assembly-upload-analytics'
                    || hidableId === 'assembly-upload-metadata'
                    || hidableId === 'assembly-upload-progress') {

                templateContext.noFullscreen = true;
                templateContext.close = false;
            }

            //
            // Render
            //
            var hidableTemplateSource = $('.wgst-template[data-template-id="' + templateId + '"]').html(),
                hidableTemplate = Handlebars.compile(hidableTemplateSource),
                hidableHtml = hidableTemplate(templateContext);

            $('.wgst-hidables').prepend(hidableHtml);
        };

        window.WGST.exports.removeHidable = function(hidableId) {
            $('.wgst-hidable[data-hidable-id="' + hidableId + '"]').remove();
        };

        window.WGST.exports.hidablePanelShown = function(panelId) {
            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-panel')
                .find('.fa-square-o')
                .removeClass('fa-square-o')
                .addClass('fa-square')
                .addClass('wgst-hidable--active');

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .addClass('wgst-hidable--active');
        };

        window.WGST.exports.hidablePanelHidden = function(panelId) {
            
            //
            // If that's the last active container for this data then remove active class from this hidable
            //
            if ($('.wgst-hidable[data-hidable-id="' + panelId + '"]').find('.wgst-hidable--active').length === 1) {

                $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                    .removeClass('wgst-hidable--active');
            }

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-panel')
                .find('.fa-square')
                .removeClass('fa-square')
                .removeClass('wgst-hidable--active')
                .addClass('fa-square-o');

        };

        window.WGST.exports.hidablePanelRemoved = function(panelId) {

            //
            // Handle special case: assembly upload panels
            //
            if (panelId === 'assembly-upload-analytics'
                || panelId === 'assembly-upload-metadata'
                || panelId === 'assembly-upload-navigation'
                || panelId === 'assembly-upload-progress') {

                window.WGST.exports.removeHidable(panelId);

            } else {

                window.WGST.exports.hidablePanelHidden(panelId);

            }
        };

        window.WGST.exports.hidableFullscreenShown = function(panelId) {
            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-fullscreen')
                .find('.fa-arrows-alt')
                .addClass('wgst-hidable--active');

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .addClass('wgst-hidable--active');
        };

        window.WGST.exports.hidableFullscreenRemoved = function(fullscreenId) {

            //
            // If that's the last active container for this data then remove active class from this hidable
            //
            if ($('.wgst-hidable[data-hidable-id="' + fullscreenId + '"]').find('.wgst-hidable--active').length === 1) {

                $('.wgst-hidable[data-hidable-id="' + fullscreenId + '"]')
                    .removeClass('wgst-hidable--active');
            }

            $('.wgst-hidable[data-hidable-id="' + fullscreenId + '"]')
                .find('.wgst-hidable-fullscreen')
                .find('.fa-arrows-alt')
                .removeClass('wgst-hidable--active');

        };

        $('body').on('mouseenter', '.wgst-hidable', function() {

            var hidableId = $(this).attr('data-hidable-id');

            //
            // Show hidable controls
            //
            $(this).find('.wgst-hidable-toggle').addClass('hide-this');
            $(this).find('.wgst-hidable-controls').removeClass('hide-this');

            //
            //
            //
            // Panel or fullscreen?
            //
            //
            //
            var $activeControl = $(this).find('.wgst-hidable-controls .wgst-hidable--active');
            var containerType = $activeControl.closest('a').attr('class');

            //
            // If panel
            //
            if (containerType === 'wgst-hidable-panel') {

                //
                // Bring panel to front
                //
                window.WGST.exports.bringPanelToFront(hidableId);

            //
            // If fullscreen
            //
            } else {

                window.WGST.exports.bringFullscreenToFront(hidableId);

            }


        });

        $('body').on('mouseleave', '.wgst-hidable', function() {

            var hidableId = $(this).attr('data-hidable-id');

            //
            // Show hidable label
            //
            $(this).find('.wgst-hidable-controls').addClass('hide-this');
            $(this).find('.wgst-hidable-toggle').removeClass('hide-this');

            //
            //
            //
            // Panel or fullscreen?
            //
            //
            //
            var $activeControl = $(this).find('.wgst-hidable-controls .wgst-hidable--active');
            var containerType = $activeControl.closest('a').attr('class');

            //
            // If fullscreen
            //
            if (containerType === 'wgst-hidable-fullscreen') {

                window.WGST.exports.bringFullscreenToBack(hidableId);

            }

        });

        $('body').on('click', '.wgst-hidable-panel', function(event){

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            //
            // Check if fullscreen exists
            //
            if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

                window.WGST.exports.bringFullscreenToPanel(hidableId);

            //
            // Fullscreen doesnt exist
            // 
            } else {

                //
                // Toggle panel
                //
                window.WGST.exports.togglePanel(hidableId);

                //
                // Bring panel to front
                //
                window.WGST.exports.bringPanelToFront(hidableId);
            }

            event.preventDefault();
        });

        $('body').on('click', '.wgst-hidable-fullscreen', function(event){

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            //
            // Check if panel exists
            //
            if ($('.wgst-panel[data-panel-id="' + hidableId + '"]').length > 0) {

                //
                // Maximize panel
                //
                window.WGST.exports.maximizePanel(hidableId);

            }

            //
            // Make this hidable active
            //
            $('.wgst-hidable[data-hidable-id="' + hidableId + '"]')
                .addClass('wgst-hidable--active');

            event.preventDefault();
        });

        $('body').on('click', '.wgst-hidable-close', function(event){

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            //
            // Check if panel exists
            //
            if ($('.wgst-panel[data-panel-id="' + hidableId + '"]').length > 0) {

                //
                // Remove panel
                //
                window.WGST.exports.removePanel(hidableId);

            }

            //
            // Remove hidable
            //
            window.WGST.exports.removeHidable(hidableId);

            event.preventDefault();
        });

	(function(){



	})();

});