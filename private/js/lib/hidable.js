$(function(){

	(function(){

        window.WGST.exports.createHidable = function(hidableId, hidableLabel, options) {
            //
            //
            // Options:
            //
            // noFullscreen: true - hides fullscreen control
            // noPanel: true - hides panel control
            //
            //

            // //
            // // Demo special - REMOVE AFTER
            // //
            // if (typeof hidableId.split('__')[2] !== 'undefined') {
            //     if (hidableId.split('__')[2] === 'COLLECTION_TREE' || hidableId.split('__')[2] === 'CORE_ALLELE_TREE') {
            //         return;

            //     } else if (hidableId.split('__')[2] === 'CORE_TREE_RESULT') {
            //         var options = options || {};
            //         options.hidableLabel = "Tree";
            //     }
            // }

            //
            // Make this hidable active
            //
            $('.wgst-hidable[data-hidable-id="' + hidableId + '"]')
                .addClass('wgst-hidable--active');  

            //
            // Check if hidable already exists
            //
            if ($('.wgst-hidable[data-hidable-id="' + hidableId + '"]').length > 0) {

                //
                // Do nothing else
                //
                return;
            }

            var templateContext = {
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
            if (window.WGST.exports.isHidableTree(hidableId)) {
                //templateContext.noFullscreen = true;
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
            // Panel or fullscreen?
            //

            //
            // Panel
            //
            if (window.WGST.exports.getContainerType(hidableId) === 'panel') {
                templateContext.isPanel = true;

            //
            // Fullscreen
            //
            } else if (window.WGST.exports.getContainerType(hidableId) === 'fullscreen') {
                templateContext.isFullscreen = true;
            }

            //
            // Render
            //
            var templateId = 'hidable',
                hidableTemplateSource = $('.wgst-template[data-template-id="' + templateId + '"]').html(),
                hidableTemplate = Handlebars.compile(hidableTemplateSource),
                hidableHtml = hidableTemplate(templateContext);

            $('.wgst-hidables').prepend(hidableHtml);

            //
            // Trees are hidden by default
            //
            if (window.WGST.exports.isHidableTree(hidableId)) {
                window.WGST.exports.happenedHidePanel(hidableId);
            }

            //
            // Show sidebar
            //
            window.WGST.exports.showSidebar();

        };

        window.WGST.exports.isHidableTree = function(hidableId) {
            if (typeof hidableId.split('__')[2] !== 'undefined') {
                return true;
            }

            return false;
        };

        window.WGST.exports.removeHidable = function(hidableId) {
            $('.wgst-hidable[data-hidable-id="' + hidableId + '"]').remove();

            //
            // Hide sidebar if all hidables were removed
            //
            if ($('.wgst-hidable').length === 0) {
                window.WGST.exports.hideSidebar();
            }
        };

        window.WGST.exports.hidablePanelShown = function(panelId) {
            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-panel')
                .find('.fa-eye')
                .removeClass('fa-eye')
                .addClass('fa-eye-slash')
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
                .find('.fa-eye-slash')
                .removeClass('fa-eye-slash')
                .removeClass('wgst-hidable--active')
                .addClass('fa-eye');

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

        $('body').on('click', '.wgst-hidable', function() {

            var $hidableControls = $(this).find('.wgst-hidable-controls');

            $hidableControls.toggleClass('wgst--hide-this');

        });

        // $('body').on('mouseenter', '.wgst-hidable', function() {

        //     var hidableId = $(this).attr('data-hidable-id');

        //     //
        //     // Panel or fullscreen?
        //     //

        //     //
        //     // Panel
        //     //
        //     if ($('.wgst-panel[data-panel-id="' + hidableId + '"]').length > 0) {

        //         //
        //         // Show panel
        //         //
        //         //window.WGST.exports.showPanel(hidableId);

        //         //
        //         // Bring panel to front
        //         //
        //         window.WGST.exports.bringPanelToFront(hidableId);

        //     //
        //     // Fullscreen
        //     //
        //     } else if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

        //         //
        //         // Bring fullscreen to front
        //         //
        //         window.WGST.exports.bringFullscreenToFront(hidableId);

        //     }





        //     // //
        //     // //
        //     // //
        //     // // Panel or fullscreen?
        //     // //
        //     // //
        //     // //
        //     // var $activeControl = $(this).find('.wgst-hidable-controls .wgst-hidable--active');
        //     // var containerType = $activeControl.closest('a').attr('class');

        //     // //
        //     // // If panel
        //     // //
        //     // if (containerType === 'wgst-hidable-panel') {

        //     //     //
        //     //     // Bring panel to front
        //     //     //
        //     //     window.WGST.exports.bringPanelToFront(hidableId);

        //     // //
        //     // // If fullscreen
        //     // //
        //     // } else {

        //     //     //
        //     //     // Bring fullscreen to front
        //     //     //
        //     //     window.WGST.exports.bringFullscreenToFront(hidableId);

        //     // }


        // });

        $('body').on('mouseleave', '.wgst-hidable', function() {

            //
            // Hide submenu
            //
            $(this).find('.wgst-hidable-controls').addClass('wgst--hide-this');


            // var hidableId = $(this).attr('data-hidable-id');

            // //
            // // Show hidable label
            // //
            // //$(this).find('.wgst-hidable-controls').addClass('wgst--hide-this');
            // //$(this).find('.wgst-hidable-toggle').removeClass('wgst--hide-this');

            // //
            // //
            // //
            // // Panel or fullscreen?
            // //
            // //
            // //
            // var $activeControl = $(this).find('.wgst-hidable-controls .wgst-hidable--active');
            // var containerType = $activeControl.closest('a').attr('class');

            // //
            // // If fullscreen
            // //
            // if (containerType === 'wgst-hidable-fullscreen') {

            //     window.WGST.exports.bringFullscreenToBack(hidableId);

            // }

        });


        //
        //
        //
        //
        // Handle hidable control events
        //
        //
        //
        //

        $('body').on('click', '[data-wgst-hidable-button="fullscreen"]', function(event){

            event.stopPropagation();

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            //
            // Check if panel exists
            //
            if ($('.wgst-panel[data-panel-id="' + hidableId + '"]').length > 0) {

                //
                // Maximize panel
                //
                window.WGST.exports.maximizePanel(hidableId);

                //
                // Make this hidable active
                //
                $('.wgst-hidable[data-hidable-id="' + hidableId + '"]')
                    .addClass('wgst-hidable--active');

                $(this).closest('[data-wgst-hidable-controls]').find('[data-wgst-hidable="fullscreen"]').addClass('wgst--hide-this');
                $(this).closest('[data-wgst-hidable-controls]').find('[data-wgst-hidable="panel"]').removeClass('wgst--hide-this');
            }

            event.preventDefault();
        });

        $('body').on('click', '[data-wgst-hidable-button="panel"]', function(event){

            event.stopPropagation();

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            //
            // Check if fullscreen exists
            //
            if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

                //
                // Bring fullscreen to panel
                //
                window.WGST.exports.bringFullscreenToPanel(hidableId);

                //
                // Show panel
                //
                window.WGST.exports.showPanel(hidableId);

                $(this).closest('[data-wgst-hidable-controls]').find('[data-wgst-hidable="fullscreen"]').removeClass('wgst--hide-this');
                $(this).closest('[data-wgst-hidable-controls]').find('[data-wgst-hidable="panel"]').addClass('wgst--hide-this');
            }

            event.preventDefault();
        });

        // $('body').on('click', '[data-wgst-hidable-button="toggle"]', function(event){

        //     event.stopPropagation();

        //     var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

        //     //
        //     // Check if panel exists
        //     //
        //     if ($('.wgst-panel[data-panel-id="' + hidableId + '"]').length > 0) {

        //         //
        //         // Toggle panel
        //         //
        //         window.WGST.exports.togglePanel(hidableId);

        //         //
        //         // Bring panel to front
        //         //
        //         window.WGST.exports.bringPanelToFront(hidableId);

        //     //
        //     // Check if fullscreen exists
        //     //
        //     } else if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

        //         //
        //         // Toggle fullscreen
        //         //
        //         window.WGST.exports.toggleFullscreen(hidableId);
        //     }

        //     event.preventDefault();
        // });

        $('body').on('click', '[data-wgst-hidable-button="show"]', function(event){

            event.stopPropagation();

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            //
            // Check if panel exists
            //
            if ($('.wgst-panel[data-panel-id="' + hidableId + '"]').length > 0) {

                //
                // Show panel
                //
                window.WGST.exports.showPanel(hidableId);

                //
                // Bring panel to front
                //
                window.WGST.exports.bringPanelToFront(hidableId);

            //
            // Check if fullscreen exists
            //
            } else if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

                //
                // Show fullscreen
                //
                window.WGST.exports.showFullscreen(hidableId);
            }

            event.preventDefault();
        });

        $('body').on('click', '[data-wgst-hidable-button="hide"]', function(event){

            event.stopPropagation();

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            //
            // Check if panel exists
            //
            if ($('.wgst-panel[data-panel-id="' + hidableId + '"]').length > 0) {

                //
                // Show panel
                //
                window.WGST.exports.hidePanel(hidableId);

                //
                // Bring panel to front
                //
                //window.WGST.exports.bringPanelToFront(hidableId);

            //
            // Check if fullscreen exists
            //
            } else if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

                //
                // Hide fullscreen
                //
                window.WGST.exports.hideFullscreen(hidableId);
            }

            event.preventDefault();
        });

        $('body').on('click', '[data-wgst-hidable-button="close"]', function(event){

            event.stopPropagation();

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

        $('body').on('click', '[data-wgst-hidable-button="focus"]', function(event){

            event.stopPropagation();

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            var $panel = $('.wgst-panel[data-panel-id="' + hidableId + '"]');

            //
            // Check if panel exists
            //
            if ($panel.length > 0) {

                //
                // Hide all other panels
                //
                var panelId;

                $('.wgst-panel').each(function(){
                    panelId = $(this).attr('data-panel-id');

                    if (panelId !== hidableId) {
                        window.WGST.exports.hidePanel(panelId);
                    }
                });

                //
                // Check if panel hidden
                //
                if ($panel.hasClass('wgst--hide-this') || $panel.hasClass('wgst--invisible-this')) {

                    //
                    // Show panel
                    //
                    window.WGST.exports.showPanel(hidableId);
                }

            //
            // Check if fullscreen exists
            //
            } else if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

                //
                // Hide all panels
                //
                $('.wgst-panel').each(function(){
                    panelId = $(this).attr('data-panel-id');

                    window.WGST.exports.hidePanel(panelId);
                });

                //
                // Show fullscreen
                //
                window.WGST.exports.showFullscreen(hidableId);
            }

            event.preventDefault();
        });

        //
        //
        //
        //
        // Update hidables state
        //
        //
        //
        //

        window.WGST.exports.happenedPanelToFullscreen = function(panelId) {

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="panel"]').removeClass('wgst--hide-this');

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="fullscreen"]').addClass('wgst--hide-this');
        }

        window.WGST.exports.happenedFullscreenToPanel = function(fullscreenId) {

            $('.wgst-hidable[data-hidable-id="' + fullscreenId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="panel"]').addClass('wgst--hide-this');

            $('.wgst-hidable[data-hidable-id="' + fullscreenId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="fullscreen"]').removeClass('wgst--hide-this');
        }

        window.WGST.exports.happenedHidePanel = function(panelId) {

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="show"]').removeClass('wgst--hide-this');

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="hide"]').addClass('wgst--hide-this');
        }

        window.WGST.exports.happenedShowPanel = function(panelId) {

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="hide"]').removeClass('wgst--hide-this');

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="show"]').addClass('wgst--hide-this');
        }

        window.WGST.exports.happenedHideFullscreen = function(fullscreenId) {
            window.WGST.exports.happenedHidePanel(fullscreenId);
        }

        window.WGST.exports.happenedShowFullscreen = function(fullscreenId) {
            window.WGST.exports.happenedShowPanel(fullscreenId);
        }

	})();

});