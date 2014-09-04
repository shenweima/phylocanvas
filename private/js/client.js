// ============================================================
// App
// ============================================================
$(function(){

    'use strict'; // Available in ECMAScript 5 and ignored in older versions. Future ECMAScript versions will enforce it by default.

    window.WGST.version = '0.1.4';

    //
    // Which page should you load?
    //
    if (typeof window.WGST.requestedCollectionId !== 'undefined'
        || window.WGST.isNewCollection === true) {

        //console.log('NEW!!!');
        //console.log(window.WGST.isNewCollection);

        //
        // Show app page
        //
        $('.wgst-page__app').show();
    } else {

        //
        // Show default page
        //
        $('.wgst-page__landing').show();

        return;
    }

    // WGSA now can speak!
    window.WGST.speak = false;

    if (window.WGST.speak) {
        var message = new SpeechSynthesisUtterance('Welcome to WGSA');
        window.speechSynthesis.speak(message);
    }

    /**
     * Description
     * @method onerror
     * @param {} error
     * @return 
     */
    window.onerror = function(error) {
        if (typeof error.message !== 'undefined') {
            console.error('[WGST][Error] ' + error.message);
        } else {
            console.error('[WGST][Error]');
            console.dir(error);
        }

        showNotification(error);
    };

    // WGST.events = {
    //     renderedCollectionTreeEvent: new CustomEvent('renderedCollectionTree', {})
    // };

    // ============================================================
    // Store application state
    // ============================================================

    //var WGST = window.WGST || {};

    WGST.panels = {
        assembly: {
            top: 80,
            left: 90
        },
        collection: {
            top: 80,
            left: 90
        },
        collectionTree: {
            top: 120,
            left: 180  
        },
        mergedCollectionTree: {
            top: 120,
            left: 180
        },
        representativeCollectionTree: {
            top: 80,
            left: 90
        },
        assemblyUploadNavigator: {
            top: 70,
            left: 110
        },
        assemblyUploadAnalytics: {
            top: 70,
            left: 726
        },
        assemblyUploadMetadata: {
            top: 225,
            left: 110
        },
        assemblyUploadProgress: {
            top: 80,
            left: 90
        },
        map: {
            top: '15%',
            left: '20%'
        }
    };

    WGST.assembly = {
        analysis: {
            UPLOAD_OK: 'UPLOAD_OK',
            METADATA_OK: 'METADATA_OK',
            MLST_RESULT: 'MLST_RESULT',
            PAARSNP_RESULT: 'PAARSNP_RESULT',
            FP_COMP: 'FP_COMP',
            CORE: 'CORE'
        }
    };

    WGST.collection = {
        analysis: {
            COLLECTION_TREE: 'COLLECTION_TREE',
            CORE_MUTANT_TREE: 'CORE_MUTANT_TREE'
        },
        representative: {
            tree: {},
            metadata: {}
        }
    };

    WGST.upload = {
        collection: {},
        assembly: {}
    };

    WGST.settings = WGST.settings || {};
    WGST.settings.representativeCollectionId = window.WGST.config.referenceCollectionId; //'1fab53b0-e7fe-4660-b34e-21d501017397';//'59b792aa-b892-4106-b1dd-2e9e78abefc4';

    WGST.antibioticNameRegex = /[\W]+/g;

    //var socketAddress = '//' + window.WGST.config.socketAddress;

    WGST.socket = {
        //connection: io.connect(WGST.config.socketAddress, {secure: true}),
        connection: io.connect(window.WGST.config.socketAddress),
        roomId: ''
    };

    WGST.geo = {
        map: {
            canvas: {},
            options: {
                zoom: 5,
                center: new google.maps.LatLng(48.6908333333, 9.14055555556), // new google.maps.LatLng(51.511214, -0.119824),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                minZoom: 2,
                maxZoom: 11
            },
            markers: {
                assembly: {},
                metadata: {},
                representativeTree: [],
                group: {}
            },
            markerBounds: new google.maps.LatLngBounds(),
            searchBoxBounds: new google.maps.LatLngBounds(),
            /**
             * Description
             * @method init
             * @return 
             */
            init: function() {
                WGST.geo.map.canvas = new google.maps.Map($('.wgst-map')[0], WGST.geo.map.options);
                WGST.geo.map.markers.metadata = new google.maps.Marker({
                    position: new google.maps.LatLng(51.511214, -0.119824),
                    map: WGST.geo.map.canvas,
                    visible: false
                });
                // Bias the SearchBox results towards places that are within the bounds of the current map's viewport.
                google.maps.event.addListener(WGST.geo.map.canvas, 'bounds_changed', function() {
                    WGST.geo.map.searchBoxBounds = WGST.geo.map.canvas.getBounds();
                });
            } // init
        },
        placeSearchBox: {} // Store Google SearchBox object for each dropped file
    };

    WGST.alert = {
        status: {
            SUCCESS: 'success',
            FAILURE: 'failure'
        }
    };

    WGST.init = {
        all: {
            SOCKET_CONNECT: 'Socket connected',
            SOCKET_ROOM_ID: 'Received socket room id',
            REPRESENTATIVE_COLLECTION_TREE_METADATA: 'Loaded representative collectiontree metadata'
        },
        loaded: []
    };

    WGST.dragAndDrop = WGST.dragAndDrop || {};
    WGST.dragAndDrop.files = [];
    WGST.dragAndDrop.fastaFileNameRegex = /^.+(.fa|.fas|.fna|.ffn|.faa|.frn|.fasta|.contig)$/i;

    /**
     * Description
     * @method initApp
     * @param {} loaded
     * @return 
     */
    var initApp = function(loaded) {
        WGST.init.loaded.push(loaded);
        if (WGST.init.loaded.length === Object.keys(WGST.init.all).length) {
            var initHtmlElement = $('.wgst-init');
            initHtmlElement.find('.wgst-init-status').html('');
            setTimeout(function(){
                initHtmlElement.fadeOut('fast');
            }, 500);

            delete WGST.init;
        } // if
    };

    // ============================================================
    // Panels
    // ============================================================

    /**
     * Description
     * @method showPanelBodyContent
     * @param {} panelNames
     * @return 
     */
    var showPanelBodyContent = function(panelNames) {
        // Overwrite function
        /**
         * Description
         * @method showPanelBodyContent
         * @param {} panelName
         * @return 
         */
        var showPanelBodyContent = function(panelName) {
            var panelBodyContent = $('[data-panel-name="' + panelName + '"] .wgst-panel-body-content');
            panelBodyContent.css('visibility', 'visible');
        };

        // Process multiple panels
        if ($.isArray(panelNames)) {

            var panelNameCounter = panelNames.length,
                panelName;

            for (;panelNameCounter !== 0;) {
                panelNameCounter = panelNameCounter - 1;

                panelName = panelNames[panelNameCounter];

                showPanelBodyContent(panelName);
            } // for

        // Process single panel
        } else {
            showPanelBodyContent(panelNames);
        }
    };

    /**
     * Description
     * @method showPanel
     * @param {} panelNames
     * @return 
     */
    var showPanel = function(panelNames) {
        // Overwrite function
        /**
         * Description
         * @method showPanel
         * @param {} panelName
         * @return 
         */
        var showPanel = function(panelName) {
            $('[data-panel-name="' + panelName + '"]')
                .addClass('wgst-panel--visible')
                .css('visibility', 'visible');
        };

        // Process multiple panels
        if ($.isArray(panelNames)) {

            var panelNameCounter = panelNames.length,
                panelName;

            for (;panelNameCounter !== 0;) {
                panelNameCounter = panelNameCounter - 1;

                panelName = panelNames[panelNameCounter];

                showPanel(panelName);
            } // for

        // Process single panel
        } else {
            showPanel(panelNames);
        }
    };

    /**
     * Description
     * @method hidePanelBodyContent
     * @param {} panelNames
     * @return 
     */
    var hidePanelBodyContent = function(panelNames) {
        // Overwrite function
        /**
         * Description
         * @method hidePanelBodyContent
         * @param {} panelName
         * @return 
         */
        var hidePanelBodyContent = function(panelName) {
            var panelBodyContent = $('[data-panel-name="' + panelName + '"] .wgst-panel-body-content');
            panelBodyContent.css('visibility', 'hidden');
        };

        // Process multiple panels
        if ($.isArray(panelNames)) {

            var panelNameCounter = panelNames.length,
                panelName;

            for (;panelNameCounter !== 0;) {
                panelNameCounter = panelNameCounter - 1;

                panelName = panelNames[panelNameCounter];

                hidePanelBodyContent(panelName);
            } // for

        // Process single panel
        } else {
            hidePanelBodyContent(panelNames);
        }
    };

    /**
     * Description
     * @method hidePanel
     * @param {} panelNames
     * @return 
     */
    var hidePanel = function(panelNames) {
        // Overwrite function
        /**
         * Description
         * @method hidePanel
         * @param {} panelName
         * @return 
         */
        var hidePanel = function(panelName) {
            $('[data-panel-name="' + panelName + '"]').css('visibility', 'hidden');
        };

        // Process multiple panels
        if ($.isArray(panelNames)) {

            var panelNameCounter = panelNames.length,
                panelName;

            for (;panelNameCounter !== 0;) {
                panelNameCounter = panelNameCounter - 1;

                panelName = panelNames[panelNameCounter];

                hidePanel(panelName);
            } // for

        // Process single panel
        } else {
            hidePanel(panelNames);
        }
    };

    /**
     * Description
     * @method startPanelLoadingIndicator
     * @param {} panelName
     * @return 
     */
    var startPanelLoadingIndicator = function(panelName) {
        // Hide body content
        // var panelBodyContent = $('[data-panel-name="' + panelName + '"] .wgst-panel-body-content');
        // panelBodyContent.css('visibility', 'hidden');
        // Show animated loading circle
        var panelLoadingIndicator = $('[data-panel-name="' + panelName + '"] .wgst-panel-loading');
        panelLoadingIndicator.show();
    };

    /**
     * Description
     * @method endPanelLoadingIndicator
     * @param {} panelName
     * @return 
     */
    var endPanelLoadingIndicator = function(panelName) {
        // Hide animated loading circle
        var panelLoadingIndicator = $('[data-panel-name="' + panelName + '"] .wgst-panel-loading');
        panelLoadingIndicator.hide();
        // Show body content
        // var panelBodyContent = $('[data-panel-name="' + panelName + '"] .wgst-panel-body-content');
        // panelBodyContent.css('visibility', 'visible');
    };

    $('.tree-controls-draw-subtree').on('click', function(){
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            selectedNode = $(this).attr('data-selected-node');

        console.log('collectionId: ' + collectionId);
        console.log('selectedNode: ' + selectedNode);

        WGST.collection[collectionId].tree.canvas.redrawFromBranch(selectedNode);
    });

    $('.collection-view-horizontal-split').on('click', function(){
        var collectionTreePaper = $('.wgst-paper__collection-tree'),
            collectionMetadataPaper = $('.wgst-paper__collection-metadata');
    });

    /**
     * Description
     * @method isPanelActive
     * @param {} panelName
     * @return 
     */
    var isPanelActive = function(panelName) {
        var panelElement = $('[data-panel-name="' + panelName + '"]');

        if (panelElement.hasClass('wgst-panel--active')) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Description
     * @method isPanelVisible
     * @param {} panelName
     * @return 
     */
    var isPanelVisible = function(panelName) {
        var panelElement = $('[data-panel-name="' + panelName + '"]');

        if (panelElement.hasClass('wgst-panel--visible')) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Description
     * @method activatePanel
     * @param {} panelNames
     * @param {} callback
     * @return 
     */
    var activatePanel = function(panelNames, callback) {
        // Overwrite function
        /**
         * Description
         * @method activatePanel
         * @param {} panelName
         * @return 
         */
        var activatePanel = function(panelName) {
            var panel = $('[data-panel-name="' + panelName + '"]');

            // Set position
            panel.css('top', WGST.panels[panelName].top);
            panel.css('left', WGST.panels[panelName].left);

            // Activate, but don't show
            panel.css('visibility', 'hidden');
            //panel.fadeIn('fast');
            panel.show();
            panel.addClass('wgst-panel--active');
        };

        // Process multiple panels
        if ($.isArray(panelNames)) {

            var panelNameCounter = panelNames.length,
                panelName;

            for (;panelNameCounter !== 0;) {
                panelNameCounter = panelNameCounter - 1;

                panelName = panelNames[panelNameCounter];

                activatePanel(panelName);
            } // for

        // Process single panel
        } else {
            activatePanel(panelNames);
        }
        // Callback
        if (typeof callback === 'function') {
            callback();
        }
    };

    /**
     * Description
     * @method deactivatePanel
     * @param {} panelNames
     * @param {} callback
     * @return 
     */
    var deactivatePanel = function(panelNames, callback) {
        // Overwrite function
        /**
         * Description
         * @method deactivatePanel
         * @param {} panelName
         * @return 
         */
        var deactivatePanel = function(panelName) {
            var panel = $('[data-panel-name="' + panelName + '"]'),
                panelBodyContent = panel.find('.wgst-panel-body-content');

            panel.hide();
            panel.removeClass('wgst-panel--active');
            panel.removeClass('wgst-panel--visible');
        };

        // Process multiple panels
        if ($.isArray(panelNames)) {

            var panelNameCounter = panelNames.length,
                panelName;

            for (;panelNameCounter !== 0;) {
                panelNameCounter = panelNameCounter - 1;

                panelName = panelNames[panelNameCounter];

                deactivatePanel(panelName);
            } // for

        // Process single panel
        } else {
            deactivatePanel(panelNames);
        }
        // // Callback
        // if (typeof callback === 'function') {
        //     callback();
        // }
    };

    /**
     * Description
     * @method bringPanelToTop
     * @param {} panelName
     * @return 
     */
    var bringPanelToTop = function(panelName) {
        var zIndexHighest = 0;

        $('.wgst-panel').each(function(){
            var zIndexCurrent = parseInt($(this).css('zIndex'), 10);
            if (zIndexCurrent > zIndexHighest) {
                zIndexHighest = zIndexCurrent;
            }
        });

        $('[data-panel-name="' + panelName + '"]').css('zIndex', zIndexHighest + 1);
    };

    /**
     * Description
     * @method openPanel
     * @param {} panelName
     * @return 
     */
    window.WGST.openPanel = function(panelName) {
        if (isFullscreenActive(panelName)) {
            bringFullscreenToPanel(true);
        }

        activatePanel(panelName);
        endPanelLoadingIndicator(panelName);
        showPanelBodyContent(panelName);
        showPanel(panelName);
        bringPanelToTop(panelName);
    };

    // var isOpenedPanel = function(panelName) {
    //     var panel = $('[data-panel-name="' + panelName + '"]');

    //     if (panel.hasClass('wgst-panel--active')) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // };

    // ============================================================
    // Representative Collection Tree Metadata
    // ============================================================

    /**
     * Description
     * @method getRepresentativeCollectionTreeMetadata
     * @param {} callback
     * @return 
     */
    var getRepresentativeCollectionTreeMetadata = function(callback) {
        console.log('[WGST] Getting representative collection tree metadata');
        // Get representative collection metadata
        $.ajax({
            type: 'GET',
            url: '/api/collection/representative/metadata',
            datatype: 'json' // http://stackoverflow.com/a/9155217
        })
        .done(function(representativeCollectionMetadata, textStatus, jqXHR) {
            console.log('[WGST] Got representative collection tree metadata');
            console.dir(representativeCollectionMetadata);

            callback(null, representativeCollectionMetadata);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('[WGST][Error] ✗ Failed to get representative collection tree metadata');
            console.error(textStatus);
            console.error(errorThrown);
            console.error(jqXHR);

            callback(textStatus, null);
        });
    };

    /**
     * Description
     * @method showAlert
     * @param {} message
     * @param {} status
     * @param {} hideAfterShow
     * @return 
     */
    var showAlert = function(message, status, hideAfterShow) {
        console.error('[WGST][Error] ✗ ' + message);

        if (WGST.speak) {
            var message = new SpeechSynthesisUtterance(message);
            window.speechSynthesis.speak(message);
            WGST.speak = false;
        }

        var alertHtmlElement = $('.wgst-alert');
        // Remove all previous status classes and add the current one
        alertHtmlElement.attr('class', 'wgst-alert').addClass('wgst-alert__' + status);
        // Add text message and show alert element
        alertHtmlElement.html(message).show();
        // Hide alert element after sometime if necessary
        if (hideAfterShow) {
            setTimeout(function(){
                alertHtmlElement.fadeOut('fast');
            }, 3000);
        } // if
    };

    /**
     * Description
     * @method showNotification
     * @param {} message
     * @return 
     */
    var showNotification = function(message) {
        //console.error('✗ [WGST][Error] ' + message);
        var errorHtmlElement = $('.wgst-notification__error');
        //errorHtmlElement.html(message).show();
        errorHtmlElement.html('Please refresh your page.').show();
        //if (errorHtmlElement.is(':visible')) {}
        // setTimeout(function(){
        //     errorHtmlElement.hide();
        //     errorHtmlElement.html('');
        // }, 5000);
    };

    /**
     * Description
     * @method showWarning
     * @param {} message
     * @return 
     */
    var showWarning = function(message) {
        console.log('• [WGST][Warning] ' + message);
        var errorHtmlElement = $('.wgst-notification__warning');
        errorHtmlElement.html(message).show();
        //if (errorHtmlElement.is(':visible')) {}
        setTimeout(function(){
            errorHtmlElement.hide();
            errorHtmlElement.html('');
        }, 5000);
    };

    // ============================================================
    // Init app
    // ============================================================

    // Init
    (function(){

        // Init jQuery UI draggable interaction
        $('.wgst-draggable').draggable({
            handle: ".wgst-draggable-handle",
            appendTo: "body",
            scroll: false,
            //containment: "window",
            /**
             * Description
             * @method start
             * @return 
             */
            start: function() {
                ringDragging = true;
            },
            /**
             * Description
             * @method stop
             * @param {} event
             * @param {} ui
             * @return 
             */
            stop: function(event, ui) {
                ringDragging = false;
                // Store current panel position
                var panelName = ui.helper.attr('data-panel-name');
                WGST.panels[panelName].top = ui.position.top;
                WGST.panels[panelName].left = ui.position.left;
            }
        });

        // Init jQuery UI slider widget
        $('.assembly-list-slider').slider({
            range: "max",
            min: 0,
            max: 10,
            value: 0,
            animate: 'fast',
            slide: function(event, ui) {
                //$('.selected-assembly-counter').text(ui.value);
            }
        });

        // Popover
        $('.add-data button').popover({
            html: true,
            placement: 'bottom',
            title: 'Add your data',
            content: '<div class="upload-data"><span>You can drag and drop your CSV files anywhere on the map.</span><input type="file" id="exampleInputFile"></div>'
        });

        // Toggle timeline
        $('.timeline-toggle-button').on('click', function(){
            if ($(this).hasClass('active')) {
                $('#timeline').hide();
            } else {
                $('#timeline').css('bottom', '0');
                $('#timeline').show();
            }
        });

        // Toggle graph
        $('.graph-toggle-button').on('click', function(){
            if ($(this).hasClass('active')) {
                $('.tree-panel').hide();
            } else {
                $('.tree-panel').show();
            }
        });

        // Toggle all panels
        $('.all-panels-toggle-button').on('click', function(){
            if ($(this).hasClass('active')) {
                $('.wgst-panel--active').hide();
            } else {
                $('.wgst-panel--active').show();
            }
        });

        // Show graph
        $('.graph-toggle-button').trigger('click');
        
        // Set socket room id
        WGST.socket.connection.on('roomId', function(roomId) {
            console.log('[WGST][Socket.io] Received room id: ' + roomId);
            console.log('[WGST][Socket.io] Ready');

            // Set room id for this client
            WGST.socket.roomId = roomId;

            initApp(WGST.init.all.SOCKET_ROOM_ID);
        });

        // Get socket room id
        WGST.socket.connection.emit('getRoomId');

        WGST.socket.connection.on('connect', function() {
            // This event can fire after app was initialised, so need to check for that first
            if (typeof WGST.init !== 'undefined') {
                initApp(WGST.init.all.SOCKET_CONNECT);
            }
        });
        // WGST.socket.connection.on('connecting', function() {
        //     showAlert('Connecting to the server...');
        // });
        // WGST.socket.connection.on('connect_failed', function() {
        //     showAlert('Failed to connect to the server.');
        // });

        // Socket errors
        WGST.socket.connection.on('error', function() {
            showAlert('Unexpected error has occured.', WGST.alert.status.FAILURE, false);
        });
        WGST.socket.connection.on('disconnect', function() {
            showAlert('Disconnected from the server.', WGST.alert.status.FAILURE, false);
        });
        WGST.socket.connection.on('reconnecting', function() {
            showAlert('Reconnecting to the server...', WGST.alert.status.FAILURE, false);
        });
        WGST.socket.connection.on('reconnect', function() {
            showAlert('Reconnected to the server.', WGST.alert.status.SUCCESS, true);
        });
        WGST.socket.connection.on('reconnect_failed', function() {
            showAlert('Failed to reconnect to the server.', WGST.alert.status.FAILURE, false);
        });

        // // Get representative collection tree metadata
        // getRepresentativeCollectionTreeMetadata(function(error, representativeCollectionTreeMatadata){
        //     if (error) {
        //         // Show notification
        //         showNotification(error);
        //         return;
        //     }

        //     WGST.collection.representative.metadata = representativeCollectionTreeMatadata;

        //     activatePanel('representativeCollectionTree', function(){
        //         startPanelLoadingIndicator('representativeCollectionTree');

        //         renderRepresentativeCollectionTree();
        //     });

        //     initApp(WGST.init.all.REPRESENTATIVE_COLLECTION_TREE_METADATA);
        // });
        initApp(WGST.init.all.REPRESENTATIVE_COLLECTION_TREE_METADATA);

    })();

    /**
     * Description
     * @method createAssemblyResistanceProfilePreviewString
     * @param {} assemblyResistanceProfile
     * @param {} antibiotics
     * @return assemblyResistanceProfileHtml
     */
    var createAssemblyResistanceProfilePreviewString = function(assemblyResistanceProfile, antibiotics) {
        var assemblyResistanceProfileHtml = '',
            antibioticGroup,
            antibioticGroupName,
            antibioticGroupHtml,
            antibioticName,
            // Store single antibiotic HTML string
            antibioticHtml,
            // Store all antibiotic HTML strings
            antibioticsHtml,
            antibioticResistanceState;

        // Parse each antibiotic group
        for (antibioticGroupName in antibiotics) {
            if (antibiotics.hasOwnProperty(antibioticGroupName)) {
                antibioticGroup = antibiotics[antibioticGroupName];
                antibioticGroupHtml = '  ';
                antibioticsHtml = '';
                // Parse each antibiotic
                for (antibioticName in antibioticGroup) {
                    if (antibioticGroup.hasOwnProperty(antibioticName)) {
                        // Store single antibiotic HTML string
                        antibioticHtml = '';
                        // Antibiotic found in Resistance Profile for this assembly
                        if (typeof assemblyResistanceProfile[antibioticGroupName] !== 'undefined') {
                            if (typeof assemblyResistanceProfile[antibioticGroupName][antibioticName] !== 'undefined') {
                                antibioticResistanceState = assemblyResistanceProfile[antibioticGroupName][antibioticName].resistanceState;
                                if (antibioticResistanceState === 'RESISTANT') {
                                    antibioticHtml = antibioticHtml + '⦿';
                                } else if (antibioticResistanceState === 'SENSITIVE') {
                                    antibioticHtml = antibioticHtml + '○';
                                } else {
                                    antibioticHtml = antibioticHtml + '○';
                                }
                            } else {
                                antibioticHtml = antibioticHtml + '○';
                            }
                        } else {
                            antibioticHtml = antibioticHtml + '○';
                        }
                        // Concatenate all antibiotic HTML strings into a single string
                        antibioticsHtml = antibioticsHtml + antibioticHtml;
                    } // if
                } // for
                antibioticGroupHtml = antibioticGroupHtml + antibioticsHtml;
                assemblyResistanceProfileHtml = assemblyResistanceProfileHtml + antibioticGroupHtml;
            } // if
        } // for

        return assemblyResistanceProfileHtml;
    };

    /**
     * Description
     * @method createAssemblyResistanceProfilePreviewHtml
     * @param {} assemblyResistanceProfile
     * @param {} antibiotics
     * @return assemblyResistanceProfileHtml
     */
    var createAssemblyResistanceProfilePreviewHtml = function(assemblyResistanceProfile, antibiotics) {
        var assemblyResistanceProfileHtml = '',
            antibioticGroup,
            antibioticGroupName,
            antibioticGroupHtml,
            antibioticName,
            // Store single antibiotic HTML string
            antibioticHtml,
            // Store all antibiotic HTML strings
            antibioticsHtml,
            antibioticResistanceState;

        /*

        TO DO: Try changing .antibiotic span elements to div and see if that will introduce hover right border bug,
        when Bootstrap Tooltip is activated.

        TO DO: Refactor. Use $.map()

        */

        // Parse each antibiotic group
        for (antibioticGroupName in antibiotics) {
            if (antibiotics.hasOwnProperty(antibioticGroupName)) {
                antibioticGroup = antibiotics[antibioticGroupName];
                antibioticGroupHtml = '<div class="antibiotic-group" data-antibiotic-group-name="' + antibioticGroupName + '">{{antibioticsHtml}}</div>';
                antibioticsHtml = '';
                // Parse each antibiotic
                for (antibioticName in antibioticGroup) {
                    if (antibioticGroup.hasOwnProperty(antibioticName)) {
                        // Store single antibiotic HTML string
                        antibioticHtml = '';

                        // Antibiotic found in Resistance Profile for this assembly
                        if (typeof assemblyResistanceProfile[antibioticGroupName] !== 'undefined') {
                            if (typeof assemblyResistanceProfile[antibioticGroupName][antibioticName] !== 'undefined') {
                                antibioticResistanceState = assemblyResistanceProfile[antibioticGroupName][antibioticName].resistanceState;
                                if (antibioticResistanceState === 'RESISTANT') {
                                    antibioticHtml = antibioticHtml + '<span class="antibiotic resistance-fail" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + antibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '"></span>';
                                } else if (antibioticResistanceState === 'SENSITIVE') {
                                    antibioticHtml = antibioticHtml + '<span class="antibiotic resistance-success" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + antibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '"></span>';
                                } else {
                                    antibioticHtml = antibioticHtml + '<span class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + antibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '"></span>';
                                }
                            } else {
                                antibioticHtml = antibioticHtml + '<span class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + antibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '"></span>';
                                console.warn('[!] Assembly resistatance profile has no antibiotic: ' + antibioticName);
                            }
                        } else {
                            antibioticHtml = antibioticHtml + '<span class="antibiotic no-resistance-data" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + antibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '"></span>';
                            console.warn('[!] Assembly resistatance profile has no antibiotic group: ' + antibioticGroupName);
                        }
                        // Concatenate all antibiotic HTML strings into a single string
                        antibioticsHtml = antibioticsHtml + antibioticHtml;
                    } // if
                } // for
                antibioticGroupHtml = antibioticGroupHtml.replace(/{{antibioticsHtml}}/g, antibioticsHtml);
                assemblyResistanceProfileHtml = assemblyResistanceProfileHtml + antibioticGroupHtml;
            } // if
        } // for

        return assemblyResistanceProfileHtml;
    };

    /**
     * Description
     * @method renderAssemblyAnalysisList
     * @param {} collectionId
     * @param {} antibiotics
     * @return 
     */
    var renderAssemblyAnalysisList = function(collectionId, antibiotics) {
        console.log('[WGST] Rendering assembly analysis list');

        var assemblies = WGST.collection[collectionId].assemblies,
            sortedAssemblyIds = WGST.collection[collectionId].sortedAssemblyIds,
            assemblyId,
            assemblyResistanceProfile,
            assemblyResistanceProfileHtml,
            assemblyTopScore,
            assemblyLatitude,
            assemblyLongitude,
            assemblyCounter = 0;

        var collectionAssemblyList = $('.collection-assembly-list'),
            collectionAssemblyListFull = $('.collection-assembly-list-full'),
            assemblyListItemHtml,
            assemblyListItems = document.createDocumentFragment();

        // Render assemblies according to the sorting order
        for (;assemblyCounter < sortedAssemblyIds.length;) {

            assemblyId = sortedAssemblyIds[assemblyCounter];
             
            //console.log('[?] Assembly resistance profile:');
            //console.dir(assemblies[assemblyId].PAARSNP_RESULT.paarResult.resistanceProfile);

            // Create assembly resistance profile preview html
            assemblyResistanceProfile = assemblies[assemblyId].PAARSNP_RESULT.paarResult.resistanceProfile;
            assemblyResistanceProfileHtml = createAssemblyResistanceProfilePreviewHtml(assemblyResistanceProfile, antibiotics);

            // Calculate assembly top score
            assemblyTopScore = calculateAssemblyTopScore(assemblies[assemblyId]['FP_COMP'].scores);

            WGST.collection[collectionId].assemblies[assemblyId]['FP_COMP'].topScore = assemblyTopScore;

            // Get assembly latitude and longitude
            assemblyLatitude = assemblies[assemblyId]['ASSEMBLY_METADATA'].geography.position.latitude;
            assemblyLongitude = assemblies[assemblyId]['ASSEMBLY_METADATA'].geography.position.longitude;

            assemblyListItemHtml = 
                $(((assemblyCounter % 2 === 0) ? '<div class="row-stripe assembly-list-item" data-assembly-id="' + assemblies[assemblyId]['FP_COMP'].assemblyId + '">' : '<div class="assembly-list-item" data-assembly-id="' + assemblies[assemblyId]['FP_COMP'].assemblyId + '">')
                    + '<div class="show-on-tree-radio-button assembly-list-header-tree">'
                        + '<input type="radio" data-reference-id="' + assemblyTopScore.referenceId + '" data-assembly-id="' + assemblies[assemblyId]['FP_COMP'].assemblyId + '" name="optionsRadios" value="' + assemblyTopScore.referenceId + '">'
                    + '</div>'
                    + '<div class="show-on-map-checkbox assembly-list-header-map">'
                        + '<input type="checkbox" data-reference-id="' + assemblyTopScore.referenceId + '" data-assembly-id="' + assemblies[assemblyId]['FP_COMP'].assemblyId + '" data-latitude="' + assemblyLatitude + '" data-longitude="' + assemblyLongitude + '">'
                    + '</div>'
                    //+ '<div class="assembly-list-generation"></div>'
                    + '<div class="assembly-list-header-id">' + '<a href="#" class="open-assembly-button" data-assembly-id="' + assemblies[assemblyId]['FP_COMP'].assemblyId + '" title="' + assemblies[assemblyId]['ASSEMBLY_METADATA']['userAssemblyId'] + '">' + assemblies[assemblyId]['ASSEMBLY_METADATA']['userAssemblyId'] + '</a>' + '</div>'
                    + '<div class="assembly-list-header-nearest-representative">' + '<a href="#" class="show-on-representative-tree" data-assembly-id="' + assemblies[assemblyId]['FP_COMP'].assemblyId + '">' + assemblyTopScore.referenceId + '</a>' + ' (' + Math.round(assemblyTopScore.score.toFixed(2) * 100) + '%)</div>'
                    + '<div class="assembly-list-header-st">' + (assemblies[assemblyId]['MLST_RESULT'].stType.length === 0 ? 'Not found': assemblies[assemblyId]['MLST_RESULT'].stType) + '</div>'
                    + '<div class="assembly-list-header-resistance-profile">'
                        // Resistance profile
                        +'<div class="assembly-resistance-profile-container">'
                            + assemblyResistanceProfileHtml
                        + '</div>'
                    + '</div>'
                + '</div>');

            assemblyListItems.appendChild(assemblyListItemHtml[0]);
            assemblyCounter = assemblyCounter + 1;
        } // for

        collectionAssemblyList[0].appendChild(assemblyListItems.cloneNode(true));
        collectionAssemblyListFull[0].appendChild(assemblyListItems.cloneNode(true));

        $('.antibiotic[data-toggle="tooltip"]').tooltip();

        // Check checkboxes
        $('.show-on-map-checkbox input[type="checkbox"]').prop('checked', true).change();
    };

    /**
     * Description
     * @method isNavItemEnabled
     * @param {} navItemName
     * @return 
     */
    var isNavItemEnabled = function(navItemName) {
        var navItem = $('.wgst-navigation-item__' + navItemName);

        if (navItem.hasClass('wgst-navigation-item--active')) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Description
     * @method enableNavItem
     * @param {} navItemName
     * @return 
     */
    var enableNavItem = function(navItemName) {
        var navItem = $('.wgst-navigation-item__' + navItemName);

        if (! isNavItemEnabled(navItemName)) {
            navItem.addClass('wgst-navigation-item--active');
        }
    };

    /**
     * Description
     * @method disableNavItem
     * @param {} navItemName
     * @return 
     */
    var disableNavItem = function(navItemName) {
        var navItem = $('.wgst-navigation-item__' + navItemName);

        if (isNavItemEnabled(navItemName)) {
            navItem.removeClass('wgst-navigation-item--active');
        }
    };

    /**
     * Description
     * @method clearCollectionAssemblyList
     * @param {} collectionId
     * @return 
     */
    var clearCollectionAssemblyList = function(collectionId) {
        console.log('[WGST] Clearing ' + collectionId + ' collection assembly list');

        $('.wgst-panel__collection .collection-assembly-list').html('');
    };

    var removeCollectionTreePanel = function(collectionId, collectionTreeType) {
        var collectionTreePanelId = 'collectionTree' + '__' + collectionId + '__' + collectionTreeType,
            $collectionTreePanel = $('.wgst-panel[data-panel-name="' + collectionTreePanelId + '"]');

        $collectionTreePanel.remove();
    };

    var removeCollectionTreePanels = function(collectionId) {
        var collectionTrees = WGST.collection[collectionId].tree;

        $.each(collectionTrees, function(collectionTreeType, collectionTreeData) {
            // Render collection tree button
            removeCollectionTreePanel(collectionId, collectionTreeType);
        });
    };

    /**
     * Description
     * @method closeCollection
     * @param {} collectionId
     * @return 
     */
    var closeCollection = function(collectionId) {
        /*
        * If collection object doesn't exist then collection was closed previously.
        * Do nothing in this case.
        */
        if (typeof WGST.collection[collectionId] === 'undefined') {
            return;
        }

        console.log('[WGST] Closing collection ' + collectionId);
        //console.dir(WGST.collection[collectionId]);

        clearCollectionAssemblyList(collectionId);

        deactivatePanel(['collection', 'collectionTree']);

        // Remove collection tree panels
        removeCollectionTreePanels(collectionId);

        // Change URL
        window.history.replaceState('Object', 'WGST Collection', '');

        // Remove all 'Open tree' buttons
        $('.wgst-collection-controls__show-tree .btn-group').html('');

        // Disable 'Collection' nav item
        disableNavItem('collection');

        // Delete collection object
        delete WGST.collection[collectionId];

        // Remove stored collection id
        WGST.collection.opened = '';

        // Hide collection navigation
        //$('.wgst-navigation__collection').show();
        $('.wgst-navigation__collection-panels').toggleClass('hide-this');
    };

    /**
     * Description
     * @method initEmptyCollection
     * @param {} collectionId
     * @param {} collectionTreeTypes
     * @return 
     */
    var initEmptyCollection = function(collectionId, collectionTreeTypes) {
        WGST.collection[collectionId] = {
            assemblies: {},
            tree: {}
        };

        // Init each collection tree type
        if ($.isArray(collectionTreeTypes)) {
            collectionTreeTypes.forEach(function(collectionTreeType){
                WGST.collection[collectionId].tree[collectionTreeType] = {};
            });
        }
    };

    var renderCollectionTreeButtons = function(collectionId) {
        // Init all collection trees
        var collectionTrees = WGST.collection[collectionId].tree;

        $.each(collectionTrees, function(collectionTreeType, collectionTreeData) {
            if (collectionTreeType === 'CORE_TREE_RESULT') {
                // Render collection tree button
                renderCollectionTreeButton(collectionId, collectionTreeType);    
            }
        });
    };

    var renderCollectionTreeButton = function(collectionId, collectionTreeType) {
        // Init all collection trees
        var collectionTree = WGST.collection[collectionId].tree[collectionTreeType],
            collectionTreeName = collectionTree.name,
            openTreeButton,
            openTreeButtonTemplate = '<button type="button" class="btn btn-sm btn-default wgst-collection-control__show-tree" data-tree-type="{{collectionTreeType}}" data-collection-id="{{collectionId}}">{{collectionTreeName}}</button>',
            $collectionControlsShowTree = $('.wgst-collection-controls__show-tree .btn-group'),
            $collectionControlsShowDataTable = $('.wgst-collection-controls__show-data-table .btn-group');

        // Add "Open tree" button to this collection panel
        openTreeButton = openTreeButtonTemplate.replace(/{{collectionTreeType}}/g, collectionTreeType);
        openTreeButton = openTreeButton.replace(/{{collectionId}}/g, collectionId);
        openTreeButton = openTreeButton.replace(/{{collectionTreeName}}/g, collectionTreeName);
        $collectionControlsShowTree.append($(openTreeButton));
    };

    var renderCollectionDataButton = function(collectionId) {
        // Init all collection trees
        var openCollectionDataTableButton,
            openCollectionDataTableTemplate = '<button type="button" class="btn btn-sm btn-default wgst-collection-control__show-data-table" data-collection-id="{{collectionId}}">Core Genome Profile</button>',
            $collectionControlsShowDataTable = $('.wgst-collection-controls__show-data-table .btn-group');

        openCollectionDataTableButton = openCollectionDataTableTemplate.replace(/{{collectionId}}/g, collectionId);
        $collectionControlsShowDataTable.append($(openCollectionDataTableButton));
    };

    var renderCollectionTrees = function(collectionId, collectionTreeOptions) {
        var collectionTrees = WGST.collection[collectionId].tree;
        $.each(collectionTrees, function(collectionTreeType, collectionTreeData) {
            // Render collection tree
            renderCollectionTree(collectionId, collectionTreeType, collectionTreeOptions);
        });
    };

    /**
     * Description
     * @method initCollection
     * @param {} collectionId
     * @param {} assemblies
     * @param {} trees
     * @param {} treeOptions
     * @return 
     */
    var initCollection = function(collectionId, collectionAssemblies, collectionTrees) {
        initEmptyCollection(collectionId);
        WGST.collection[collectionId].assemblies = collectionAssemblies;

        $.each(collectionTrees, function(collectionTreeType, collectionTreeData) {
            // Init collection tree
            WGST.collection[collectionId].tree[collectionTreeType] = {
                type: collectionTreeType,
                data: collectionTreeData.data,
                name: collectionTreeData.name
            };
        });
    };

    /**
     * Description
     * @method getCollection
     * @param {} collectionId
     * @return 
     */
    var getCollection = function(collectionId) {
        console.log('[WGST] Getting collection ' + collectionId);

        if (WGST.speak) {
            var message = new SpeechSynthesisUtterance('Loading collection');
            window.speechSynthesis.speak(message);
        }

        // When extending current collection, close it and then open it again
        closeCollection(collectionId);

        // ----------------------------------------
        // Init collection panel
        // ----------------------------------------
        var $collectionPanel = $('.wgst-panel__collection');
        // Set panel id
        $collectionPanel.attr('data-panel-id', 'collection_' + collectionId);
        // Set collection id to collection panel
        $collectionPanel.attr('data-collection-id', collectionId);
        // Set collection id
        $collectionPanel.find('.collection-details').attr('data-collection-id', collectionId);
        $collectionPanel.find('.wgst-collection-control__show-tree').attr('collection-id', collectionId);;

        activatePanel('collection', function(){
            startPanelLoadingIndicator('collection');
            showPanel('collection');
        });

        // Get collection data
        $.ajax({
            type: 'POST',
            url: '/collection/',
            datatype: 'json', // http://stackoverflow.com/a/9155217
            data: {
                collectionId: collectionId
            }
        })
        .done(function(data, textStatus, jqXHR) {
            console.log('[WGST] Got collection ' + collectionId + ' data');
            console.dir(data);

            if (Object.keys(data).length > 0) {

                // Update list of antibiotics
                WGST.antibiotics = data.antibiotics;

                initCollection(collectionId, data.collection.assemblies, data.collection.tree);
                renderCollectionTrees(collectionId);
                renderCollectionTreeButtons(collectionId);
                //renderCollectionDataButton(collectionId);
                addResistanceProfileToCollection(collectionId);

                // ----------------------------------------
                // Render assembly metadata list
                // ----------------------------------------
                var assemblies = WGST.collection[collectionId].assemblies,
                    sortedAssemblies = [],
                    sortedAssemblyIds = [];

                // Sort assemblies in order in which they are displayed on tree
                $.each(WGST.collection[collectionId].tree['CORE_TREE_RESULT'].leavesOrder, function(leafCounter, leaf){
                    sortedAssemblies.push(assemblies[leaf.id]);
                    sortedAssemblyIds.push(leaf.id);
                });

                WGST.collection[collectionId].sortedAssemblyIds = sortedAssemblyIds;

                renderAssemblyAnalysisList(collectionId, WGST.antibiotics);

                // ----------------------------------------
                // Prepare collection
                // ----------------------------------------
                console.log('[WGST] Collection ' + collectionId + ' has ' + Object.keys(assemblies).length + ' assemblies');

                // Set collection creation timestamp
                var assemblyIds = Object.keys(assemblies),
                    lastAssemblyId = assemblyIds[assemblyIds.length - 1],
                    lastAssemblyTimestamp = assemblies[lastAssemblyId]['FP_COMP'].timestamp;
                // Format to readable string so that user could read detailed timestamp on mouse over
                $('.assembly-created-datetime').attr('title', moment(lastAssemblyTimestamp, "YYYYMMDD_HHmmss").format('YYYY-MM-DD HH:mm:ss'));
                // Convert to time ago string
                $('.timeago').timeago();

                // ----------------------------------------
                // Prepare collection stats
                // ----------------------------------------
                $('.wgst-stats__collection .wgst-stats-value__total-number-of-assemblies').html(sortedAssemblies.length);
                $('.wgst-stats__collection .wgst-stats-value__number-of-displayed-assemblies').html(sortedAssemblies.length);
                $('.wgst-stats__collection .wgst-stats-value__number-of-selected-assemblies').html('0');
                $('.wgst-stats__collection .wgst-stats-value__created-on').html(moment(new Date()).format('DD/MM/YYYY'));
                $('.wgst-stats__collection .wgst-stats-value__author').html('Anonymous');
                $('.wgst-stats__collection .wgst-stats-value__privacy').html('Public');

                // Scrolling hint
                // if ($('.collection-assembly-list .assembly-list-item:visible').length > 7) {
                //     $('.collection-assembly-list-more-assemblies').show();
                // } else {
                //     $('.collection-assembly-list-more-assemblies').hide();
                // }

                //showPanel('collection');
                endPanelLoadingIndicator('collection');
                showPanelBodyContent('collection');

                /**
                * If collection has more than 100 assemblies then show fullscreen instead of panel.
                *
                * Collection has more than 100 assemblies - show fullscreen, otherwise show panel.
                */
                if (Object.keys(WGST.collection[collectionId].assemblies).length > 100) {
                    console.log('[WGST] Collection ' + collectionId + ' will be displayed fullscreen');
                    
                    maximizeCollection(collectionId);
                }

                // Enable 'Collection' nav item
                enableNavItem('collection');

                // Update address bar
                window.history.replaceState('Object', 'WGST Collection', '/collection/' + collectionId);

                // Store open collection id
                WGST.collection.opened = collectionId;

                // Show collection navigation
                //$('.wgst-navigation__collection').show();
                $('.wgst-navigation__collection-panels').toggleClass('hide-this');

            } // if
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('[WGST][ERROR] Failed to get collection id');
            console.error(textStatus);
            console.error(errorThrown);
            console.error(jqXHR);

            showNotification(textStatus);
        });
    };

    // If user provided collection id in url then load requested collection
    if (typeof WGST.requestedCollectionId !== 'undefined') {
        getCollection(WGST.requestedCollectionId);
    }

    $('.tree-controls-show-labels').on('click', function(){
        // Get collection id
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id');

        WGST.collection[collectionId].tree['CORE_TREE_RESULT'].canvas.displayLabels();
    });

    $('.tree-controls-hide-labels').on('click', function(){
        // Get collection id
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id');

        WGST.collection[collectionId].tree['CORE_TREE_RESULT'].canvas.hideLabels();
    });

    // $('.collection-assembly-list').on('scroll', function(){
    //     console.log('Scrolling...');

    //     var collectionId = $(this).attr('data-collection-id');

    //     WGST.collection[collectionId].displayedAssemblies = [];
    // });

    /**
     * Description
     * @method groupAssembliesByPosition
     * @param {} collectionId
     * @param {} assemblyIds
     * @return groupedPositions
     */
    var groupAssembliesByPosition = function(collectionId, assemblyIds) {
        var groupedPositions = {},
            assemblies = WGST.collection[collectionId].assemblies,
            assemblyId,
            assemblyPositionLatitude,
            assemblyPositionLongitude,
            assemblyLatLng;

        for (var i = 0; i < assemblyIds.length; i++) {
            assemblyId = assemblyIds[i];
            assemblyPositionLatitude = assemblies[assemblyId].ASSEMBLY_METADATA.geography.position.latitude;
            assemblyPositionLongitude = assemblies[assemblyId].ASSEMBLY_METADATA.geography.position.longitude;
            assemblyLatLng = new google.maps.LatLng(assemblyPositionLatitude, assemblyPositionLongitude);

            if (typeof groupedPositions[assemblyLatLng.toString()] === 'undefined') {
                groupedPositions[assemblyLatLng.toString()] = [];
            }
            
            groupedPositions[assemblyLatLng.toString()].push(assemblyId);
        } // for

        console.log('[WGST] Grouped assemblies by position:');
        console.dir(groupedPositions);

        return groupedPositions;
    };

    /**
     * Description
     * @method createGroupMarker
     * @param {} groupAssemblyIds
     * @param {} groupMarkerLat
     * @param {} groupMarkerLng
     * @param {} groupSize
     * @return 
     */
    var createGroupMarker = function(groupAssemblyIds, groupMarkerLat, groupMarkerLng, groupSize) {
        var markerIcon = '//chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + groupSize + '|00FFFF|000000',
            groupPosition = new google.maps.LatLng(groupMarkerLat, groupMarkerLng),
            groupPositionString = groupPosition.toString();

        WGST.geo.map.markers.group[groupPositionString] = {
            assemblyIds: groupAssemblyIds,
            marker: {}
        };

        WGST.geo.map.markers.group[groupPositionString].marker = new google.maps.Marker({
            position: new google.maps.LatLng(groupMarkerLat, groupMarkerLng),
            map: WGST.geo.map.canvas,
            icon: markerIcon,
            //draggable: true,
            optimized: true // http://www.gutensite.com/Google-Maps-Custom-Markers-Cut-Off-By-Canvas-Tiles
        });

        // Handle marker click
        google.maps.event.addListener(WGST.geo.map.markers.group[groupPositionString].marker, 'click', function(e) {
            // If there is only one assembly id in a group then open that assembly
            if (WGST.geo.map.markers.group[groupPositionString].assemblyIds.length === 1) {
                openAssemblyPanel(WGST.geo.map.markers.group[groupPositionString].assemblyIds[0]);
            } else {
                // Do nothing yet
            }
        });
    };

    /**
     * Description
     * @method removeAllGroupMarkers
     * @return 
     */
    var removeAllGroupMarkers = function() {
        var allGroupMarkers = WGST.geo.map.markers.group,
            groupPositionString,
            groupMarker;

        for (groupPositionString in allGroupMarkers) {
            groupMarker = allGroupMarkers[groupPositionString].marker;
            groupMarker.setMap(null);
            delete WGST.geo.map.markers.group[groupPositionString];
        }

        // Uncheck All Assemblies On Map checkbox
        $('.show-all-assemblies-on-map').prop('checked', false);
    };

    /**
     * Description
     * @method triggerMapMarkers
     * @param {} collectionId
     * @param {} selectedAssemblyIds
     * @return 
     */
    var triggerMapMarkers = function(collectionId, selectedAssemblyIds) {

        var assemblyMarkerBounds = new google.maps.LatLngBounds();

        // Remove existing markers
        removeAllGroupMarkers();

        // Create new markers if there are any
        if (selectedAssemblyIds.length > 0) {
            var groupedPositions = groupAssembliesByPosition(collectionId, selectedAssemblyIds),
                positionString,
                positionGroup,
                assemblies = WGST.collection[collectionId].assemblies,
                assemblyId,
                positionGroupLat,
                positionGroupLng;

            for (positionString in groupedPositions) {
                positionGroup = groupedPositions[positionString];
                assemblyId = positionGroup[0];

                positionGroupLat = assemblies[assemblyId].ASSEMBLY_METADATA.geography.position.latitude;
                positionGroupLng = assemblies[assemblyId].ASSEMBLY_METADATA.geography.position.longitude;

                createGroupMarker(positionGroup, positionGroupLat, positionGroupLng, positionGroup.length);

                assemblyMarkerBounds.extend(new google.maps.LatLng(positionGroupLat, positionGroupLng));
            } // for
        } // if

        if (assemblyMarkerBounds.isEmpty()) {
            WGST.geo.map.canvas.setCenter(new google.maps.LatLng(48.6908333333, 9.14055555556));
            WGST.geo.map.canvas.setZoom(5);
        } else {
            // Pan to marker bounds
            WGST.geo.map.canvas.panToBounds(assemblyMarkerBounds);
            // Set the map to fit marker bounds
            WGST.geo.map.canvas.fitBounds(assemblyMarkerBounds);
        }
    };

    /**
     * Description
     * @method selectTreeNodes
     * @param {} collectionId
     * @param {} selectedAssemblyIds
     * @return 
     */
    var selectTreeNodes = function(collectionId, selectedAssemblyIds) {
        var assemblies = WGST.collection[collectionId].assemblies;

        // if (selectedAssemblyIds.length > 0) {
        //     selectedAssemblyIds = selectedAssemblyIds.split(',');
        // } else {
        //     selectedAssemblyIds = [];
        // }

        // Uncheck all radio buttons
        $('.collection-assembly-list .assembly-list-item [type="radio"]').prop('checked', false);

        // Add/Remove row highlight
        $.each(assemblies, function(assemblyId, assembly) {
            if ($.inArray(assemblyId, selectedAssemblyIds) !== -1) {
                // Select row
                $('.collection-assembly-list .assembly-list-item[data-assembly-id="' + assemblyId + '"]').addClass('row-selected');
                // Check checkbox
                $('.collection-assembly-list .assembly-list-item[data-assembly-id="' + assemblyId + '"] [type="checkbox"]').prop('checked', true);
            } else {
                // Deselect row
                $('.collection-assembly-list .assembly-list-item[data-assembly-id="' + assemblyId + '"]').removeClass('row-selected');
                // Check checkbox
                $('.collection-assembly-list .assembly-list-item[data-assembly-id="' + assemblyId + '"] [type="checkbox"]').prop('checked', false);
            }
        });

        triggerMapMarkers(collectionId, selectedAssemblyIds);

        // If only one assembly was selected then check radiobox
        if (selectedAssemblyIds.length === 1) {
            $('.collection-assembly-list .assembly-list-item[data-assembly-id="' + selectedAssemblyIds + '"] [type="radio"]').prop('checked', true);
        }

        // if (selectedAssemblyIds.split(',').length > 2) {
        //     $('.tree-controls-draw-subtree').attr('data-selected-node', selectedAssemblyIds.split(',')[0]);
        // }
    };

    // $('body').on('mouseenter', '.glyphicon-leaf', function(){
    //     var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
    //         assemblyId = $(this).closest('.assembly-list-item').attr('data-assembly-id'),
    //         branch = WGST.collection[collectionId].tree.canvas.branches[assemblyId],
    //         children = branch.parent.children;

    //     $('.collection-assembly-list .assembly-list-item .glyphicon-leaf').css('color', '#000');

    //     $.each(children, function(childCounter, child){
    //         $('.collection-assembly-list .assembly-list-item[data-assembly-id="' + child.id + '"] .glyphicon-leaf').css('color', 'blue');
    //     });
    // });
    // $('body').on('mouseleave', '.glyphicon-leaf', function(){
    //     $('.collection-assembly-list .assembly-list-item .glyphicon-leaf').css('color', '#000');
    // });

    // DEPRECATED
    // var renderCollectionFamily = function(collectionId) {
    //     var tree = WGST.collection[collectionId].tree.canvas;


    //     var branches = tree.branches;

    //     console.debug('branches');
    //     console.dir(branches);

    //     $.each(branches, function(branchId, branch){





    //         var childIds = branch.getChildIds();

    //         //console.debug('childIds:');
    //         //console.dir(childIds.split(','));

    //         if (branch.leaf) {
    //             $('.collection-assembly-list .assembly-list-item[data-assembly-id="' + branchId + '"] .assembly-list-generation').append(
    //                 //'<div>&#169; OK</div>'
    //                 '<span class="glyphicon glyphicon-leaf"></span>'
    //             );
    //         } else if (branchId === 'root') {
    //             $('.collection-assembly-list .assembly-list-item[data-assembly-id="' + branchId + '"] .assembly-list-generation').append(
    //                 //'<div>&#169; OK</div>'
    //                 '<span class="glyphicon glyphicon-plus"></span>'
    //             );
    //         } else {
    //             $.each(childIds.split(','), function(childIdCounter, childId){



    //                 $('.collection-assembly-list .assembly-list-item[data-assembly-id="' + childId + '"] .assembly-list-generation').append(
    //                     //'<span>{</span>'
    //                     '<span class="glyphicon glyphicon-tree-deciduous"></span>'
    //                     );
    //             });
    //         }

    //     });
    // };

    $('body').on('change', '.wgst-tree-control__change-node-label', function(){
        var selectedOption = $(this),
            collectionId = selectedOption.closest('.wgst-panel').attr('data-collection-id'),
            collectionTreeType = selectedOption.closest('.wgst-panel').attr('data-collection-tree-type');

        var treeCanvas = WGST.collection[collectionId].tree[collectionTreeType].canvas,
            assemblies = WGST.collection[collectionId].assemblies,
            assemblyId;

        if (selectedOption.val() === '1') {

            // Set user assembly id as node label
            for (assemblyId in assemblies) {
                if (assemblies.hasOwnProperty(assemblyId)) {
                    // Set label only to leaf nodes, filtering out the root node
                    if (treeCanvas.branches[assemblyId] && treeCanvas.branches[assemblyId].leaf) {
                        treeCanvas.branches[assemblyId].label = assemblies[assemblyId].ASSEMBLY_METADATA.userAssemblyId;                 
                    }
                }
            }
            
        } else if (selectedOption.val() === '2') {

            // Set user assembly id as node label
            for (assemblyId in assemblies) {
                if (assemblies.hasOwnProperty(assemblyId)) {
                    // Set label only to leaf nodes, filtering out the root node
                    if (treeCanvas.branches[assemblyId] && treeCanvas.branches[assemblyId].leaf) {
                        treeCanvas.branches[assemblyId].label = WGST.collection[collectionId].assemblies[assemblyId]['FP_COMP'].topScore.referenceId;              
                    }
                }
            }

        } else if (selectedOption.val() === '3') {

            // Set user assembly id as node label
            for (assemblyId in assemblies) {
                if (assemblies.hasOwnProperty(assemblyId)) {
                    // Set label only to leaf nodes, filtering out the root node
                    if (treeCanvas.branches[assemblyId] && treeCanvas.branches[assemblyId].leaf) {
                        treeCanvas.branches[assemblyId].label = (assemblies[assemblyId]['MLST_RESULT'].stType.length === 0 ? 'Not found': assemblies[assemblyId]['MLST_RESULT'].stType);               
                    }
                }
            }

        } else if (selectedOption.val() === '4') {

            var assemblyResistanceProfile,
                resistanceProfileString;

            // Set user assembly id as node label
            for (assemblyId in assemblies) {
                if (assemblies.hasOwnProperty(assemblyId)) {

                    assemblyResistanceProfile = assemblies[assemblyId].PAARSNP_RESULT.paarResult.resistanceProfile,
                    resistanceProfileString = createAssemblyResistanceProfilePreviewString(assemblyResistanceProfile, WGST.antibiotics);

                    // Set label only to leaf nodes, filtering out the root node
                    if (treeCanvas.branches[assemblyId] && treeCanvas.branches[assemblyId].leaf) {
                        treeCanvas.branches[assemblyId].label = resistanceProfileString;            
                    }
                }
            }

        } else if (selectedOption.val() === '5') {

            // Set user assembly id as node label
            for (assemblyId in assemblies) {
                if (assemblies.hasOwnProperty(assemblyId)) {
                    // Set label only to leaf nodes, filtering out the root node
                    if (treeCanvas.branches[assemblyId] && treeCanvas.branches[assemblyId].leaf) {
                        treeCanvas.branches[assemblyId].label = assemblies[assemblyId]['ASSEMBLY_METADATA'].geography.address;              
                    }
                }
            }
        }

        treeCanvas.draw();
    });

    $('body').on('change', '.wgst-tree-control__change-node-colour', function(){
        var selectedOption = $(this).find('option:selected'),
            collectionId = selectedOption.closest('.wgst-panel').attr('data-collection-id'),
            collectionTreeType = selectedOption.closest('.wgst-panel').attr('data-collection-tree-type');

        var tree = WGST.collection[collectionId].tree[collectionTreeType].canvas,
            assemblies = WGST.collection[collectionId].assemblies,
            assemblyId;

        if (selectedOption.val() === '0') {
            // Colour assembly nodes according to default colour
            for (assemblyId in assemblies) {
                if (assemblies.hasOwnProperty(assemblyId)) {
                    tree.setNodeColourAndShape(assemblyId, '#ffffff');
                }
            } // for
        } else {
            var ungroupedResistanceProfile,
                antibioticResistance;

            // Colour assembly nodes according to resistance profile of selected antibiotic
            for (assemblyId in assemblies) {
                if (assemblies.hasOwnProperty(assemblyId)) {

                    ungroupedResistanceProfile = assemblies[assemblyId].PAARSNP_RESULT.paarResult.ungroupedResistanceProfile;
                    antibioticResistance = ungroupedResistanceProfile[selectedOption.text()];

                    // Check assembly has resistance profile for this antibiotic
                    if (typeof antibioticResistance !== 'undefined') {
                        if (tree.branches[assemblyId] && tree.branches[assemblyId].leaf) {
                            if (antibioticResistance.resistanceState === 'RESISTANT') {
                                // Red
                                tree.setNodeColourAndShape(assemblyId, '#ff0000');                 
                            } else if (antibioticResistance.resistanceState === 'SENSITIVE') {
                                // Green
                                tree.setNodeColourAndShape(assemblyId, '#4dbd33');                 
                            } else if (antibioticResistance.resistanceState === 'UNKNOWN') {
                                // White
                                tree.setNodeColourAndShape(assemblyId, '#ffffff');
                            }
                        }                        
                    } else {
                    // Assembly has no resistance profile for this antibiotic
                        if (tree.branches[assemblyId] && tree.branches[assemblyId].leaf) {
                            // Black
                            tree.setNodeColourAndShape(assemblyId, '#ffffff');
                        }
                    }
                } // if
            } // for
        } // if
    });

    $('body').on('change', '.wgst-tree-control__change-tree-type', function(){
        var selectedOption = $(this).find('option:selected'),
            collectionId = selectedOption.closest('.wgst-panel').attr('data-collection-id'),
            collectionTreeType = selectedOption.closest('.wgst-panel').attr('data-collection-tree-type'),
            tree;

        // if ($(this).closest('.wgst-panel').attr('data-panel-name') === 'mergedCollectionTree') {
        //     tree = WGST.mergedCollectionTree[collectionId].tree.canvas;
        // } else {
        //     tree = WGST.collection[collectionId].tree.canvas;
        // }

        tree = WGST.collection[collectionId].tree[collectionTreeType].canvas;
        tree.setTreeType(selectedOption.val());
    });

    /**
     * Description
     * @method renderCollectionTree
     * @param {} collectionId
     * @param {} collectionTreeType
     * @param {} options
     * @return 
     */
    var renderCollectionTree = function(collectionId, collectionTreeType, options) {
        console.log('[WGST] Rendering ' + collectionId + ' collection ' +  collectionTreeType + ' tree');

        // ----------------------------------------
        // Create new panel from template
        // ----------------------------------------
        var collectionTreePanelId = 'collectionTree' + '__' + collectionId + '__' + collectionTreeType,
            collectionTreePanelTemplateSource = $('.wgst-template[data-template-id="collectionTreePanel"]').html(),
            collectionTreePanelTemplate = Handlebars.compile(collectionTreePanelTemplateSource),
            collectionTreeName = WGST.collection[collectionId].tree[collectionTreeType].name,
            templateContext = {
                attributePanelId: collectionTreePanelId,
                attributeCollectionId: collectionId,
                attributeCollectionTreeType: collectionTreeType,
                collectionTreeTitle: collectionTreeName
            },
            collectionTreePanelHtml,
            $collectionTreePanel;

        if (typeof options !== 'undefined') {
            $.extend(templateContext, options);
        }

        collectionTreePanelHtml = collectionTreePanelTemplate(templateContext),

        $('body').prepend(collectionTreePanelHtml);

        $collectionTreePanel = $('.wgst-panel[data-panel-name="' + collectionTreePanelId + '"]');

        // Register new panel
        WGST.panels[collectionTreePanelId] = WGST.panels.collectionTree;
        activatePanel(collectionTreePanelId);
        // Init jQuery UI draggable interaction        
        $collectionTreePanel.draggable({
            handle: $collectionTreePanel.find('.wgst-draggable-handle'),
            appendTo: "body",
            scroll: false,
            /**
             * Description
             * @method stop
             * @param {} event
             * @param {} ui
             * @return 
             */
            stop: function(event, ui) {
                // Store current panel position
                var panelName = ui.helper.attr('data-panel-name');
                WGST.panels[panelName].top = ui.position.top;
                WGST.panels[panelName].left = ui.position.left;
            }
        });
        // Make sure this PhyloCanvas element has unique id
        var phyloCanvasElementId = 'phylocanvas_' + collectionId + '_' + collectionTreeType;
        $collectionTreePanel.find('.wgst-tree-content').attr('id', phyloCanvasElementId);
        // Set collection tree type
        $collectionTreePanel.find('.wgst-tree-content').attr('data-collection-tree-type', collectionTreeType);

        endPanelLoadingIndicator(collectionTreePanelId);

        // ----------------------------------------
        // Render collection tree
        // ----------------------------------------

        // // Remove previosly rendered collection tree
        // $collectionTreePanel.find('.wgst-tree-content').html('');
        // // Attach collection id
        // $collectionTreePanel.find('.wgst-tree-content').attr('id', 'phylocanvas_' + collectionId);
        // // Set collection tree type
        // $collectionTreePanel.find('.wgst-tree-content').attr('data-collection-tree-type', 'CORE_TREE_RESULT');

        // Render collection tree
        //renderCollectionTree(collectionId, 'CORE_TREE_RESULT');

        
        //showPanelBodyContent('collectionTree');

        // ----------------------------------------
        // Init tree
        // ----------------------------------------
        var tree = WGST.collection[collectionId].tree[collectionTreeType],
            assemblies = WGST.collection[collectionId].assemblies,
            assemblyId;

        tree.canvas = new PhyloCanvas.Tree(document.getElementById(phyloCanvasElementId), { history_collapsed: true });
        tree.canvas.parseNwk(tree.data);
        tree.canvas.treeType = 'rectangular';

        var treeCanvas = tree.canvas;

        treeCanvas.on('selected', function(event) {
            var selectedNodeIds = event.nodeIds;

            /**
             * Unfortunately selectedNodeIds can return string
             * if only one node has been selected.
             *
             * In that case convert it to array.
             */
            if (typeof selectedNodeIds === 'string') {
                selectedNodeIds = [selectedNodeIds];
            }

           selectTreeNodes(collectionId, selectedNodeIds); 
        });

        // Set user assembly id as node label
        for (assemblyId in assemblies) {
            if (assemblies.hasOwnProperty(assemblyId)) {
                // Set label only to leaf nodes, filtering out the root node
                if (treeCanvas.branches[assemblyId].leaf) {
                    treeCanvas.branches[assemblyId].label = assemblies[assemblyId].ASSEMBLY_METADATA.userAssemblyId;                 
                }
            }
        } // for
        
        // Need to resize to fit it correctly
        treeCanvas.resizeToContainer();
        // Need to redraw to actually see it
        treeCanvas.drawn = false;
        treeCanvas.draw();

        // Get order of nodes
        var leaves = treeCanvas.leaves;
        leaves.sort(function(leafOne, leafTwo){
            return leafOne.centery - leafTwo.centery;
        });

        tree.leavesOrder = leaves;

        // ====================================================================================================================
        // For dev only
        // ====================================================================================================================

        // Replace user assembly id with assembly id
        var newickString = tree.data;

        for (assemblyId in assemblies) {
            if (assemblies.hasOwnProperty(assemblyId)) {
                newickString = newickString.replace(assemblyId, assemblies[assemblyId].ASSEMBLY_METADATA.userAssemblyId);
            }
        }

        console.debug('» [WGST][DEV] Parsed Newick String:');
        console.log('» Uncomment to see.');
        //console.log(newickString);

        WGST.collection[collectionId].tree[collectionTreeType].newickStringWithLabels = newickString;

        // ====================================================================================================================
    
        // // Populate list of antibiotics
        // var selectAntibioticInputElement = $('#select-tree-node-antibiotic'),
        //     antibioticGroupName,
        //     antibioticName,
        //     antibioticNames = [],
        //     antibioticOptionHtmlElements = {};
        //     //antibiotics = {};

        // for (antibioticGroupName in WGST.antibiotics) {
        //     for (antibioticName in WGST.antibiotics[antibioticGroupName]) {
        //         //antibiotics[antibioticName] = WGST.antibiotics[antibioticGroupName][antibioticName];
        //         antibioticNames.push(antibioticName);
        //         antibioticOptionHtmlElements[antibioticName] = '<option value="' + antibioticName.replace(WGST.antibioticNameRegex, '_').toLowerCase() + '">' + antibioticName + '</option>';
        //     }
        // }

        // // Sort antibiotic names
        // antibioticNames.sort();

        // var antibioticCounter = antibioticNames.length;

        // for (antibioticCounter = 0; antibioticCounter < antibioticNames.length;) {
        //     antibioticName = antibioticNames[antibioticCounter];
        //     selectAntibioticInputElement.append($(antibioticOptionHtmlElements[antibioticName]));
            
        //     antibioticCounter = antibioticCounter + 1;
        // }

        populateListOfAntibiotics($collectionTreePanel.find('.wgst-tree-control__change-node-colour'));

        // Need to resize to fit it correctly
        treeCanvas.resizeToContainer();
        // Need to redraw to actually see it
        treeCanvas.drawn = false;
        treeCanvas.draw();
    };

    // // Init map
    // WGST.geo.map.init();

    /**
     * Description
     * @method deselectAllTreeNodes
     * @param {} collectionId
     * @return 
     */
    var deselectAllTreeNodes = function(collectionId) {
        var tree = WGST.collection[collectionId].tree['CORE_TREE_RESULT'].canvas;

        // Workaround
        // TO DO: Refactor using official API
        tree.selectNodes('');
    };

    $('.tree-controls-select-none').on('click', function() {

        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id');
            //tree = WGST.collection[collectionId].tree.canvas;

        deselectAllTreeNodes(collectionId);

        // This is a workaround
        // TO DO: Refactor using official API
        //tree.selectNodes('');

        //showRepresentativeTreeNodesOnMap('');
    });

    $('.tree-controls-select-all').on('click', function() {

        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            tree = WGST.collection[collectionId].tree['CORE_TREE_RESULT'].canvas;
        
        //console.debug(WGST.collection[collectionId]);
        //console.debug(tree);

        // Get all assembly ids in this tree

        var leaves = tree.leaves,
            leafCounter = leaves.length,
            assemblyIds = [],
            assemblyId;

        // Concatenate all assembly ids into one string
        for (; leafCounter !== 0;) {
            leafCounter = leafCounter - 1;

            assemblyId = leaves[leafCounter].id;
            assemblyIds.push(assemblyId);

            // if (assemblyIds.length > 0) {
            //     assemblyIds = assemblyIds + ',' + leaves[leafCounter].id;
            // } else {
            //     assemblyIds = leaves[leafCounter].id;
            // }
        }

        // This is a workaround
        // TO DO: Refactor using official API
        tree.root.setSelected(true, true);
        tree.draw();

        //showRepresentativeTreeNodesOnMap(nodeIds);

        showCollectionMetadataOnMap(collectionId, assemblyIds);
    });

    /**
     * Description
     * @method showCollectionMetadataOnMap
     * @param {} collectionId
     * @param {} assemblyIds
     * @return 
     */
    var showCollectionMetadataOnMap = function(collectionId, assemblyIds) {

        WGST.collection[collectionId].geo = WGST.collection[collectionId].geo || {};

        var collectionTree = WGST.collection[collectionId].tree.canvas,
            existingMarkers = WGST.collection[collectionId].geo.markers,
            existingMarkerCounter = existingMarkers.length;

        // Remove existing markers
        for (; existingMarkerCounter !== 0;) {
            existingMarkerCounter = existingMarkerCounter - 1;
            // Remove marker
            existingMarkers[existingMarkerCounter].setMap(null);
        }
        WGST.collection[collectionId].geo.markers = [];

        // Reset marker bounds
        WGST.geo.map.markerBounds = new google.maps.LatLngBounds();

        // Create new markers
        if (assemblyIds.length > 0) {
            var assemblyCounter = assemblyIds.length,
                assemblyId = '',
                assemblyMetadata = {},
                latitude = {},
                longitude = {};

            // For each assembly create marker
            for (; assemblyCounter !== 0;) {
                assemblyCounter = assemblyCounter - 1;

                assemblyId = assemblyIds[assemblyCounter];
                assemblyMetadata = WGST.collection[collectionId].assemblies[assemblyId]['ASSEMBLY_METADATA'];
                latitude = assemblyMetadata.geography.position.latitude;
                longitude = assemblyMetadata.geography.position.longitude;

                //Check if both latitude and longitude provided
                if (latitude && longitude) {
                    console.log("[WGST] Marker's latitude: " + latitude);
                    console.log("[WGST] Marker's longitude: " + longitude);

                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(latitude, longitude),
                        map: WGST.geo.map.canvas,
                        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                        // This must be optimized, otherwise white rectangles will be displayed when map is manipulated
                        // However, there is a known case when this should be false: http://www.gutensite.com/Google-Maps-Custom-Markers-Cut-Off-By-Canvas-Tiles
                        optimized: true
                    });

                    // Set marker
                    WGST.collection[collectionId].assemblies[assemblyId].geo = WGST.collection[collectionId].assemblies[assemblyId].geo || {};
                    WGST.collection[collectionId].assemblies[assemblyId].geo.marker = marker;

                    // Store list of assembly ids with markers
                    WGST.collection[collectionId].geo.markers.push(assemblyIds);
                    
                    // Extend markerBounds with each metadata marker
                    WGST.geo.map.markerBounds.extend(marker.getPosition());
                } // if
            } // for
        } else { // No assemblies were selected
            // Show Europe
            WGST.geo.map.canvas.panTo(new google.maps.LatLng(48.6908333333, 9.14055555556));
            WGST.geo.map.canvas.setZoom(5);
        }
    };

    // --------------------------------------------------------------------------------------
    // WGSA Ring
    // To do: add WGSA namespace
    // To do: rename WGST to WGSA
    // --------------------------------------------------------------------------------------
    var ringTimeout,
        // Are you dragging it?
        ringDragging = false,
        // Have you clicked on it?
        ringFixed = false;

    (function(){

        // Init jQuery UI draggable interaction
        $('[data-wgst-js="ring"]').draggable({
            //handle: '.wgst-ring',
            appendTo: 'body',
            scroll: false,
            containment: "window"
        });

        $('.wgst-ring-content').on('mouseover', function(){
            if (ringDragging === false) {
                ringTimeout = setTimeout(function(){
                    if (typeof ringTimeout !== 'undefined' && ringDragging === false) {
                        ringTimeout = undefined;
                        $('.wgst-panel--visible').fadeOut();
                    }
                }, 300);
            }
        });
        $('.wgst-ring-content').on('mouseout', function(){
            if (ringDragging === false && ringFixed === false) {
                ringTimeout = undefined;
                $('.wgst-panel--visible').fadeIn();
            }
        });
        $('[data-wgst-js="ring"]').on('mousedown', function(){
            console.log('mouse down');
            ringTimeout = undefined;
            ringDragging = true;
            if (ringFixed === false) {
                $('.wgst-ring-content').css('background-color', '#999');                
            }
        });
        $('[data-wgst-js="ring"]').on('mouseup', function(){
            console.log('mouse up');
            ringTimeout = undefined;
            ringDragging = false;
            if (ringFixed === false) {
                $('.wgst-ring-content').css('background-color', '');                
            }
        });
        $('.wgst-ring-content').on('click', function(){
            console.log('ring click');
            if (ringFixed === false) {
                ringFixed = true;
                $(this).addClass('wgst-ring-fixed');
                $('.wgst-panel--visible').fadeOut();
            } else {
                ringFixed = false;
                $(this).removeClass('wgst-ring-fixed');
            }
        });
        $('.wgst-ring-content').on('mousedown', function(event){
            console.log('mouse down');
            event.stopPropagation();
        });        
    }());







    var generateYearHtmlElements = function(startYear, endYear) {
        var yearCounter = endYear,
            yearElementTemplate = '<option value="{{year}}">{{year}}</option>',
            yearElements = '',
            yearElement;

        for (; yearCounter !== startYear - 1;) {
            yearElement = yearElementTemplate.replace(/{{year}}/g, yearCounter);
            yearElements = yearElements + yearElement;
            yearCounter = yearCounter - 1;
        } // for

        return yearElements;
    };

    var generateYears = function(startYear, endYear) {
        var years = [],
            yearCounter = endYear;

        for (; yearCounter !== startYear - 1;) {
            years.push(yearCounter);
            yearCounter = yearCounter - 1;
        }

        return years;
    };

    var generateMonthHtmlElements = function() {
        var monthCounter = 0,
            listOfMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthElementTemplate = '<option value="{{monthCounter}}">{{month}}</option>',
            monthElements = '',
            monthElement;

        for (; monthCounter < listOfMonths.length;) {
            monthElement = monthElementTemplate.replace(/{{month}}/g, listOfMonths[monthCounter]);
            monthElement = monthElement.replace(/{{monthCounter}}/g, monthCounter);
            monthElements = monthElements + monthElement;
            monthCounter = monthCounter + 1;
        } // for

        return monthElements;
    };

    var generateMonths = function() {
        var listOfMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthCounter = 0;

        listOfMonths = listOfMonths.map(function(monthName, index, array){
            return {
                name: monthName,
                number: index
            }
        });

        return listOfMonths;
    };

    var generateDayHtmlElements = function(year, month) {

        if (typeof year === 'undefined' || typeof month === 'undefined') {
            return '';
        }

        var totalNumberOfDays = getTotalNumberOfDaysInMonth(year, month),
            dayCounter = 0,
            dayElementTemplate = '<option value="{{day}}">{{day}}</option>',
            dayElements = '',
            dayElement;

        while (dayCounter < totalNumberOfDays) {
            dayCounter = dayCounter + 1;
            dayElement = dayElementTemplate.replace(/{{day}}/g, dayCounter);
            dayElements = dayElements + dayElement;
        }

        return dayElements;
    };

    var generateDays = function(year, month) {

        if (typeof year === 'undefined' || typeof month === 'undefined') {
            return '';
        }

        var days = [],
            totalNumberOfDays = getTotalNumberOfDaysInMonth(year, month),
            dayCounter = 0;

        while (dayCounter < totalNumberOfDays) {
            dayCounter = dayCounter + 1;
            days.push(dayCounter);
        }

        return days;
    };

    /**
     * Description
     * @method getTotalNumberOfDaysInMonth
     * @param {} year
     * @param {} month
     * @return BinaryExpression
     */
    var getTotalNumberOfDaysInMonth = function(year, month) {
        // http://www.dzone.com/snippets/determining-number-days-month
        return 32 - new Date(year, month, 32).getDate();
    };

    /**
     * Description
     * @method populateDaySelect
     * @param {} $selectElement
     * @param {} selectedYear
     * @param {} selectedMonth
     * @return 
     */
    var populateDaySelect = function($selectElement, selectedYear, selectedMonth) {
        // Remove previous list of days and append a new one
        $selectElement.html('')
            .append($('<option value="-1">Choose day</option>'))
            .append(generateDayHtmlElements(selectedYear, selectedMonth));
    };

    $('.wgst-assembly-upload__metadata').on('change', '.assembly-timestamp-input', function(){

        var $select = $(this),
            fileId = $select.attr('data-file-id'),
            fileName = $select.attr('data-file-name'),
            selectedYear = $('.assembly-timestamp-input-year[data-file-name="' + fileName +'"]').val(),
            selectedMonth = $('.assembly-timestamp-input-month[data-file-name="' + fileName +'"]').val(),
            $timestampDaySelect = $('.assembly-timestamp-input-day[data-file-name="' + fileName +'"]'),
            selectedDay = $timestampDaySelect.val(),
            timestampPart = $select.attr('data-timestamp-input');

        // ----------------------------------------------------
        // Create list of days
        // ----------------------------------------------------
        if (timestampPart === 'year' || timestampPart === 'month') {
            // If year and month selected then populate days select
            if (selectedYear !== '-1' && selectedMonth !== '-1') {
                populateDaySelect($timestampDaySelect, selectedYear, selectedMonth);
                // Select the same day as previously if newly selected year/month combination has this day
                if (selectedDay !== '-1') {
                    $timestampDaySelect.find('option:contains("' + selectedDay + '")').prop('selected', true);   
                }
            }
        } // if

        // ----------------------------------------------------
        // Show next input of date metadata
        // ----------------------------------------------------
        if (timestampPart === 'year') {
            $('.assembly-metadata-timestamp-month[data-file-id="' + fileId + '"]').removeClass('hide-this');
        } else if (timestampPart === 'month') {
            $('.assembly-metadata-timestamp-day[data-file-id="' + fileId + '"]').removeClass('hide-this');
        }

        // ----------------------------------------------------
        // Store date in assembly metadata object
        // ----------------------------------------------------
        var date;

        // If at least year is provided then set metadata datetime
        if (selectedYear !== '-1') {
            // Check if month is provided
            if (selectedMonth !== '-1') {
                // Check if day is provided
                if (selectedDay !== '-1') {
                    date = new Date(selectedYear, selectedMonth, selectedDay);

                // No day is provided
                } else {
                    date = new Date(selectedYear, selectedMonth);
                }

            // No month is provided
            } else {
                date = new Date(selectedYear);
            }

            WGST.upload.assembly[fileName].metadata = WGST.upload.assembly[fileName].metadata || {};
            WGST.upload.assembly[fileName].metadata.datetime = date; 
        } // if

        // ---------------------------------------------------------------
        // Show next assembly metadata block if at least year is provided
        // ---------------------------------------------------------------
        if (selectedYear !== '-1') {
            // Show next metadata form block
            $select.closest('.assembly-metadata-block').next('.assembly-metadata-block').fadeIn();
            // Scroll to the next form block
            $select.closest('.assembly-metadata-block').animate({scrollTop: $select.closest('.assembly-metadata-block').height()}, 400);

            updateMetadataProgressBar();
        } // if
    });






        // Array of objects that store content of FASTA file and user-provided metadata
    var fastaFilesAndMetadata = {},
        // Stores file name of displayed FASTA file
        selectedFastaFileName = '',
        // Element on which user can drag and drop files
        dropZone = document.getElementsByTagName('body')[0],
        // Store individual assembly objects used for displaying data
        assemblies = [],
        // DNA sequence regex
        dnaSequenceRegex = /^[CTAGNUX]+$/i,
        // Count total number of contigs in all selected assemblies
        totalContigsSum = 0,
        totalNumberOfContigsDropped = 0;


    //
    // Breaking parseFastaFile function into multiple functions
    //
    var extractContigsFromFastaFileString = function(fastaFileString) {
        var contigs = [];
        //
        // Trim, and split assembly string into array of individual contigs
        // then filter that array by removing empty strings
        //
        contigs = fastaFileString.trim().split('>').filter(function(element) {
            return (element.length > 0);
        });

        return contigs;
    };
    var splitContigIntoParts = function(contig) {
        var contigParts = [];

        // Split contig string into parts
        contigParts = contig.split(/\n/)
            // Filter out empty parts
            .filter(function(part){
                return (part.length > 0);
            });

        // Trim each contig part
        contigParts.map(function(contigPart){
            return contigPart.trim();
        });

        return contigParts;
    };
    var extractDnaStringIdFromContig = function(contig) {
        var contigParts = splitContigIntoParts(contig);

        // Parse DNA string id
        var dnaStringId = contigParts[0].trim().replace('>','');

        return dnaStringId;
    };
    WGST.regex = WGST.regex || {};
    WGST.regex.DNA_SEQUENCE = /^[CTAGNUX]+$/i;
    var extractDnaStringFromContig = function(contig) {
        var contigParts = splitContigIntoParts(contig);
        //
        // DNA sequence can contain:
        // 1) [CTAGNUX] characters.
        // 2) White spaces (e.g.: new line characters).
        //
        // The first line of FASTA file contains id and description.
        // The second line theoretically contains comments (starts with #).
        //
        // To parse FASTA file you need to:
        // 1. Separate assembly into individual contigs by splitting file's content by > character.
        //    Note: id and description can contain > character.
        // 2. For each sequence: split it by a new line character, 
        //    then convert resulting array to string ignoring the first (and rarely the second) element of that array.
        //
        // -----------------------------
        // Parse DNA sequence string
        // -----------------------------
        //
        // Create sub array of the contig parts array - cut the first element (id and description).
        var contigPartsWithNoIdAndDescription = contigParts.splice(1, contigParts.length);
        //
        // Very rarely the second line can be a comment
        // If the first element won't match regex then assume it is a comment
        //
        if (! WGST.regex.DNA_SEQUENCE.test(contigPartsWithNoIdAndDescription[0].trim())) {
            // Remove comment element from the array
            contigPartsWithNoIdAndDescription = contigPartsWithNoIdAndDescription.splice(1, contigPartsWithNoIdAndDescription.length);
        }
        //
        // Contig string without id, description, comment is only left with DNA sequence string(s).
        //
        //
        // Convert array of DNA sequence substrings into a single string
        // Remove whitespace
        //
        var dnaString = contigPartsWithNoIdAndDescription.join('').replace(/\s/g, '');

        return dnaString;
    };
    var extractDnaStringsFromContigs = function(contigs) {
        var dnaStrings = [],
            dnaString;
        contigs.forEach(function(contig) {
            dnaString = extractDnaStringFromContig(contig);
            dnaStrings.push(dnaString);
        });
        return dnaStrings;
    };
    var isValidDnaString = function(dnaString) {
        return WGST.regex.DNA_SEQUENCE.test(dnaString);
    };
    var isValidContig = function(contig) {
        var contigParts = splitContigIntoParts(contig);
        var dnaString = extractDnaStringFromContig(contig);

        return (contigParts.length > 1 && isValidDnaString(dnaString));
    };
    var calculateN50 = function(dnaSequenceStrings) {
        //
        // Calculate N50
        // http://www.nature.com/nrg/journal/v13/n5/box/nrg3174_BX1.html
        //

        // Order array by sequence length DESC
        var sortedDnaSequenceStrings = dnaSequenceStrings.sort(function(a, b){
            return b.length - a.length;
        });

        // Calculate sums of all nucleotides in this assembly by adding current contig's length to the sum of all previous contig lengths
        // Contig length === number of nucleotides in this contig
        var assemblyNucleotideSums = [],
            // Count sorted dna sequence strings
            sortedDnaSequenceStringCounter = 0;

        for (; sortedDnaSequenceStringCounter < sortedDnaSequenceStrings.length; sortedDnaSequenceStringCounter++) {
            if (assemblyNucleotideSums.length > 0) {
                // Add current contig's length to the sum of all previous contig lengths
                assemblyNucleotideSums.push(sortedDnaSequenceStrings[sortedDnaSequenceStringCounter].length + assemblyNucleotideSums[assemblyNucleotideSums.length - 1]);
            } else {
                // This is a "sum" of a single contig's length
                assemblyNucleotideSums.push(sortedDnaSequenceStrings[sortedDnaSequenceStringCounter].length);
            }
        }

        // Calculate one-half of the total sum of all nucleotides in the assembly
        var assemblyNucleotidesHalfSum = Math.floor(assemblyNucleotideSums[assemblyNucleotideSums.length - 1] / 2);

        //
        // Sum lengths of every contig starting from the longest contig
        // until this running sum equals one-half of the total length of all contigs in the assembly.
        //

        // Store nucleotides sum
        var assemblyNucleotidesSum = 0,
            // N50 object
            assemblyN50 = {},
            // Count again sorted dna sequence strings
            sortedDnaSequenceStringCounter = 0;

        for (; sortedDnaSequenceStringCounter < sortedDnaSequenceStrings.length; sortedDnaSequenceStringCounter++) {
            // Update nucleotides sum
            assemblyNucleotidesSum = assemblyNucleotidesSum + sortedDnaSequenceStrings[sortedDnaSequenceStringCounter].length;
            // Contig N50 of an assembly is the length of the shortest contig in this list
            // Check if current sum of nucleotides is greater or equals to half sum of nucleotides in this assembly
            if (assemblyNucleotidesSum >= assemblyNucleotidesHalfSum) {
                assemblyN50['sequenceNumber'] = sortedDnaSequenceStringCounter + 1;
                assemblyN50['sum'] = assemblyNucleotidesSum;
                assemblyN50['sequenceLength'] = sortedDnaSequenceStrings[sortedDnaSequenceStringCounter].length;
                break;
            }
        }

        return assemblyN50;
    };
    var calculateTotalNumberOfNucleotidesInDnaStrings = function(dnaStrings) {
        var totalNumberOfNucleotidesInDnaStrings = 0;
        dnaStrings.forEach(function(dnaString, index, array){
            totalNumberOfNucleotidesInDnaStrings = totalNumberOfNucleotidesInDnaStrings + dnaString.length;
        });
        return totalNumberOfNucleotidesInDnaStrings;

        //
        // Reduce doesn't seem to work as expected
        //
        // var totalNumberOfNucleotidesInDnaStrings = dnaStrings.reduce(function(previousDnaString, currentDnaString, index, array) {
        //     return previousDnaString.length + currentDnaString.length;
        // }, '');
        // return totalNumberOfNucleotidesInDnaStrings;
    };
    var calculateAverageNumberOfNucleotidesInDnaStrings = function(dnaStrings) {
        var totalNumberOfNucleotidesInDnaStrings = calculateTotalNumberOfNucleotidesInDnaStrings(dnaStrings);
        var numberOfDnaStrings = dnaStrings.length;
        var averageNumberOfNucleotidesInDnaStrings = Math.floor(totalNumberOfNucleotidesInDnaStrings / numberOfDnaStrings);
        return averageNumberOfNucleotidesInDnaStrings;
    };
    var calculateSmallestNumberOfNucleotidesInDnaStrings = function(dnaStrings) {
        var numberOfNucleotidesInDnaStrings = dnaStrings.map(function(dnaString){
            return dnaString.length;
        });
        var smallestNumberOfNucleotidesInDnaStrings = numberOfNucleotidesInDnaStrings.reduce(function(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString, index, array){
            return Math.min(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString);
        });
        return smallestNumberOfNucleotidesInDnaStrings;
    };
    var calculateBiggestNumberOfNucleotidesInDnaStrings = function(dnaStrings) {
        var numberOfNucleotidesInDnaStrings = dnaStrings.map(function(dnaString){
            return dnaString.length;
        });
        var biggestNumberOfNucleotidesInDnaStrings = numberOfNucleotidesInDnaStrings.reduce(function(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString, index, array){
            return Math.max(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString);
        });
        return biggestNumberOfNucleotidesInDnaStrings;
    };
    var calculateSumsOfNucleotidesInDnaStrings = function(dnaStrings) {
        //
        // Get array of sums: [1, 2, 3, 6, 12, etc]
        //

        //
        // Sort dna strings by their length
        //
        var sortedDnaStrings = dnaStrings.sort(function(a, b){
            return b.length - a.length;
        });

        //
        // Calculate sums of all nucleotides in this assembly by adding current contig's length to the sum of all previous contig lengths
        //
        var sumsOfNucleotidesInDnaStrings = [];
        sortedDnaStrings.forEach(function(sortedDnaString, index, array){
            if (sumsOfNucleotidesInDnaStrings.length === 0) {
                sumsOfNucleotidesInDnaStrings.push(sortedDnaString.length);
            } else {
                sumsOfNucleotidesInDnaStrings.push(sortedDnaString.length + sumsOfNucleotidesInDnaStrings[sumsOfNucleotidesInDnaStrings.length - 1]);
            }
        });

        return sumsOfNucleotidesInDnaStrings;

        //
        // Deprecated: previously working solution
        //
        // // Calculate sums of all nucleotides in this assembly by adding current contig's length to the sum of all previous contig lengths
        // // Contig length === number of nucleotides in this contig
        // var assemblyNucleotideSums = [],
        //     // Count sorted dna sequence strings
        //     sortedDnaStringCounter = 0;

        // for (; sortedDnaStringCounter < sortedDnaStrings.length; sortedDnaStringCounter++) {
        //     if (assemblyNucleotideSums.length > 0) {
        //         // Add current contig's length to the sum of all previous contig lengths
        //         assemblyNucleotideSums.push(sortedDnaStrings[sortedDnaStringCounter].length + assemblyNucleotideSums[assemblyNucleotideSums.length - 1]);
        //     } else {
        //         // This is a "sum" of a single contig's length
        //         assemblyNucleotideSums.push(sortedDnaStrings[sortedDnaStringCounter].length);
        //     }
        // }
        // return assemblyNucleotideSums;
    };

    //
    // Once I will migrate to React.js this function will not be needed anymore
    //
    // var showDroppedAssembly = function(fileUid) {

    //     var uid = '';
    //     if (typeof fileUid === 'undefined') {
    //         // Show first one
    //         uid = WGST.dragAndDrop.loadedFiles[0].uid;
    //         console.log('A: Showing this dropped assembly: ' + WGST.dragAndDrop.loadedFiles[0].uid);
    //         //WGST.dragAndDrop.droppedFiles[0].uid
    //     } else {
    //         console.log('B: Showing this dropped assembly: ' + fileUid);
    //         uid = fileUid;
    //     }

    //     $('.wgst-upload-assembly__analytics').hide();
    //     $('.wgst-upload-assembly__analytics[data-file-uid="' + uid + '"]').show();
    //     $('.wgst-upload-assembly__metadata').hide();
    //     $('.wgst-upload-assembly__metadata[data-file-uid="' + uid + '"]').show();

    //     //
    //     // Quite an elegant way of finding object by it's property value in array
    //     //
    //     var loadedFile = WGST.dragAndDrop.loadedFiles.filter(function(loadedFile) {
    //         return loadedFile.uid === uid; // filter out appropriate one
    //     })[0];

    //     // Set file name in metadata panel title
    //     $('.wgst-panel__assembly-upload-metadata .header-title small').text(loadedFile.file.name);

    //     // Set file name in analytics panel title
    //     $('.wgst-panel__assembly-upload-analytics .header-title small').text(loadedFile.file.name);
    
    //     // Set file name in navigator
    //     $('.assembly-file-name').text(loadedFile.file.name);
    // };
    var validateContigs = function(contigs) {

        var validatedContigs = {
            valid: [],
            invalid: []
        };

        //
        // Validate each contig
        //
        contigs.forEach(function(contig, index, contigs) {

            var contigParts = splitContigIntoParts(contig);
            var dnaString = extractDnaStringFromContig(contig);
            var dnaStringId = extractDnaStringIdFromContig(contig);

            // Valid contig
            if (isValidContig(contig)) {
                validatedContigs.valid.push({
                    id: dnaStringId,
                    dnaString: dnaString
                });

            // Invalid contig
            } else {
                validatedContigs.invalid.push({
                    id: dnaStringId,
                    dnaString: dnaString
                });
            }
        });

        return validatedContigs;
    };

    //
    // Refactor this function
    //
    var parseFastaFile = function(event, fileCounter, file, droppedFiles, collectionId, fileUid) {

        // Init assembly upload metadata
        WGST.upload.assembly[file.name] = {
            metadata: {}
        };

        var fastaFileString = event.target.result;
        var contigs = extractContigsFromFastaFileString(fastaFileString);
        validateContigs(contigs);

        // Start counting assemblies from 1, not 0
        fileCounter = fileCounter + 1;

        assemblies[fileCounter] = {
            'name': file.name,
            'id': '',
            'contigs': {
                'total': contigs.length,
                'invalid': 0,
                'individual': []
            }
        };

        // Store fasta file and metadata
        fastaFilesAndMetadata[file.name] = {
            // Cut FASTA file extension from the file name
            //name: file.name.substr(0, file.name.lastIndexOf('.')),
            name: file.name,
            assembly: event.target.result,
            metadata: {}
        };

        var dnaStrings = extractDnaStringsFromContigs(contigs);
        var assemblyN50 = calculateN50(dnaStrings);
        var dnaStrings = extractDnaStringsFromContigs(contigs);
        var totalNumberOfNucleotidesInDnaStrings = calculateTotalNumberOfNucleotidesInDnaStrings(dnaStrings);
        var averageNumberOfNucleotidesInDnaStrings = calculateAverageNumberOfNucleotidesInDnaStrings(dnaStrings);
        var smallestNumberOfNucleotidesInDnaStrings = calculateSmallestNumberOfNucleotidesInDnaStrings(dnaStrings);
        var biggestNumberOfNucleotidesInDnaStrings = calculateBiggestNumberOfNucleotidesInDnaStrings(dnaStrings);

        console.log('[WGST] * dev * dnaStrings:');
        console.dir(dnaStrings);
        console.log('[WGST] * dev * totalNumberOfNucleotidesInDnaStrings: ' + totalNumberOfNucleotidesInDnaStrings);
        console.log('[WGST] * dev * averageNumberOfNucleotidesInDnaStrings: ' + averageNumberOfNucleotidesInDnaStrings);
        console.log('[WGST] * dev * smallestNumberOfNucleotidesInDnaStrings: ' + smallestNumberOfNucleotidesInDnaStrings);
        console.log('[WGST] * dev * biggestNumberOfNucleotidesInDnaStrings: ' + biggestNumberOfNucleotidesInDnaStrings);

        totalNumberOfContigsDropped = totalNumberOfContigsDropped + contigs.length;

        // Show average number of contigs per assembly
        $('.assembly-sequences-average').text(Math.floor(totalNumberOfContigsDropped / droppedFiles.length));




        //
        // 
        // Render dropped assembly analytics
        //
        //
        var droppedAssemblyAnalyticsContext = {
            name: assemblies[fileCounter]['name'],
            fileCounter: fileCounter,
            assemblyFileId: fileUid,
            // Print a number with commas as thousands separators
            // http://stackoverflow.com/a/2901298
            totalNumberOfNucleotidesInDnaStrings: totalNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            totalNumberOfContigs: contigs.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            smallestNumberOfNucleotidesInDnaStrings: smallestNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            averageNumberOfNucleotidesInDnaStrings: averageNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            biggestNumberOfNucleotidesInDnaStrings: biggestNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            contigN50: assemblyN50['sequenceLength'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        };

        //console.debug('droppedAssemblyAnalyticsContext:');
        //console.dir(droppedAssemblyAnalyticsContext);

        var droppedAssemblyAnalyticsTemplateHtml = $('.wgst-template[data-template-id="droppedAssemblyAnalytics"]').html();
        var droppedAssemblyAnalyticsTemplate = Handlebars.compile(droppedAssemblyAnalyticsTemplateHtml);
        var droppedAssemblyAnalyticsHtml = droppedAssemblyAnalyticsTemplate(droppedAssemblyAnalyticsContext);

        $('.wgst-assembly-upload__analytics ul').append($(droppedAssemblyAnalyticsHtml));




        //
        // 
        // Render dropped assembly metadata form
        //
        //
        var droppedAssemblyMetadataFormContext = {
            name: assemblies[fileCounter]['name'],
            fileCounter: fileCounter,
            assemblyFileId: fileUid,
            listOfYears: generateYears(1940, 2014),
            listOfMonths: generateMonths(),
            listOfDays: generateDays()
        };

        //console.debug('droppedAssemblyMetadataFormContext:');
        //console.dir(droppedAssemblyMetadataFormContext);

        var droppedAssemblyMetadataFormTemplateHtml = $('.wgst-template[data-template-id="droppedAssemblyMetadataForm"]').html();
        var droppedAssemblyMetadataFormTemplate = Handlebars.compile(droppedAssemblyMetadataFormTemplateHtml);
        var droppedAssemblyMetadataFormHtml = droppedAssemblyMetadataFormTemplate(droppedAssemblyMetadataFormContext);

        $('.wgst-assembly-upload__metadata ul').append($(droppedAssemblyMetadataFormHtml));






        // Draw N50 chart
        var sumsOfNucleotidesInDnaStrings = calculateSumsOfNucleotidesInDnaStrings(dnaStrings);

        //console.log('[WGST] * dev * assemblyN50:');
        //console.dir(assemblyN50);

        drawN50Chart(sumsOfNucleotidesInDnaStrings, assemblyN50, fileCounter);
        //drawN50Chart(assemblyNucleotideSums, assemblyN50, fileCounter);

        // Show first assembly
        //$('.assembly-item-1').removeClass('hide-this');
        //$('.assembly-item').eq('0').show();
        // $('#assembly-item-1').show();
        // $('#assembly-metadata-item-1').show();

        //showDroppedAssembly();
        //$('.')

        // // Set file name in metadata panel title
        // $('.wgst-panel__assembly-upload-metadata .header-title small').text($('#assembly-metadata-item-1').attr('data-name'));

        // // Set file name in analytics panel title
        // $('.wgst-panel__assembly-upload-analytics .header-title small').text($('#assembly-item-1').attr('data-name'));

        // Store displayed fasta file name
        //selectedFastaFileName = $('.assembly-item-1').attr('data-name');
        selectedFastaFileName = $('.assembly-item').eq('0').attr('data-name');

        // Init bootstrap datetimepicker
        //$('.assembly-upload-panel .assembly-sample-datetime-input').datetimepicker();
        // $('#assemblySampleDatetimeInput' + fileCounter).datetimepicker().on('dp.change', function(){
        //     console.log('Datetime changed');
        // });

        // Create closure to save value of fileName
        (function(fileName){

            // Get autocomplete input (jQuery) element
            var autocompleteInput = $('.wgst-assembly-upload__metadata li[data-name="' + fileName + '"] .assembly-sample-location-input');

            // Init Goolge Maps API Places Autocomplete
            // TO DO: This creates new Autocomplete object for each drag and drop file - possibly needs refactoring/performance optimization
            //WGST.geo.metadataAutocomplete[fileName] = new google.maps.places.Autocomplete(document.getElementById('assemblySampleLocationInput' + fileCounter));
            // [0] returns native DOM element: http://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/
            //WGST.geo.metadataAutocomplete[fileName] = new google.maps.places.Autocomplete(autocompleteInput[0]);
            WGST.geo.placeSearchBox[fileName] = new google.maps.places.SearchBox(autocompleteInput[0], {
                bounds: WGST.geo.map.searchBoxBounds
            });

            // When the user selects an address from the dropdown, get geo coordinates
            // https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform
            // TO DO: Remove this event listener after metadata was sent
            // view-source:http://rawgit.com/klokan/8408394/raw/5ab795fb36c67ad73c215269f61c7648633ae53e/places-enter-first-item.html
            google.maps.event.addListener(WGST.geo.placeSearchBox[fileName], 'places_changed', function() {

                // Get the place details from the autocomplete object.
                var places = WGST.geo.placeSearchBox[fileName].getPlaces(),
                    place = places[0];

                if (typeof place === 'undefined' || typeof place.geometry === 'undefined') {
                    console.dir(WGST.geo.placeSearchBox[fileName]);
                    return;
                }

                // If the place has a geometry, then present it on a map
                var latitude = place.geometry.location.lat(),
                    longitude = place.geometry.location.lng(),
                    formattedAddress = place.formatted_address;

                console.log('[WGST] Google Places API first SearchBox place:');
                console.log(formattedAddress);

                // ------------------------------------------
                // Update metadata form
                // ------------------------------------------
                var currentInputElement = $('.wgst-panel__assembly-upload-metadata .assembly-item[data-name="' + fileName + '"]').find('.assembly-sample-location-input');

                // Show next form block if current input has some value
                if (currentInputElement.val().length > 0) {

                    // Show next metadata form block
                    currentInputElement.closest('.form-block').next('.form-block').fadeIn();

                    // Scroll to the next form block
                    currentInputElement.closest('.assembly-metadata').animate({scrollTop: currentInputElement.closest('.assembly-metadata').height()}, 400);
                } // if

                // Increment metadata progress bar
                updateMetadataProgressBar();
                // Replace whatever user typed into this input box with formatted address returned by Google
                currentInputElement.blur().val(formattedAddress);

                // ------------------------------------------
                // Update map, marker and put metadata into assembly object
                // ------------------------------------------
                // Set map center to selected address
                WGST.geo.map.canvas.setCenter(place.geometry.location);
                // Set map
                WGST.geo.map.markers.metadata.setMap(WGST.geo.map.canvas);
                // Set metadata marker's position to selected address
                WGST.geo.map.markers.metadata.setPosition(place.geometry.location);
                // Show metadata marker
                WGST.geo.map.markers.metadata.setVisible(true);

                //
                // Update metadata store
                //
                WGST.upload.assembly[fileName] = WGST.upload.assembly[fileName] || {};
                WGST.upload.assembly[fileName].metadata = WGST.upload.assembly[fileName].metadata || {};
                WGST.upload.assembly[fileName].metadata.geography = {
                    address: formattedAddress,
                    position: {
                        latitude: latitude,
                        longitude: longitude
                    },
                    // https://developers.google.com/maps/documentation/geocoding/#Types
                    type: place.types[0]
                };

            });

            // // On change store datetime in assembly metadata
            // $('li.assembly-item[data-name="' + fileName + '"] .assembly-sample-datetime-input').datetimepicker({
            //     useCurrent: false,
            //     language: 'en-gb'
            // }).on('change', function(){
            //     WGST.upload.assembly[fileName].metadata = WGST.upload.assembly[fileName].metadata || {};
            //     WGST.upload.assembly[fileName].metadata.datetime = $(this).val();
            // });

            // On change store source in assembly metadata
            $('li.assembly-item[data-name="' + fileName + '"] .assembly-sample-source-input').on('change', function(){
                WGST.upload.assembly[fileName].metadata = WGST.upload.assembly[fileName].metadata || {};
                WGST.upload.assembly[fileName].metadata.source = $(this).val();
            });



                numberOfParsedFastaFiles = numberOfParsedFastaFiles + 1;

                console.log('numberOfDroppedFastaFiles: ' + numberOfDroppedFastaFiles);
                console.log('numberOfParsedFastaFiles: ' + numberOfParsedFastaFiles);

                if (numberOfDroppedFastaFiles === numberOfParsedFastaFiles) {
                    openAssemblyUploadPanels();
                }

        
        }(file.name));
    
    }; // parseFastaFile()

    /**
     * Description
     * @method drawN50Chart
     * @param {} chartData
     * @param {} assemblyN50
     * @param {} fileCounter
     * @return 
     */
    var drawN50Chart = function(chartData, assemblyN50, fileCounter) {

        var chartWidth = 460,
            chartHeight = 312;

        // Extent
        var xExtent = d3.extent(chartData, function(datum){
            return datum.sequenceLength;
        });

        // Scales

        // X
        var xScale = d3.scale.linear()
            .domain([0, chartData.length])
            .range([40, chartWidth - 50]); // the pixels to map, i.e. the width of the diagram

        // Y
        var yScale = d3.scale.linear()
            .domain([chartData[chartData.length - 1], 0])
            .range([30, chartHeight - 52]);

        // Axes

        // X
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .ticks(10);

        // Y
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left')
            // http://stackoverflow.com/a/18822793
            .ticks(10);

        // Append SVG to DOM
        var svg = d3.select('.sequence-length-distribution-chart-' + fileCounter)
            .append('svg')
            .attr('width', chartWidth)
            .attr('height', chartHeight);

        // Append axis

        // X
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(20, 260)')
            .call(xAxis);

        // Y
        svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(60, 0)')
            .call(yAxis);

        // Axis labels

        // X
        svg.select('.x.axis')
            .append('text')
            .text('Ordered contigs')
            .attr('class', 'axis-label')
            .attr('text-anchor', 'end')
            .attr('x', (chartWidth / 2) + 49)
            .attr('y', 45);

        // Y
        svg.select('.y.axis')
            .append('text')
            .text('Nucleotides sum')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -(chartHeight / 2) - 44)
            .attr('y', 398);

        // Circles
        svg.selectAll('circle')
            .data(chartData)
            .enter()
            .append('circle')
            .attr('cx', function(datum, index){
                return xScale(index + 1) + 20;
            })
            .attr('cy', function(datum){
                return yScale(datum);
            })
            .attr('r', 5);

        // Line
        var line = d3.svg.line()
           //.interpolate("basis")
           .x(function(datum, index) {
                return xScale(index + 1) + 20; 
            })
           .y(function(datum) { 
                return yScale(datum); 
            });

        svg.append('path')
            .attr('d', line(chartData));

        // Draw line from (0,0) to d3.max(data)
        var rootLineData = [{
            'x': xScale(0) + 20,
            'y': yScale(0)
        },
        {
            'x': xScale(1) + 20,
            'y': yScale(chartData[0])
        }];

        var rootLine = d3.svg.line()
            .x(function(datum) {
                return datum.x;
            })
            .y(function(datum) {
                return datum.y;
            })
            .interpolate("linear");

        var rootPath = svg.append('path')
            .attr('d', rootLine(rootLineData));

        // Draw N50

/*          svg.selectAll('.n50-circle')
            .data([n50])
            .enter()
            .append('circle')
            .attr('cx', function(datum){
                return xScale(datum.index) + 20;
            })
            .attr('cy', function(datum){
                return yScale(datum.sum);
            })
            .attr('r', 6)
            .attr('class', 'n50-circle')*/

        // Group circle and text elements
        var n50Group = svg.selectAll('.n50-circle')
            .data([assemblyN50])
            .enter()
            .append('g')
            .attr('class', 'n50-group');

        // Append circle to group
        var n50Circle = n50Group.append('circle')
            .attr('cx', function(datum){
                return xScale(datum.sequenceNumber) + 20;
            })
            .attr('cy', function(datum){
                return yScale(datum.sum);
            })
            .attr('r', 6);
            //.attr('class', 'n50-circle');
        
        // Append text to group
        n50Group.append('text')
            .attr('dx', function(datum){
                return xScale(datum.sequenceNumber) + 20 + 9;
            })
            .attr('dy', function(datum){
                return yScale(datum.sum) + 5;
            })
            .attr("text-anchor", 'right')
            .text('N50');
                //.attr('class', 'n50-text');

        // Draw N50 lines
        var d50LinesData = [{
            'x': 54,
            'y': yScale(assemblyN50.sum)
        },
        {
            'x': xScale(assemblyN50.sequenceNumber) + 20,
            'y': yScale(assemblyN50.sum)
        },
        {
            'x': xScale(assemblyN50.sequenceNumber) + 20,
            'y': chartHeight - 46
        }];

        var d50Line = d3.svg.line()
            .x(function(datum) {
                return datum.x;
            })
            .y(function(datum) {
                return datum.y;
            })
            .interpolate("linear");

        // N50 path
        n50Group.append('path').attr('d', d50Line(d50LinesData));

    };

    var csvFileTypeRegex = /csv/;

    /**
     * Description
     * @method handleDragOver
     * @param {} event
     * @return 
     */
    var handleDragOver = function(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy
    };

    var handleFastaDrop = function(file) {};

    var handleCsvDrop = function(file) {};

    var openAssemblyUploadPanels = function() {
        if (! isPanelActive('assemblyUploadNavigator')) {
            activatePanel('assemblyUploadNavigator');
            showPanel('assemblyUploadNavigator');
        }

        if (! isPanelActive('assemblyUploadAnalytics')) {
            activatePanel('assemblyUploadAnalytics');
            showPanel('assemblyUploadAnalytics');
        }        

        if (! isPanelActive('assemblyUploadMetadata')) {
            activatePanel('assemblyUploadMetadata');
            showPanel('assemblyUploadMetadata');
        }
    };

    var numberOfDroppedFastaFiles = 0,
        numberOfParsedFastaFiles = 0;

    /**
     * Description
     * @method handleDrop
     * @param {} event
     * @return 
     */
    var handleDrop = function(event) {

        // Check if file upload is on
        if (! window.WGST.config.allowUpload) {
            return;
        }

        // Only handle file drops
        if (event.dataTransfer.files.length > 0) {

            event.stopPropagation();
            event.preventDefault();

            var collectionId = '';

            // Check if user drag and drops to the existing collection
            if (isPanelActive('collection')) {

                collectionId = $('.wgst-panel__collection').attr('data-collection-id');
                $('.wgst-panel__assembly-upload-navigator').attr('data-collection-id', collectionId);
                deactivatePanel('collection');
                clearCollectionAssemblyList(collectionId);

            } else if (isFullscreenActive('collection')) {

                collectionId = $('.wgst-fullscreen__collection .wgst-collection').attr('data-collection-id');
                $('.wgst-panel__assembly-upload-navigator').attr('data-collection-id', collectionId);
                clearCollectionAssemblyList(collectionId);

                // Show fullscreen map
                bringMapPanelToFullscreen('map', 'map');

            }

            // if (! isPanelActive('assemblyUploadNavigator')) {
            //     activatePanel('assemblyUploadNavigator');
            //     showPanel('assemblyUploadNavigator');
            // }

            // if (! isPanelActive('assemblyUploadAnalytics')) {
            //     activatePanel('assemblyUploadAnalytics');
            //     showPanel('assemblyUploadAnalytics');
            // }        

            // if (! isPanelActive('assemblyUploadMetadata')) {
            //     activatePanel('assemblyUploadMetadata');
            //     showPanel('assemblyUploadMetadata');
            // }

            // Set the highest z index for this panel
            $('.assembly-upload-panel').trigger('mousedown');

            if (WGST.speak) {
                var messageText = '',
                    message;

                if (collectionId.length > 0) {
                    messageText = 'You have dropped ' +  event.dataTransfer.files.length + ' files to the existing collection.';
                } else {
                    messageText = 'You have dropped ' +  event.dataTransfer.files.length + ' files';
                }

                message = new SpeechSynthesisUtterance(messageText);
                window.speechSynthesis.speak(message);
            }

            // FileList object
            // https://developer.mozilla.org/en-US/docs/Web/API/FileList
            var droppedFiles = event.dataTransfer.files;

            WGST.dragAndDrop.files = $.merge(WGST.dragAndDrop.files, droppedFiles);
            WGST.dragAndDrop.loadedFiles = [];

            var allDroppedFiles = WGST.dragAndDrop.files,
                // A single file from FileList object
                file = allDroppedFiles[0],
                // File name is used for initial user assembly id
                fileName = file.name,
                // Count files
                //fileCounter = 0,
                // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
                fileReader = new FileReader();

            // Check if user dropped only 1 assembly
            if (allDroppedFiles.length === 1) {
                // Hide average number of contigs per assembly
                $('.upload-multiple-assemblies-label').hide();
                // Set file name of dropped file
                $('.upload-single-assembly-file-name').text(fileName);
                // Show single assembly upload label
                $('.upload-single-assembly-label').show();
            } else {
                // Hide text that belongs to a single assembly upload summary
                $('.upload-single-assembly-label').hide();
                // Show multiple assemblies upload label
                $('.upload-multiple-assemblies-label').show();
            }

            // Init assembly navigator

            // Update total number of assemblies
            $('.total-number-of-dropped-assemblies').text(allDroppedFiles.length);

            // Update assembly list slider
            $('.assembly-list-slider').slider('option', 'max', allDroppedFiles.length - 1);

            // Set file name
            $('.assembly-file-name').text(fileName);

            // If there is more than 1 file dropped then show assembly navigator
            if (allDroppedFiles.length > 1) {
                // Show assembly navigator
                $('.assembly-navigator').show();
                // Focus on slider handle
                $('.ui-slider-handle').focus();
            }

            numberOfDroppedFastaFiles = Object.keys(allDroppedFiles).length;

            $.each(allDroppedFiles, function(fileCounter, file){
                // https://developer.mozilla.org/en-US/docs/Web/API/FileList#item()

                if (file.type.match(csvFileTypeRegex)) {
                    console.log('Dropped CSV file');
                    console.dir(file);

                    handleCsvDrop(file);

                } else if (file.name.match(WGST.dragAndDrop.fastaFileNameRegex)) {
                    console.log('Dropped FASTA file');

                    if ($('.wgst-panel__assembly-upload-analytics .assembly-item[data-name="' + file.name + '"]').length === 0) {

                        var fileReader = new FileReader();

                        fileReader.addEventListener('load', function(event){
                            console.log('[WGST] Loaded file ' + event.target.name);

                            // Store loaded file
                            WGST.dragAndDrop.loadedFiles.push({
                                // Generate uid for dropped file
                                uid: uuid.v4(),
                                event: event,
                                fileCounter: fileCounter,
                                file: file,
                                droppedFiles: droppedFiles,
                                collectionId: collectionId
                            });

                            // Once all files have been loaded
                            if (WGST.dragAndDrop.loadedFiles.length === WGST.dragAndDrop.files.length) {
                                // Sort loaded files by name
                                WGST.dragAndDrop.loadedFiles.sort(function(a, b){
                                    if (a.file.name > b.file.name) {
                                        return 1;
                                    } else if (a.file.name < b.file.name) {
                                        return -1;
                                    } else {
                                        return 0;
                                    }
                                });
                                // Parse loaded files
                                WGST.dragAndDrop.loadedFiles.forEach(function(loadedFile){
                                    parseFastaFile(loadedFile.event, loadedFile.fileCounter, loadedFile.file, loadedFile.droppedFiles, loadedFile.collectionId, loadedFile.uid);
                                    
                                    // Add assembly to the drop down select of dropeed assemblies
                                    $('.wgst-dropped-assembly-list').append(
                                        '<option value="' + loadedFile.uid + '">' + loadedFile.file.name + '</option>'
                                    );
                                });
                                // Show first assembly
                                window.WGST.exports.showDroppedAssembly(WGST.dragAndDrop.loadedFiles[0].uid);
                            }
                        });

                        // Read file as text
                        fileReader.readAsText(file);

                    } // if

                } else {
                    // ============================================================
                    // React component
                    // ============================================================
                    React.renderComponent(
                        WorkflowQuestion({
                            title: 'What type of data have you dropped?',
                            buttons: [
                            {
                                label: 'Assemblies in FASTA format',
                                value: 'fasta'
                            },
                            {
                                label: 'Metadata in CSV format',
                                value: 'csv'
                            }]
                        }),
                        document.querySelectorAll(".wgst-react-component__workflow-question")[0]
                    );
                } // if

                //console.log('Dropped file type: ' + file.type);
                //console.dir(file);

                // // Validate file name   
                // if (file.name.match(WGST.dragAndDrop.fastaFileNameRegex)) {
                //     if ($('.wgst-panel__assembly-upload-analytics .assembly-item[data-name="' + file.name + '"]').length === 0) {

                //         // Create closure (new scope) to save fileCounter, file variable with it's current value
                //         //(function(){
                //             var fileReader = new FileReader();

                //             fileReader.addEventListener('load', function(event){
                //                 parseFastaFile(event, fileCounter, file, droppedFiles, collectionId);
                //             });

                //             // Read file as text
                //             fileReader.readAsText(file);
                //         //})();

                //     } // if
                // // Invalid file name
                // } else {
                //     console.log("[WGST] File not supported");
                // }

            });

            // if (! isPanelActive('assemblyUploadNavigator')) {
            //     activatePanel('assemblyUploadNavigator');
            //     showPanel('assemblyUploadNavigator');
            // }

            // if (! isPanelActive('assemblyUploadAnalytics')) {
            //     activatePanel('assemblyUploadAnalytics');
            //     showPanel('assemblyUploadAnalytics');
            // }        

            // if (! isPanelActive('assemblyUploadMetadata')) {
            //     activatePanel('assemblyUploadMetadata');
            //     showPanel('assemblyUploadMetadata');
            // }

            // Update total number of assemblies to upload
            $('.assembly-upload-total-number').text(allDroppedFiles.length);
            // Update lable for total number of assemblies to upload
            $('.assembly-upload-total-number-label').html((allDroppedFiles.length === 1 ? 'assembly': 'assemblies'));
        }
    };

    // Listen to dragover and drop events
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleDrop, false);

    /*
        Sequence list navigation buttons
    */
    // Disable/enable range navigation buttons
    /**
     * Description
     * @method updateRangeNavigationButtons
     * @param {} handleValue
     * @return 
     */
    var updateRangeNavigationButtons = function(handleValue) {
        // Update sequence navigation buttons
        if (handleValue === 1) { // Reached min limit
            // Disable prev sequence button
            $('.nav-prev-item').attr('disabled', 'disabled');
            // Enable next sequence button (if disabled)
            $('.nav-next-item').removeAttr('disabled', 'disabled');
        } else if (handleValue === parseInt($('.total-number-of-dropped-assemblies').text())) { // Reached max limit
            // Disable next sequence button
            $('.nav-next-item').attr('disabled', 'disabled');
            // Enable prev sequence button (if disabled)
            $('.nav-prev-item').removeAttr('disabled', 'disabled');
        } else {
            // Enable both buttons (if any disabled)
            $('.nav-next-item').removeAttr('disabled', 'disabled');
            $('.nav-prev-item').removeAttr('disabled', 'disabled');
        }
    };

    /**
     * Description
     * @method resetPanelAssemblyUploadNavigator
     * @return 
     */
    var resetPanelAssemblyUploadNavigator = function() {
        var panel = $('.wgst-panel__assembly-upload-navigator');
        // Set average number of contigs per assembly
        panel.find('.assembly-sequences-average').text('0');
        // Set total number of selected assemblies/files
        panel.find('.assembly-upload-total-number').text('0');
    };

    /**
     * Description
     * @method resetPanelAssemblyUploadProgress
     * @return 
     */
    var resetPanelAssemblyUploadProgress = function() {
        var panel = $('.wgst-panel__assembly-upload-progress');
        panel.find('.assemblies-upload-progress .progress-bar').attr('class', 'progress-bar').attr('aria-valuenow', '0');
        panel.find('.assemblies-upload-progress .progress-bar').attr('style', 'width: 0%');
        panel.find('.assemblies-upload-progress .progress-bar').html('');
        panel.find('.assemblies-upload-progress .assemblies-upload-processed').html('0');
        panel.find('.assembly-list-upload-progress tbody').html('');
    };

    /**
     * Description
     * @method resetPanelAssemblyUploadMetadata
     * @return 
     */
    var resetPanelAssemblyUploadMetadata = function() {
        var panel = $('.wgst-panel__assembly-upload-metadata');

        // Clear metadata list of assembly items
        panel.find('.wgst-assembly-upload__metadata ul').html('');

        // Show metadata progress bar
        panel.find('.adding-metadata-progress-container .progress-container').show();
        // Hide upload buttons
        panel.find('.adding-metadata-progress-container .upload-controls-container').hide();

        // Reset adding metadata progress bar

        // Update bar's width
        panel.find('.adding-metadata-progress-container .progress-bar').width('0%');
        // Update aria-valuenow attribute
        panel.find('.adding-metadata-progress-container .progress-bar').attr('aria-valuenow', 0);
        // Update percentage value
        panel.find('.adding-metadata-progress-container .progress-percentage').text('0%');
    };

    /**
     * Description
     * @method resetPanelAssemblyUploadAnalytics
     * @return 
     */
    var resetPanelAssemblyUploadAnalytics = function() {
        var panel = $('.wgst-panel__assembly-upload-analytics');
        panel.find('.wgst-assembly-upload__analytics ul').html('');
    };

    /**
     * Description
     * @method resetAssemlyUpload
     * @return 
     */
    var resetAssemlyUpload = function() {
        // Empty list of selected FASTA files and metadata
        fastaFilesAndMetadata = {};

        numberOfDroppedFastaFiles = 0,
        numberOfParsedFastaFiles = 0;

        resetPanelAssemblyUploadNavigator();
        resetPanelAssemblyUploadAnalytics();
        resetPanelAssemblyUploadMetadata();
    };

    /**
     * Description
     * @method updateSelectedFilesSummary
     * @return 
     */
    var updateSelectedFilesSummary = function() {
        // Calculate average number of selected contigs
        var contigsTotalNumber = 0;
        // Count all contigs
        $.each($('.assembly-item'), function(key, value){
            contigsTotalNumber = contigsTotalNumber + parseInt($(value).find('.assembly-stats-number-contigs').text(), 10);
        });
        $('.assembly-sequences-average').text(Math.floor(contigsTotalNumber / Object.keys(fastaFilesAndMetadata).length));

        // Set total number of selected assemblies/files
        $('.assembly-upload-total-number').text(Object.keys(fastaFilesAndMetadata).length);
    };

    //
    // Updates
    //
    var getIndexOfDroppedAssemblyCurrentlyDisplayed = function() {
        var fileUidOfVisibleMetadata = $('.wgst-upload-assembly__metadata:visible').attr('data-file-uid');

        var indexOfDroppedAssemblyCurrentlyDisplayed = 0;

        WGST.dragAndDrop.loadedFiles.forEach(function(loadedFile, index, array) {
            if (loadedFile.uid === fileUidOfVisibleMetadata) {
                indexOfDroppedAssemblyCurrentlyDisplayed = index;
            }
        });

        return indexOfDroppedAssemblyCurrentlyDisplayed;
    };

    // var handleAssemblyListSlide = function(event, ui) {
    //     var assemblyIndex = ui.value - 1;
    //     console.log('~~~ assemblyIndex: ' + assemblyIndex);
    //     updateSelectedFilesUI(assemblyIndex);
    //     showAssembly(assemblyIndex);
    // };

    var updateSelectedFilesUI = function(elementCounter) {
        // Update sequence counter label
        $('.selected-assembly-counter').text(elementCounter);

        // Update assembly file name
        var fileName = $('.assembly-item').eq(elementCounter - 1).attr('data-name');

        // Update file name in Assembly Upload Navigator
        $('.wgst-panel__assembly-upload-navigator .assembly-file-name').text(fileName);

        // Update file name in Assembly Upload Metadata panel
        $('.wgst-panel__assembly-upload-metadata .header-title small').text(fileName);

        // Update file name in Assembly Upload Analytics panel
        $('.wgst-panel__assembly-upload-analytics .header-title small').text(fileName);

        // Update sequence counter label
        updateRangeNavigationButtons(elementCounter);
    };

    // var assemblyListSliderEventHandler = function(event, ui) {
    //     updateSelectedFilesUI(ui.value);

        
    //     // Update sequence list item content
    //     // Hide all sequences
    //     $('.assembly-item').hide();
    //     // Show selected sequence
    //     //$('.assembly-item-' + ui.value).show();
    //     $('.assembly-item').eq(ui.value-1).show();
    //     // Update assembly file name
    //     $('.assembly-file-name').text($('.assembly-item-' + ui.value).attr('data-name'));
    //     // Store displayed fasta file name
    //     selectedFastaFileName = $('.assembly-item-' + ui.value).attr('data-name');
        
    // };

    // $('.wgst-dropped-assembly-list-navigation-button__previous').on('click', showNextAssembly);
    // $('.wgst-dropped-assembly-list-navigation-button__previous').on('click', showPreviousAssembly);

    // var showPreviousAssembly = function() {
    //     console.debug('::: Showing previous assembly');

    //     var currentAssemblyIndex = getIndexOfDroppedAssemblyCurrentlyDisplayed();
    //     console.log('~~~ currentAssemblyIndex: ' + currentAssemblyIndex);
    //     showAssembly(currentAssemblyIndex - 1);
    //     // var previousAssemblyFileUid = WGST.dragAndDrop.loadedFiles[currentAssemblyIndex - 1].uid;
    //     // showDroppedAssembly(previousAssemblyFileUid);
    // };
    // var showNextAssembly = function() {
    //     console.debug('::: Showing next assembly');

    //     var currentAssemblyIndex = getIndexOfDroppedAssemblyCurrentlyDisplayed();
    //     console.log('~~~ currentAssemblyIndex: ' + currentAssemblyIndex);
    //     showAssembly(currentAssemblyIndex + 1);
    //     // var nextAssemblyFileUid = WGST.dragAndDrop.loadedFiles[currentAssemblyIndex + 1].uid;
    //     // showDroppedAssembly(nextAssemblyFileUid);
    // };
    // var showAssembly = function(index) {
    //     console.debug('index: ' + index);
    //     console.debug('WGST.dragAndDrop.loadedFiles:');
    //     console.dir(WGST.dragAndDrop.loadedFiles);

    //     var assemblyFileUid = WGST.dragAndDrop.loadedFiles[index].uid;
    //     showDroppedAssembly(assemblyFileUid);  
    // };

    // Handle slide event
    // Triggered when user moved but didn't release range handle
    //$('.assembly-list-slider').on('slide', handleAssemblyListSlide);
    // Handle slidechange event
    // Triggered when user clicks a button or releases range handle
    //$('.assembly-list-slider').on('slidechange', handleAssemblyListSlide);

    // Navigate to the previous sequence
    $('.nav-prev-item').on('click', function() {
        var $slider = $('.assembly-list-slider'),
            currentSliderValue = $slider.slider('value');

        console.log('@@@ currentSliderValue: ' + currentSliderValue);

        // Check if selected sequence counter value is greater than 1
        if (currentSliderValue > 0) {
            // Decrement slider's value
            $slider.slider('value', currentSliderValue - 1);

            //showPreviousAssembly();
        }
    });
    // Navigate to the next sequence
    $('.nav-next-item').on('click', function() {
        var $slider = $('.assembly-list-slider'),
            currentSliderValue = $slider.slider('value');

        console.log('@@@ currentSliderValue: ' + currentSliderValue);

        // Check if selected sequence counter value is less than total number of dropped assemblies
        if (currentSliderValue < WGST.dragAndDrop.loadedFiles.length) {
            // Increment slider's value
            $slider.slider('value', currentSliderValue + 1);

            //showNextAssembly();
        }
    });

    // Assembly metadata from

    // Show hint message when 'I am not sure' checkbox is checkec
    $('.wgst-assembly-upload__metadata').on('click', '.not-sure-checkbox', function(){
        // Show 'I am not sure' message
        $(this).closest('label').find('.not-sure-hint').toggleClass('hide-this');
    });

    /**
     * Description
     * @method updateMetadataProgressBar
     * @return 
     */
    var updateMetadataProgressBar = function() {
        // Calculate total number of metadata form elements
        var totalNumberOfMetadataItems = 
            + $('.assembly-timestamp-input-year').length
            + $('.assembly-sample-location-input').length
            + $('.assembly-sample-source-input').length;

        // Calculate number of non empty metadata form elements
        var numberOfNonEmptyMetadataItems =
            // Filter out empty datetime inputs
            + $('.assembly-timestamp-input-year').filter(function(){
                return this.value !== '-1';
            }).length
            // Filter out empty location inputs
            + $('.assembly-sample-location-input').filter(function(){
                return this.value.length !== 0;
            }).length
            // Filter out default source inputs
            + $('.assembly-sample-source-input').filter(function(){
                return this.value !== '0';
            }).length;

        // Calculate new progress bar percentage value
        var newProgressBarPercentageValue = Math.floor(numberOfNonEmptyMetadataItems * 100 / totalNumberOfMetadataItems);

        // Update bar's width
        $('.adding-metadata-progress-container .progress-bar').width(newProgressBarPercentageValue + '%');
        // Update aria-valuenow attribute
        $('.adding-metadata-progress-container .progress-bar').attr('aria-valuenow', newProgressBarPercentageValue);
        // Update percentage value
        $('.adding-metadata-progress-container .progress-percentage').text(newProgressBarPercentageValue + '%');

        // Check if all form elements are completed
        if (newProgressBarPercentageValue === 100) {

            // Hide metadata progress bar
            $('.adding-metadata-progress-container .progress-container').hide();

            // Show upload buttons
            $('.adding-metadata-progress-container .upload-controls-container').show();

            if (WGST.speak) {
                var message = new SpeechSynthesisUtterance('Ready to upload');
                window.speechSynthesis.speak(message);
            }

            // Enable 'Upload' button
            //$('.assemblies-upload-ready-button').removeAttr('disabled');
        }
    };

    /*
    // Show next form block when user selects species
    // TO DO: Do now increment metadata progress bar more than once
    $('.assembly-list-container').on('change', '.assembly-sample-species-select', function(){
        // Show next form block
        $(this).closest('.form-block').next('.form-block').fadeIn();
    });
    // Increment metadata progress bar
    $('.assembly-list-container').on('change', '.assembly-sample-species-select', function(){
        // Increment progress bar
        updateMetadataProgressBar();
    });
    */

    // // Show next form block when user fills in an input
    // // http://stackoverflow.com/a/6458946
    // // Relevant issue: https://github.com/Eonasdan/bootstrap-datetimepicker/issues/83
    // $('.assembly-metadata-list-container').on('change change.dp', '.assembly-sample-datetime-input', function(){
    //     // TODO: validate input value
    //     // Show next form block
    //     $(this).closest('.form-block').next('.form-block').fadeIn();
    //     // Scroll to the next form block
    //     //$(this).closest('.assembly-metadata').scrollTop($(this).closest('.assembly-metadata').height());
    //     //$(this).closest('.assembly-metadata').animate({scrollTop: $(this).closest('.assembly-metadata').height()}, 400);
    //     // Focus on the next input
    //     $(this).closest('.form-block').next('.form-block').find('.assembly-sample-location-input').focus();
    //     //$('.assembly-sample-location-input').focus();
    // });
    // // Increment metadata progress bar
    // $('.assembly-metadata-list-container').on('change change.dp', '.assembly-sample-datetime-input', function(){
    //     // Increment progress bar
    //     updateMetadataProgressBar();
    // });
    // $('.assembly-metadata-list-container').one('hide.dp', '.assembly-sample-datetime-input', function(event){
    //     var that = $(this);
    //     setTimeout(function(){
    //         // Scroll to the next form block
    //         //$(this).closest('.assembly-metadata').scrollTop($(this).closest('.assembly-metadata').height());
    //         that.closest('.assembly-metadata').animate({scrollTop: that.closest('.assembly-metadata').height()}, 400);
    //     }, 500);
    // });

    // var handleMetadataInputChange = function(inputElement) {

    //     console.log(inputElement);

    //     // Show next form block if current input has some value
    //     if (inputElement.val().length > 0) {

    //         // TO DO: Validate input value

    //         // Show next metadata form block
    //         inputElement.closest('.form-block').next('.form-block').fadeIn();

    //         // Scroll to the next form block
    //         //$(this).closest('.assembly-metadata').scrollTop($(this).closest('.assembly-metadata').height());
    //         inputElement.closest('.assembly-metadata').animate({scrollTop: inputElement.closest('.assembly-metadata').height()}, 400);
    //     } // if

    //     // Increment metadata progress bar
    //     updateMetadataProgressBar();
    //     // Hide progress hint
    //     $('.adding-metadata-progress-container .progress-hint').fadeOut();
    // };

    // Show next form block when user fills in an input
    // To do: Refactor
    $('.wgst-assembly-upload__metadata').on('change', '.assembly-sample-source-input', function(){
        var $input = $(this);

        // Show next form block if user selected non default option
        if ($input.val() !== 0) {
            // Show next metadata form block
            $input.closest('.form-block').next('.form-block').fadeIn();
            // Scroll to the next form block
            $input.closest('.assembly-metadata').animate({scrollTop: $input.closest('.assembly-metadata').height()}, 400);
        } // if

        // Increment metadata progress bar
        updateMetadataProgressBar();
        // Hide progress hint
        $('.adding-metadata-progress-container .progress-hint').fadeOut();
    });

    // TO DO: Refactor
    // When 'Next empty assembly' button is pressed
    $('.wgst-assembly-upload__metadata').on('click', '.assembly-metadata button.next-assembly-button', function(event){
        // Show assembly with empty metadata input field

        // Trigger to show next assembly
        $('.nav-next-item').trigger('click');

        //$('#assembly-item-' + (+currentAssemblyIdCounter + 1)).find('input:first').focus();

        // Focus on the next empty input field
        //$(this).closest('.assembly-metadata-list-container').find('.assembly-metadata-item input:text[value=""]').focus();
        //console.log($(this).closest('.assembly-metadata-list-container').find('.assembly-metadata-item input:text[value=""]'));

        var currentAssemblyIdCounter = $(this).closest('.assembly-item').attr('id').replace('assembly-metadata-item-', '');

        $(this).closest('.wgst-assembly-upload__metadata').find('.assembly-metadata-block input:text[value=""]').focus();

        event.preventDefault();
    });

    /**
     * Description
     * @method calculateAssemblyTopScore
     * @param {} assemblyScores
     * @return MemberExpression
     */
    var calculateAssemblyTopScore = function(assemblyScores) {
        // Sort data by score
        // http://stackoverflow.com/a/15322129
        var sortedScores = [],
            score;

        // First create the array of keys/values so that we can sort it
        for (score in assemblyScores) {
            if (assemblyScores.hasOwnProperty(score)) {
                sortedScores.push({ 
                    'referenceId': assemblyScores[score].referenceId,
                    'score': assemblyScores[score].score
                });
            }
        }

        // Sort scores
        sortedScores = sortedScores.sort(function(a,b){
            return b.score - a.score; // Descending sort (Z-A)
        });

        return sortedScores[0];
    };

    /**
     * Description
     * @method updateAssemblyUploadProgressUI
     * @param {} assemblyId
     * @param {} userAssemblyId
     * @param {} numberOfAnalysisResultsPerAssembly
     * @param {} result
     * @return 
     */
    var updateAssemblyUploadProgressUI = function(assemblyId, userAssemblyId, numberOfAnalysisResultsPerAssembly, result) {
        // ------------------------------------------
        // Create result element
        // ------------------------------------------
        var $assemblyRow = $('.assembly-list-upload-progress tr[data-assembly-id="' + userAssemblyId + '"] '),
            $assemblyRowProgressBar = $assemblyRow.find('.progress-bar'),
            statusCompleteHtml = '<span class="glyphicon glyphicon-ok"></span>',
            currentProgressBarPercentageValue = parseFloat($assemblyRow.find('.progress-bar').attr('aria-valuenow')),
            progressStepSize = 100 / numberOfAnalysisResultsPerAssembly,
            newProgressBarPercentageValue = currentProgressBarPercentageValue + progressStepSize;

        if (result === WGST.assembly.analysis.UPLOAD_OK) {
            $assemblyRow.find('.assembly-upload-uploaded').html(statusCompleteHtml);
        } else if (result === WGST.assembly.analysis.MLST_RESULT) {
            $assemblyRow.find('.assembly-upload-result-mlst').html(statusCompleteHtml);
        } else if (result === WGST.assembly.analysis.PAARSNP_RESULT) {
            $assemblyRow.find('.assembly-upload-result-paarsnp').html(statusCompleteHtml);
        } else if (result === WGST.assembly.analysis.FP_COMP) {
            $assemblyRow.find('.assembly-upload-result-fp-comp').html(statusCompleteHtml);
        } else if (result === WGST.assembly.analysis.CORE) {
            $assemblyRow.find('.assembly-upload-result-core').html(statusCompleteHtml);
        }

        // ------------------------------------------
        // Update assembly upload progress bar value
        // ------------------------------------------
        $assemblyRowProgressBar
                        .css('width', newProgressBarPercentageValue + '%')
                        .attr('aria-valuenow', newProgressBarPercentageValue);

        // If assembly processing has started then show percentage value
        if (newProgressBarPercentageValue > 0) {
            //assemblyRowProgressBar.text(Math.floor(newProgressBarPercentageValue) + '%');
            $assemblyRowProgressBar.text(Math.round(newProgressBarPercentageValue) + '%');
        }

        // Once 100% reached change progress bar color to green
        if (newProgressBarPercentageValue >= 100) {
            // Update number of processing assemblies
            numberOfFilesProcessing = numberOfFilesProcessing - 1;

            // Remove stripes from progress bar
            $assemblyRow.find('.progress')
                .removeClass('active')
                .removeClass('progress-striped');

            // Change progress bar color to green
            $assemblyRowProgressBar
                .removeClass('progress-bar-info')
                .addClass('progress-bar-success');

            var assemblyName = $assemblyRow.find('.assembly-upload-name').text();
            $assemblyRow.find('.assembly-upload-name').html('<a href="#" class="open-assembly-button" data-assembly-id="' + assemblyId + '">' + assemblyName + '</a>');            

            // Update total number of processed assemblies
            var $assembliesUploadProcessed = $('.assemblies-upload-processed');
            $assembliesUploadProcessed.text(parseInt($assembliesUploadProcessed.text(), 10) + 1);
        } // if
    };

    /**
     * Description
     * @method updateCollectionUploadProgressUI
     * @param {} collectionId
     * @param {} userAssemblyId
     * @param {} assemblyId
     * @param {} totalNumberOfAnalysisResults
     * @param {} result
     * @return 
     */
    var updateCollectionUploadProgressUI = function(collectionId, userAssemblyId, assemblyId, totalNumberOfAnalysisResults, result) {
        // ------------------------------------------
        // Update collection progress
        // ------------------------------------------
        var $collectionUploadProgressBar = $('.assemblies-upload-progress').find('.progress-bar'),
            currentProgressBarPercentageValue = parseFloat($collectionUploadProgressBar.attr('aria-valuenow')),
            progressStepSize = 100 / totalNumberOfAnalysisResults,
            newProgressBarPercentageValue = currentProgressBarPercentageValue + progressStepSize;

        // ------------------------------------------
        // Update assembly upload progress bar value
        // ------------------------------------------
        $collectionUploadProgressBar
                        .css('width', newProgressBarPercentageValue + '%')
                        .attr('aria-valuenow', newProgressBarPercentageValue);

        // If assembly processing has started then show percentage value
        if (newProgressBarPercentageValue > 0) {
            $collectionUploadProgressBar.text(Math.round(newProgressBarPercentageValue) + '%');
        }

        // Once 100% reached change progress bar color to green
        if (newProgressBarPercentageValue >= 100) {
            $collectionUploadProgressBar.addClass('progress-bar-success');
        }

        if (WGST.speak === true && newProgressBarPercentageValue % 30 === 0) {
            var message = new SpeechSynthesisUtterance('Uploaded over ' + newProgressBarPercentageValue + ' percent');
            window.speechSynthesis.speak(message);
        }
    };

    /**
     * Description
     * @method addResistanceProfileToCollection
     * @param {} collectionId
     * @return 
     */
    var addResistanceProfileToCollection = function(collectionId) {
        // ----------------------------------------
        // Ungroup antibiotic resistance profile
        // ----------------------------------------
        var assemblyId,
            assembly,
            resistanceProfileGroups = {},
            resistanceProfileGroupName,
            resistanceProfileGroup,
            ungroupedResistanceProfile,
            antibioticName;

        for (assemblyId in WGST.collection[collectionId].assemblies) {
            assembly = WGST.collection[collectionId].assemblies[assemblyId];
            resistanceProfileGroups = assembly.PAARSNP_RESULT.paarResult.resistanceProfile;
            ungroupedResistanceProfile = {};

            // console.log('resistanceProfileGroups: ' + resistanceProfileGroups);
            // console.dir(resistanceProfileGroups);

            for (resistanceProfileGroupName in resistanceProfileGroups) {
                resistanceProfileGroup = resistanceProfileGroups[resistanceProfileGroupName];

                for (antibioticName in resistanceProfileGroup) {
                    ungroupedResistanceProfile[antibioticName] = resistanceProfileGroup[antibioticName];
                }                    
            }

            WGST.collection[collectionId].assemblies[assemblyId].PAARSNP_RESULT.paarResult.ungroupedResistanceProfile = ungroupedResistanceProfile;
        
            console.log('WGST.collection[collectionId].assemblies[assemblyId].PAARSNP_RESULT.paarResult.ungroupedResistanceProfile:');
            console.dir(WGST.collection[collectionId].assemblies[assemblyId].PAARSNP_RESULT.paarResult.ungroupedResistanceProfile);
        } // for
    };

    /**
     * Description
     * @method populateListOfAntibiotics
     * @param {} $antibioticSelectElement
     * @return 
     */
    var populateListOfAntibiotics = function($antibioticSelectElement) {
        // Populate list of antibiotics
        var antibioticGroupName,
            antibioticName,
            antibioticNames = [],
            antibioticOptionHtmlElements = {};
            //antibiotics = {};

        for (antibioticGroupName in WGST.antibiotics) {
            for (antibioticName in WGST.antibiotics[antibioticGroupName]) {
                //antibiotics[antibioticName] = WGST.antibiotics[antibioticGroupName][antibioticName];
                antibioticNames.push(antibioticName);
                antibioticOptionHtmlElements[antibioticName] = '<option value="' + antibioticName.replace(WGST.antibioticNameRegex, '_').toLowerCase() + '">' + antibioticName + '</option>';
            }
        }

        // Sort antibiotic names
        antibioticNames.sort();

        var antibioticCounter = antibioticNames.length;

        for (antibioticCounter = 0; antibioticCounter < antibioticNames.length;) {
            antibioticName = antibioticNames[antibioticCounter];
            $antibioticSelectElement.append($(antibioticOptionHtmlElements[antibioticName]));
            
            antibioticCounter = antibioticCounter + 1;
        }
    };

    WGST.socket.connection.on('collectionTreeMergeNotification', function(mergedCollectionTreeData) {
        console.log('[WGST] Received merged tree notification');

        if (WGST.speak) {
            var message = new SpeechSynthesisUtterance('Merged collections');
            window.speechSynthesis.speak(message);
        }

        var collectionId = mergedCollectionTreeData.mergedCollectionTreeId,
            collectionTree = mergedCollectionTreeData.tree,
            assemblyIdsData = mergedCollectionTreeData.assemblies,
            assemblyIds = [];

        assemblyIds = assemblyIdsData.map(function(assembly){
            return assembly.assemblyId;
        });

        // ------------------------------------------
        // Get assemblies
        // ------------------------------------------
        console.log('[WGST] Getting merged collection assemblies');
        console.dir(assemblyIds);

        $.ajax({
            type: 'POST',
            url: '/api/assemblies/',
            datatype: 'json', // http://stackoverflow.com/a/9155217
            data: {
                assemblyIds: assemblyIds
            }
        })
        .done(function(assemblies, textStatus, jqXHR) {
            console.log('[WGST] Got merged collection assemblies');
            console.dir(assemblies);

            initCollection(collectionId, assemblies, collectionTree);
            renderCollectionTrees(collectionId, {
                // Show buttons
                matchAssemblyListButton: true,
                mergeWithButton: true
            });

            // ------------------------------------------
            // Prepare nearest representative
            // ------------------------------------------
            var assemblyId,
                assembly,
                assemblyScores;

            for (assemblyId in WGST.collection[collectionId].assemblies) {
                if (WGST.collection[collectionId].assemblies.hasOwnProperty(assemblyId)) {
                    assembly = WGST.collection[collectionId].assemblies[assemblyId];
                    assemblyScores = assembly['FP_COMP'].scores;
                    // Set top score
                    WGST.collection[collectionId].assemblies[assemblyId]['FP_COMP'].topScore = calculateAssemblyTopScore(assemblyScores);
                } // if
            } // for

            addResistanceProfileToCollection(collectionId);
            populateListOfAntibiotics($('#select-tree-node-antibiotic-merged'));

            // ------------------------------------------
            // Enable Merge Collections button
            // ------------------------------------------
            (function() {
                var mergeCollectionTreesButton = $('.wgst-tree-control__merge-collection-trees');
                mergeCollectionTreesButton.find('.wgst-spinner').hide();
                mergeCollectionTreesButton.find('.wgst-spinner-label').show();
                mergeCollectionTreesButton.attr('disabled', false);
            }());

            // ------------------------------------------
            // Close panels
            // ------------------------------------------
            // Close Collection panel
            $('.wgst-panel__collection .wgst-panel-control-button__close').trigger('click');
            // Close Collection Tree panel
            $('.wgst-panel__collection-tree .wgst-panel-control-button__close').trigger('click');

            // ------------------------------------------
            // Open collection tree panel
            // ------------------------------------------
            var collectionTreeType = 'MERGED',
                collectionTreePanelId = 'collectionTree' + '__' + collectionId + '__' + collectionTreeType;

            activatePanel(collectionTreePanelId);
            showPanel(collectionTreePanelId);
            showPanelBodyContent(collectionTreePanelId);
            bringPanelToTop(collectionTreePanelId);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('[WGST][Error] ✗ Failed to get assemblies');
            console.error(textStatus);
            console.error(errorThrown);
            console.error(jqXHR);

        });
    });

    // Listen to notifications
    // To do: Finish refactoring and clean up
    WGST.socket.connection.on('assemblyUploadNotification', function(data) {

        var collectionId = data.collectionId,
            assemblyId = data.assemblyId,
            userAssemblyId = data.userAssemblyId,
            result = data.result,
            resultKey = collectionId + '__' + assemblyId + '__' + result,
            assemblies = Object.keys(fastaFilesAndMetadata),
            numberOfAnalysisResultsPerAssembly = Object.keys(WGST.assembly.analysis).length,
            numberOfAnalysisResultsPerAllAssemblies = numberOfAnalysisResultsPerAssembly * assemblies.length,
            numberOfAnalysisResultsPerCollection = Object.keys(WGST.collection.analysis).length,
            totalNumberOfAnalysisResults = numberOfAnalysisResultsPerAllAssemblies + numberOfAnalysisResultsPerCollection;

        console.log('[WGST][Socket.io] Received assembly upload notification:');
        console.log('[WGST][Socket.io] Assembly id: ' + assemblyId);
        console.log('[WGST][Socket.io] Result: ' + result);

        // If a new result received (not a duplicate one), then process it
        if (Object.keys(WGST.upload.collection[collectionId].notifications.all).indexOf(resultKey) === -1) {
            // Track received results
            WGST.upload.collection[collectionId].notifications.all[resultKey] = 'OK';

            console.debug('[WGST] » Received ' + Object.keys(WGST.upload.collection[collectionId].notifications.all).length + ' out of ' + totalNumberOfAnalysisResults + ' assembly results' );

            // Update assembly upload bar ui only if analysis result relates to assembly, not collection
            if (Object.keys(WGST.assembly.analysis).indexOf(result) !== -1) {
                updateAssemblyUploadProgressUI(assemblyId, userAssemblyId, numberOfAnalysisResultsPerAssembly, result);
            }
            // Update collection upload bar ui
            updateCollectionUploadProgressUI(collectionId, userAssemblyId, assemblyId, totalNumberOfAnalysisResults, result);
            
            // When all results were processed - get collection
            if (totalNumberOfAnalysisResults === Object.keys(WGST.upload.collection[collectionId].notifications.all).length) {
                console.log('[WGST] ✔ Finished uploading and processing new collection ' + collectionId);

                setTimeout(function(){
                    deactivatePanel('assemblyUploadProgress');
                    resetAssemlyUpload();
                    getCollection(collectionId);
                }, 1000);
            } // if
        } // if
    });

    /**
     * Description
     * @method endAssemblyUploadProgressBar
     * @param {} collectionId
     * @return 
     */
    var endAssemblyUploadProgressBar = function(collectionId) {
        // Update bar's width
        $('.uploading-assembly-progress-container .progress-bar').width('100%');
        // Update aria-valuenow attribute
        $('.uploading-assembly-progress-container .progress-bar').attr('aria-valuenow', 100);
        // Update percentage value
        $('.uploading-assembly-progress-container .progress-percentage').text('100%');

        //$('.uploading-assembly-progress-container .progress').removeClass('active');

        // Allow smooth visual transition of elements
        setTimeout(function(){
            $('.uploading-assembly-progress-container .progress-percentage').text('All done!');
            $('.uploading-assembly-progress-container .progress').slideUp(function(){

                /*
                // Allow smooth visual transition of elements
                setTimeout(function(){
                    $('.uploaded-assembly-url').slideDown(function(){
                        $('.uploading-assembly-progress-container .progress-label').slideUp();
                    });
                }, 500);
                */

            });
        }, 500);

        // It takes less than 30 seconds to process one assembly
        //var seconds = 30 * Object.keys(fastaFilesAndMetadata).length;
            //function() {
                //$('.visit-url-seconds-number').text(seconds);
                //seconds = seconds - 1;
                //if (seconds === 0) {
                    // Hide processing assembly seconds countdown
                    //$('.uploaded-assembly-process-countdown-label').fadeOut(function(){
                        // Update status
                        //$('.uploaded-assembly-process-status').text('finished processing');
                    //});
                //}

    };

    /**
     * $('.wgst-panel__collection-panel .assemblies-summary-table').on('click', 'tr', function(event) {
     * if (event.target.type !== 'radio' && event.target.type !== 'checkbox') {
     * $(':checkbox', this).trigger('click');
     * }
     * });
     * @method isFullscreenActive
     * @param {} fullscreenName
     * @return 
     */
    var isFullscreenActive = function(fullscreenName) {
        var fullscreenElement = $('[data-fullscreen-name="' + fullscreenName + '"]');

        if (fullscreenElement.hasClass('wgst-fullscreen--active')) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Description
     * @method isFullscreenVisible
     * @param {} fullscreenName
     * @return 
     */
    var isFullscreenVisible = function(fullscreenName) {
        var fullscreenElement = $('[data-fullscreen-name="' + fullscreenName + '"]');

        if (fullscreenElement.hasClass('wgst-fullscreen--visible')) {
            return true;
        } else {
            return false;
        }
    };

    // User wants to show/hide all assemblies on map
    $('input[type="checkbox"].show-all-assemblies-on-map').on('change', function(e) {
        var showOnMapCheckboxes = $(this).closest('.collection-details').find('.collection-assembly-list .assembly-list-header-map input[type="checkbox"]');
        if ($(this).prop('checked')) {
            // Check all
            showOnMapCheckboxes.prop('checked', true).trigger('change');
        } else {
            // Uncheck all
            showOnMapCheckboxes.prop('checked', false).trigger('change');
        }
    });

    /**
     * Description
     * @method getAssembliesWithIdenticalPosition
     * @param {} markerPositionLatLng
     * @return assembliesWithIdenticalPosition
     */
    var getAssembliesWithIdenticalPosition = function(markerPositionLatLng) {
        //------------------------------------------------------
        // Figure out which marker to create
        //------------------------------------------------------
        var newMarkerLatitude = $(this).attr('data-latitude'),
            newMarkerLongitude = $(this).attr('data-longitude'),
            newMarkerPosition = new google.maps.LatLng(newMarkerLatitude, newMarkerLongitude);

        // Count markers with identical position
        var assemblyId,
            existingMarker,
            //numberOfMarkersWithIdenticalPosition = 1,
            assembliesWithIdenticalPosition = [];
        for (assemblyId in WGST.geo.map.markers.assembly) {
            existingMarker = WGST.geo.map.markers.assembly[assemblyId];
            if (markerPositionLatLng.equals(existingMarker.getPosition())) {
                //numberOfMarkersWithIdenticalPosition++;
                assembliesWithIdenticalPosition.push(assemblyId);
            }
        }

        return assembliesWithIdenticalPosition;
    };

    // User wants to show assembly on a map
    $('.wgst-panel__collection .collection-assembly-list').on('change', 'input[type="checkbox"]', function(e) {

        //======================================================
        // Map
        //======================================================
        var checkedAssemblyId = $(this).attr('data-assembly-id'),
            collectionId = $(this).closest('.wgst-collection').attr('data-collection-id');

        var allCheckedCheckboxes = $(this).closest('.collection-assembly-list').find('.show-on-map-checkbox [type="checkbox"]:checked'),
            selectedAssemblyIds = [],
            selectedAssemblyId;

        allCheckedCheckboxes.each(function(index, element){
            selectedAssemblyId = $(this).attr('data-assembly-id');
            selectedAssemblyIds.push(selectedAssemblyId);
        });

        triggerMapMarkers(collectionId, selectedAssemblyIds);

        // Open map panel if it's not displayed and map is not in fullscreen mode
        if ($('.wgst-fullscreen--active').attr('data-fullscreen-name') !== 'map') {
            if (! $('.wgst-panel__map').hasClass('wgst-panel--active')) {
                window.WGST.openPanel('map');
            }
        }

        // //------------------------------------------------------
        // // Find markers with identical position
        // //------------------------------------------------------
        // var newMarkerLatitude = $(this).attr('data-latitude'),
        //     newMarkerLongitude = $(this).attr('data-longitude'),
        //     newMarkerPosition = new google.maps.LatLng(newMarkerLatitude, newMarkerLongitude);

        // var markerIcon = '',
        //     markersWithIdenticalPosition = getAssembliesWithIdenticalPosition(newMarkerPosition);

        // // Checked
        // if ($(this).is(":checked")) {
        //     //console.log('[WGST] Creating marker for assembly id: ' + checkedAssemblyId);

        //     // //------------------------------------------------------
        //     // // Figure out which marker to create
        //     // //------------------------------------------------------
        //     // var newMarkerLatitude = $(this).attr('data-latitude'),
        //     //     newMarkerLongitude = $(this).attr('data-longitude'),
        //     //     newMarkerPosition = new google.maps.LatLng(newMarkerLatitude, newMarkerLongitude);

        //     // var markerIcon = '',
        //     //     markersWithIdenticalPosition = getMarkersWithIdenticalPosition(newMarkerPosition);

        //     // Count markers with identical position
        //     // var markerIcon = '',
        //     //     assemblyId,
        //     //     existingMarker,
        //     //     //numberOfMarkersWithIdenticalPosition = 1,
        //     //     markersWithIdenticalPosition = [];
        //     // for (assemblyId in WGST.geo.map.markers.assembly) {
        //     //     existingMarker = WGST.geo.map.markers.assembly[assemblyId];
        //     //     if (newMarkerPosition.equals(existingMarker.getPosition())) {
        //     //         //numberOfMarkersWithIdenticalPosition++;
        //     //         markersWithIdenticalPosition.push(assemblyId);
        //     //     }
        //     // }

        //     // markerIcon = '//chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + (markersWithIdenticalPosition.length + 1) + '|00FFFF|000000';

        //     // // If more than one marker has identical position then check their resistance profiles and find out if they are any different
        //     // console.log(markersWithIdenticalPosition.length + ' markers with identical position');
        //     // // if (markersWithIdenticalPosition.length > 0) {
        //     // //     // Marker already exists for this position - do not create a new one, just update marker icon
        //     // //     WGST.geo.map.markers.assembly[checkedAssemblyId].setIcon(markerIcon);
        //     // // } else {
        //     //     // Create marker
        //     //     WGST.geo.map.markers.assembly[checkedAssemblyId] = new google.maps.Marker({
        //     //         position: new google.maps.LatLng($(this).attr('data-latitude'), $(this).attr('data-longitude')),
        //     //         map: WGST.geo.map.canvas,
        //     //         icon: markerIcon,
        //     //         draggable: true,
        //     //         optimized: true // http://www.gutensite.com/Google-Maps-Custom-Markers-Cut-Off-By-Canvas-Tiles
        //     //     });

        //     //     // Open assembly on marker click
        //     //     google.maps.event.addListener(WGST.geo.map.markers.assembly[checkedAssemblyId], 'click', function() {
        //     //         openAssemblyPanel(checkedAssemblyId);
        //     //     });
        //     // // }

        //     //------------------------------------------------------
        //     // Update list of assemblies
        //     //------------------------------------------------------

        //     // Highlight row
        //     $(this).closest('.assembly-list-item').addClass("row-selected");

        //     if (! isFullscreenVisible('map')) {
        //         if (! isPanelVisible('map')) {
        //             openPanel('map');
        //             google.maps.event.trigger(WGST.geo.map.canvas, 'resize');
        //         }
        //     }

        //     // Extend markerBounds with each metadata marker
        //     //WGST.geo.map.markerBounds.extend(WGST.geo.map.markers.assembly[checkedAssemblyId].getPosition());
        //     assemblyMarkerBounds.extend(WGST.geo.map.markers.assembly[checkedAssemblyId].getPosition());

        // // Unchecked
        // } else {

        //     if (typeof WGST.geo.map.markers.assembly[checkedAssemblyId] !== 'undefined') {
        //         console.log('[WGST] Removing marker for assembly id: ' + checkedAssemblyId);

        //         markerIcon = '//chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + (markersWithIdenticalPosition.length - 1) + '|00FFFF|000000';

        //         // Remove marker
        //         WGST.geo.map.markers.assembly[checkedAssemblyId].setMap(null);
        //         delete WGST.geo.map.markers.assembly[checkedAssemblyId];

        //         for (assemblyIdMarker in WGST.geo.map.markers.assembly) {
        //             if (WGST.geo.map.markers.assembly.hasOwnProperty(assemblyIdMarker)) {
        //                 assemblyMarkerBounds.extend(WGST.geo.map.markers.assembly[assemblyIdMarker].getPosition());                        
        //             }
        //         }

        //         // Update other identical markers
        //         var assemblyId,
        //             existingMarker;
        //             //numberOfMarkersWithIdenticalPosition = 1,
        //             //assembliesWithIdenticalPosition = [];
        //         for (assemblyId in WGST.geo.map.markers.assembly) {
        //             existingMarker = WGST.geo.map.markers.assembly[assemblyId];
        //             if (newMarkerPosition.equals(existingMarker.getPosition())) {
        //                 //numberOfMarkersWithIdenticalPosition++;
        //                 //assembliesWithIdenticalPosition.push(assemblyId);
        //                 existingMarker.setIcon(markerIcon);
        //             }
        //         }

        //         // Extend markerBounds with each metadata marker
        //         //WGST.geo.map.markerBounds.extend(WGST.geo.map.markers.assembly[checkedAssemblyId].getPosition());
        //     }

        //     // Remove node highlighing
        //     $(this).closest('.assembly-list-item').removeClass("row-selected");
        // }

        // if (assemblyMarkerBounds.isEmpty()) {
        //     WGST.geo.map.canvas.setCenter(new google.maps.LatLng(48.6908333333, 9.14055555556));
        //     WGST.geo.map.canvas.setZoom(5);
        // } else {
        //     // Pan to marker bounds
        //     //WGST.geo.map.canvas.panToBounds(WGST.geo.map.markerBounds);
        //     WGST.geo.map.canvas.panToBounds(assemblyMarkerBounds);
        //     // Set the map to fit marker bounds
        //     //WGST.geo.map.canvas.fitBounds(WGST.geo.map.markerBounds);
        //     WGST.geo.map.canvas.fitBounds(assemblyMarkerBounds);
        // }

        // Check if you have selected all (filtered out) assemblies
        if ($(this).closest('.collection-assembly-list').find('input[type="checkbox"]:not(:checked)').length === 0) {
            $('input[type="checkbox"].show-all-assemblies-on-map').prop('checked', true);
        } else {
            $('input[type="checkbox"].show-all-assemblies-on-map').prop('checked', false);
        }
    });

    // User wants to select representative tree branch
    $('.collection-assembly-list').on('change', 'input[type="radio"]', function(e) {

        //
        // Temporary disable this functionality until representative collection is reuploaded
        //
        return;

        var selectedAssemblyId = $(this).attr('data-assembly-id'),
            collectionId = $(this).closest('.wgst-collection-info').attr('data-collection-id');

        $('.collection-assembly-list .assembly-list-item.row-selected').removeClass('row-selected');
        $('.collection-assembly-list .assembly-list-item[data-assembly-id="' + selectedAssemblyId + '"]').addClass('row-selected');

        WGST.collection[collectionId].tree.canvas.selectNodes(selectedAssemblyId);

        // var leaves = WGST.collection[collectionId].tree.canvas.leaves;
        // console.dir(WGST.collection[collectionId].tree.canvas.leaves);
        // var selectedLeaf = $.grep(leaves, function(leaf){ return leaf.id === selectedAssemblyId; });
        // selectedLeaf[0].nodeShape = 'square';
        //WGST.collection[collectionId].tree.canvas.leaves[selectedAssemblyId].nodeShape = 'rectangular';

        // Show collection tree panel
        activatePanel('collectionTree');
        showPanel('collectionTree');
        showPanelBodyContent('collectionTree');
        bringPanelToTop('collectionTree');

        //======================================================
        // Tree - THIS IS FOR SELECTING MULTIPLE ASSEMBLIES
        //======================================================

        // // Store node ids to highlight in a string
        // var checkedAssemblyNodesString = '',
        //     collectionId = $(this).closest('.wgst-panel').attr('data-collection-id');

        // // Get node id of each node that user selected via checked checkbox 
        // $('.wgst-panel__collection .collection-assembly-list input[type="radio"]:checked').each(function(){
        //     // Concat assembly ids to string
        //     // Use this string to highlight nodes on tree
        //     if (checkedAssemblyNodesString.length > 0) {
        //         checkedAssemblyNodesString = checkedAssemblyNodesString + ',' + $(this).attr('data-assembly-id');
        //     } else {
        //         checkedAssemblyNodesString = $(this).attr('data-assembly-id');
        //     }
        // });

        // //console.debug('checkedAssemblyNodesString: ' + checkedAssemblyNodesString);
        // //console.dir(WGST.collection[collectionId].tree.canvas);

        // // Highlight assembly with the highest score on the representative tree

        // WGST.collection[collectionId].tree.canvas.selectNodes(checkedAssemblyNodesString);
        // //WGST.representativeTree.tree.selectNodes(checkedAssemblyNodesString);
    });

    $('.assemblies-upload-cancel-button').on('click', function() {
        // Close FASTA files upload panel
        $('.assembly-upload-panel').hide();
        // Remove stored dropped FASTA files
        fastaFilesAndMetadata = {};
        // Remove stored selected FASTA file
        selectedFastaFileName = '';
        // Remove analytics HTML element
        $('.wgst-assembly-upload__analytics ul').html('');
        // Remove metadata HTML element
        $('.wgst-assembly-upload__metadata ul').html('');
        // Reset progress bar
        // Update bar's width
        $('.adding-metadata-progress-container .progress-bar').width('0%');
        // Update aria-valuenow attribute
        $('.adding-metadata-progress-container .progress-bar').attr('aria-valuenow', 0);
        // Update percentage value
        $('.adding-metadata-progress-container .progress-percentage').text('0%');
        // Remove metadata marker
        WGST.geo.map.markers.metadata.setMap(null);
    });

    // var assemblyUploadDoneHandler = function(collectionId, assemblyId) {
    //     return function(data, textStatus, jqXHR) {
    //         console.log('[WGST] Successfully uploaded ' + assemblyId + ' assembly');

    //         // Create assembly URL
    //         //var url = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/assembly/' + 'FP_COMP_' + assemblyId;
    //         //$('.uploaded-assembly-url-input').val(url);

    //         // Mark assembly as uploaded
    //         fastaFilesAndMetadata[assemblyId].uploaded = true;

    //         updateAssemblyUploadProgress(collectionId, fastaFilesAndMetadata[assemblyId].name, assemblyId, WGST.assembly.analysis.UPLOAD_OK);
    //     };
    // };

    var numberOfFilesProcessing = 0,
        PARALLEL_UPLOAD_ASSEMBLY_LIMIT = 5,
        ASSEMBLY_UPLOAD_TIMER = 2000;

    /**
     * Description
     * @method uploadAssembly
     * @param {} collectionId
     * @param {} assemblyId
     * @return 
     */
    var uploadAssembly = function(assembly) {
        // Upload assembly only if you are within parallel assembly upload limit
        if (numberOfFilesProcessing < PARALLEL_UPLOAD_ASSEMBLY_LIMIT) {
            console.log('[WGST] Uploading ' + assembly.assemblyId + ' assembly');

            // Increment number of assembly upload counter
            numberOfFilesProcessing = numberOfFilesProcessing + 1;
            // Set socket room id
            assembly.socketRoomId = WGST.socket.roomId;

            console.log('About to upload assembly:');
            console.dir(assembly);

            // Post assembly
            $.ajax({
                type: 'POST',
                url: '/assembly/add/',
                datatype: 'json', // http://stackoverflow.com/a/9155217
                data: assembly //fastaFilesAndMetadata[assemblyId]
            })
            //.done(assemblyUploadDoneHandler(collectionId, assemblyId))
            .done(function(data, textStatus, jqXHR) {
                // Do nothing
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log('[WGST][Error] Failed to send FASTA file object to server or received error message');
                console.error(textStatus);
                console.error(errorThrown);
                console.error(jqXHR);

                showNotification(textStatus);
                //updateAssemblyUploadProgressBar();
            });
        } else {
            setTimeout(uploadAssembly, ASSEMBLY_UPLOAD_TIMER, assembly);
        }
    };

    // var uploadAssembly = function(collectionId, assemblyId) {
    //     // Upload assembly only if you are within parallel assembly upload limit
    //     if (numberOfFilesProcessing < PARALLEL_UPLOAD_ASSEMBLY_LIMIT) {
    //         console.log('[WGST] Uploading ' + assemblyId + ' assembly');

    //         // Increment number of assembly upload counter
    //         numberOfFilesProcessing = numberOfFilesProcessing + 1;
    //         // Set socket room id
    //         fastaFilesAndMetadata[assemblyId].socketRoomId = WGST.socket.roomId;
    //         // Set assembly id
    //         fastaFilesAndMetadata[assemblyId].assemblyId = assemblyId;
    //         // Post assembly
    //         $.ajax({
    //             type: 'POST',
    //             url: '/assembly/add/',
    //             datatype: 'json', // http://stackoverflow.com/a/9155217
    //             data: fastaFilesAndMetadata[assemblyId]
    //         })
    //         //.done(assemblyUploadDoneHandler(collectionId, assemblyId))
    //         .done(function(data, textStatus, jqXHR) {
    //             // Do nothing
    //         })
    //         .fail(function(jqXHR, textStatus, errorThrown) {
    //             console.log('[WGST][ERROR] Failed to send FASTA file object to server or received error message');
    //             console.error(textStatus);
    //             console.error(errorThrown);
    //             console.error(jqXHR);

    //             showNotification(textStatus);
    //             //updateAssemblyUploadProgressBar();
    //         });
    //     } else {
    //         setTimeout(uploadAssembly, ASSEMBLY_UPLOAD_TIMER, collectionId, assemblyId);
    //     }
    // };

    var GET_COLLECTION_ID_TIMER = 2000;

    $('.assemblies-upload-ready-button').on('click', function() {
        console.log('[WGST] Getting ready to upload assemblies and metadata');

        // Reset panels
        resetPanelAssemblyUploadMetadata();
        resetPanelAssemblyUploadProgress();

        // Disable upload button
        //$(this).attr('disabled','disabled');

        // Remove metadata marker
        WGST.geo.map.markers.metadata.setMap(null);

        // Close panels
        deactivatePanel(['assemblyUploadNavigator', 'assemblyUploadAnalytics', 'assemblyUploadMetadata']);

        WGST.dragAndDrop.files = [];

        var userAssemblyId,
            assembltUploadProgressTemplate,
            assemblyUploadProgressHtml;

        // Post each fasta file separately
        for (userAssemblyId in fastaFilesAndMetadata) {
            if (fastaFilesAndMetadata.hasOwnProperty(userAssemblyId)) {

                assembltUploadProgressTemplate =
                '<tr data-assembly-id="{{userAssemblyId}}">'
                    + '<td class="assembly-upload-name">{{userAssemblyId}}</td>'
                    + '<td class="assembly-upload-progress">'
                        + '<div class="progress progress-striped active">'
                          + '<div class="progress-bar progress-bar-info"  role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">'
                          + '</div>'
                        + '</div>'
                    + '</td>'
                    + '<td class="assembly-upload-result assembly-upload-uploaded"><span class="glyphicon glyphicon-record"></span></td>'
                    + '<td class="assembly-upload-result assembly-upload-result-mlst"><span class="glyphicon glyphicon-record"></span></td>'
                    + '<td class="assembly-upload-result assembly-upload-result-fp-comp"><span class="glyphicon glyphicon-record"></span></td>'
                    + '<td class="assembly-upload-result assembly-upload-result-paarsnp"><span class="glyphicon glyphicon-record"></span></td>'
                    + '<td class="assembly-upload-result assembly-upload-result-core"><span class="glyphicon glyphicon-record"></span></td>'
                + '</tr>';

                assemblyUploadProgressHtml = assembltUploadProgressTemplate.replace(/{{userAssemblyId}}/g, userAssemblyId);

                // Append assembly upload progress row
                $('.assembly-list-upload-progress tbody').append(assemblyUploadProgressHtml);
            } // if
        } // for

        // Set number of assemblies
        var numberOfAssemblies = Object.keys(fastaFilesAndMetadata).length;
        $('.wgst-panel__assembly-upload-progress .header-title small').text(numberOfAssemblies);
        $('.wgst-panel__assembly-upload-progress .assemblies-upload-total').text(numberOfAssemblies);

        // Open assembly upload progress panel
        activatePanel('assemblyUploadProgress', function(){
            showPanel('assemblyUploadProgress');

            // Check if user creates new collection or uploads assemblies to the existing collection
            var collectionId = $('.wgst-panel__assembly-upload-navigator').attr('data-collection-id');

            // Upload to new collection
            //if ($('.wgst-panel__assembly-upload-navigator').attr('data-collection-id').length === 0) {
                
                console.log('[WGST] Getting collection id');

                setTimeout(function(){
                    // Get collection id
                    $.ajax({
                        type: 'POST',
                        url: '/collection/add/',
                        datatype: 'json', // http://stackoverflow.com/a/9155217
                        data: {
                            collectionId: collectionId,
                            userAssemblyIds: Object.keys(fastaFilesAndMetadata)
                        }
                    })
                    .done(function(collectionIdData, textStatus, jqXHR) {

                        var //collectionIdData = JSON.parse(data),
                            collectionId = collectionIdData.collectionId,
                            userAssemblyIdToAssemblyIdMap = collectionIdData.userAssemblyIdToAssemblyIdMap,
                            assemblyId;

                        WGST.upload.collection[collectionId] = {};
                        WGST.upload.collection[collectionId].notifications = {
                            assembly: {},
                            all: {},
                            tree: false
                        };
                        //WGST.upload.collection[collectionId].notifications.all = {};
                        //WGST.upload.collection[collectionId].notifications.tree = false; // Have you received at least 1 COLLECTION_TREE notification

                        // Replace user assembly id (fasta file name) with assembly id generated on server side
                        //var fastaFilesAndMetadataWithUpdatedIds = {};
                        var sortedFastaFilesAndMetadataWithUpdatedIds = [];
                        $.each(userAssemblyIdToAssemblyIdMap, function(assemblyId){
                            console.log('==============================================');
                            console.dir(userAssemblyIdToAssemblyIdMap);
                            console.log(assemblyId);

                            var userAssemblyId = userAssemblyIdToAssemblyIdMap[assemblyId];

                            if (typeof fastaFilesAndMetadata[userAssemblyId] !== 'undefined') {
                                //fastaFilesAndMetadataWithUpdatedIds[assemblyId] = fastaFilesAndMetadata[userAssemblyId];
                                sortedFastaFilesAndMetadataWithUpdatedIds.push([collectionId, assemblyId, fastaFilesAndMetadata[userAssemblyId]]);
                            }
                        });
                        // $.each(fastaFilesAndMetadata, function(userAssemblyId){
                        //     var assemblyId = userAssemblyIdToAssemblyIdMap[userAssemblyId];
                        //     fastaFilesAndMetadataWithUpdatedIds[assemblyId] = fastaFilesAndMetadata[userAssemblyId];
                        // });

                        //fastaFilesAndMetadata = fastaFilesAndMetadataWithUpdatedIds;

                        // Sort by user assembly id (file name)
                        sortedFastaFilesAndMetadataWithUpdatedIds.sort(function(a, b){
                            if (a[2].name > b[2].name) {
                                return 1;
                            } else if (a[2].name < b[2].name) {
                                return -1;
                            } else {
                                return 0;
                            }
                        });

                        fastaFilesAndMetadata = sortedFastaFilesAndMetadataWithUpdatedIds;

                        // Post each FASTA file separately
                        fastaFilesAndMetadata.forEach(function(assembly) {
                            //if (fastaFilesAndMetadata.hasOwnProperty(assemblyId)) {                                

                                var collectionId = assembly[0],
                                    assemblyId = assembly[1],
                                    assemblyData = assembly[2],
                                    readyToUploadAssemblyData = {};

                                //var savedCollectionId = collectionId,
                                var userAssemblyId = assemblyData.name;

                                // Add collection id to each FASTA file object
                                //fastaFilesAndMetadata[assemblyId].collectionId = savedCollectionId;
                                //assembly[1].collectionId = collectionId;

                                // TO DO: Change 'data-name' to 'data-file-name'
                                var autocompleteInput = $('li[data-name="' + userAssemblyId + '"] .assembly-sample-location-input');

                                console.debug('userAssemblyId: ' + userAssemblyId);
                                console.dir(WGST.upload);

                                console.debug('assemblyData: ');
                                console.dir(assemblyData);

                                readyToUploadAssemblyData.collectionId = collectionId;
                                readyToUploadAssemblyData.assemblyId = assemblyId;
                                readyToUploadAssemblyData.userAssemblyId = assemblyData.name;
                                readyToUploadAssemblyData.sequences = assemblyData.assembly;
                                readyToUploadAssemblyData.metadata = {
                                    datetime: WGST.upload.assembly[userAssemblyId].metadata.datetime,
                                    geography: {
                                        position: {
                                            latitude: WGST.upload.assembly[userAssemblyId].metadata.geography.position.latitude,
                                            longitude: WGST.upload.assembly[userAssemblyId].metadata.geography.position.longitude
                                        },
                                        address: WGST.upload.assembly[userAssemblyId].metadata.geography.address
                                    },
                                    source: WGST.upload.assembly[userAssemblyId].metadata.source
                                };

                                uploadAssembly(readyToUploadAssemblyData);

                                // //console.log('[WGST] Metadata for ' + assemblyId + ':');
                                // //console.debug(fastaFilesAndMetadata[assemblyId].metadata);

                                // // Create closure to save collectionId and assemblyId
                                // (function() {
                                //     console.log('===================================================================');
                                //     console.log('collectionId: ' + collectionId + ' assemblyId: ' + assemblyId);
                                //     console.log('===================================================================');

                                //     //uploadAssembly(collectionId, assemblyId);
                                //     uploadAssembly(readyToUploadAssemblyData);
                                // })();
                            //} // if
                        });

                        // // Post each FASTA file separately
                        // for (assemblyId in fastaFilesAndMetadata) {
                        //     if (fastaFilesAndMetadata.hasOwnProperty(assemblyId)) {                                

                        //         //var savedCollectionId = collectionId,
                        //         var userAssemblyId = fastaFilesAndMetadata[assemblyId].name;

                        //         // Add collection id to each FASTA file object
                        //         //fastaFilesAndMetadata[assemblyId].collectionId = savedCollectionId;
                        //         fastaFilesAndMetadata[assemblyId].collectionId = collectionId;

                        //         // TO DO: Change 'data-name' to 'data-file-name'
                        //         var autocompleteInput = $('li[data-name="' + userAssemblyId + '"] .assembly-sample-location-input');

                        //         console.debug('userAssemblyId: ' + userAssemblyId);
                        //         console.dir(WGST.upload);

                        //         // Add metadata to each FASTA file object
                        //         fastaFilesAndMetadata[assemblyId].metadata = {
                        //             datetime: WGST.upload.assembly[userAssemblyId].metadata.datetime,
                        //             geography: {
                        //                 position: {
                        //                     latitude: WGST.upload.assembly[userAssemblyId].metadata.geography.position.latitude,
                        //                     longitude: WGST.upload.assembly[userAssemblyId].metadata.geography.position.longitude
                        //                 },
                        //                 address: WGST.upload.assembly[userAssemblyId].metadata.geography.address
                        //             },
                        //             source: WGST.upload.assembly[userAssemblyId].metadata.source
                        //         };

                        //         console.log('[WGST] Metadata for ' + assemblyId + ':');
                        //         console.debug(fastaFilesAndMetadata[assemblyId].metadata);

                        //         // Create closure to save collectionId and assemblyId
                        //         (function() {
                        //             console.log('===================================================================');
                        //             console.log('collectionId: ' + collectionId + ' assemblyId: ' + assemblyId);
                        //             console.log('===================================================================');

                        //             uploadAssembly(collectionId, assemblyId);
                        //         })();
                        //     } // if
                        // } // for
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        console.log('[WGST][ERROR] Failed to get collection id');
                        console.error(textStatus);
                        console.error(errorThrown);
                        console.error(jqXHR);

                        showNotification(textStatus);
                    });
                }, GET_COLLECTION_ID_TIMER);
        }); // activatePanel()

        if (WGST.speak) {
            var message = new SpeechSynthesisUtterance('Uploading...');
            window.speechSynthesis.speak(message);
        }

    });

    $('.cancel-assembly-upload-button').on('click', function(){
        // Remove selected FASTA file

        // Remove HTML element
        $('.assembly-item[data-name="' + selectedFastaFileName + '"]').remove();
        // Delete data object
        delete fastaFilesAndMetadata[selectedFastaFileName];

        // Update assembly list slider
        $('.assembly-list-slider').slider("option", "max", WGST.dragAndDrop.droppedFiles.length);
        // Recalculate total number of selected files
        $('.total-number-of-dropped-assemblies').text(WGST.dragAndDrop.droppedFiles.length);

        updateSelectedFilesUI($('.assembly-list-slider').slider('value'));

        // Check if only 1 selected file left
        if (Object.keys(fastaFilesAndMetadata).length === 1) {
            // Update label
            $('.assembly-upload-total-number-label').text('assembly');
            // Update file name of assembly
            $('.upload-single-assembly-file-name').text(fastaFilesAndMetadata[Object.getOwnPropertyNames(fastaFilesAndMetadata)[0]].name);
            // Hide multiple assemblies label
            $('.upload-multiple-assemblies-label').hide();
            // Show single assembly label
            $('.upload-single-assembly-label').show();
            // Only 1 selected file left - hide assembly navigator
            $('.assembly-navigator').hide();
        } else {
            // More than 1 selected files left - update assembly navigator
            updateRangeNavigationButtons($('.assembly-list-slider').slider('value')); 
        }

        updateSelectedFilesSummary();
        updateMetadataProgressBar();
    });

    // Bring to front selected panel
    $('body').on('mousedown', '.wgst-panel', function(){

        bringPanelToTop($(this).attr('data-panel-name'));

        /*
        // Change z index for all panels
        $('.wgst-panel').css('z-index', 100);
        // Set the  highest z index for this (selected) panel
        $(this).css('z-index', 101);
        */
    });

    // Deselect Twitter Bootstrap button on click
    $('.tree-panel .wgst-tree-controls button').on('click', function(){
        $(this).blur();
    });

    /**
     * Description
     * @method setAssemblyMetadataTimestamp
     * @param {} sourceFileName
     * @param {} targetFileName
     * @return 
     */
    var setAssemblyMetadataTimestamp = function(sourceFileName, targetFileName) {

        if (sourceFileName === targetFileName) {
            return;
        }

        var $sourceTimestampYearHtml = $('.assembly-metadata-timestamp-year[data-file-id="' + sourceFileName + '"]'),
            sourceTimestampYearValue = $sourceTimestampYearHtml.find('select option:selected').val(), 
            $sourceTimestampMonthHtml = $('.assembly-metadata-timestamp-month[data-file-id="' + sourceFileName + '"]'),
            sourceTimestampMonthValue = $sourceTimestampMonthHtml.find('select option:selected').val(),
            $sourceTimestampDayHtml = $('.assembly-metadata-timestamp-day[data-file-id="' + sourceFileName + '"]'),
            sourceTimestampDayValue = $sourceTimestampDayHtml.find('select option:selected').val(),
            $targetTimestampYearHtml = $('.assembly-metadata-timestamp-year[data-file-id="' + targetFileName + '"]'),
            $targetTimestampMonthHtml = $('.assembly-metadata-timestamp-month[data-file-id="' + targetFileName + '"]'),
            $targetTimestampDayHtml = $('.assembly-metadata-timestamp-day[data-file-id="' + targetFileName + '"]'),
            $targetTimestampDaySelect = $targetTimestampDayHtml.find('select');

        // ---------------------------------------------------------
        // Sync state between source and target input elements
        // ---------------------------------------------------------
        if (sourceTimestampYearValue !== '-1') {
            // Select year option
            $targetTimestampYearHtml.find('option[value="' + sourceTimestampYearValue + '"]').prop('selected', true);
        }
        if (sourceTimestampMonthValue !== '-1') {
            // Select month option
            $targetTimestampMonthHtml.find('option[value="' + sourceTimestampMonthValue + '"]').prop('selected', true);
        }
        if (sourceTimestampDayValue !== '-1') {
            populateDaySelect($targetTimestampDaySelect, sourceTimestampYearValue, sourceTimestampMonthValue);
            // Select day option
            $targetTimestampDaySelect.find('option[value="' + sourceTimestampDayValue + '"]').prop('selected', true);
        }
        // Show timestamp parts
        if ($sourceTimestampYearHtml.is(':visible')) {
            $targetTimestampYearHtml.removeClass('hide-this');
        }
        if ($sourceTimestampMonthHtml.is(':visible')) {
            $targetTimestampMonthHtml.removeClass('hide-this');
        }
        if ($sourceTimestampDayHtml.is(':visible')) {
            $targetTimestampDayHtml.removeClass('hide-this');
        }
    };

    $('.wgst-panel__assembly-upload-metadata').on('click', '.copy-metadata-to-all-empty-assemblies', function() {
        // -------------------------------------------------------
        // Copy same metadata to all assemblies with no metadata
        // -------------------------------------------------------
        var $sourceAssemblyMetadata = $(this).closest('.assembly-metadata'),
            $sourceAssemblyMetadataLocation = $sourceAssemblyMetadata.find('.assembly-sample-location-input'),
            $sourceAssemblyMetadataSource = $sourceAssemblyMetadata.find('.assembly-sample-source-input');

        var source = {
            fileName: $(this).closest('.assembly-item').attr('data-name'),
            fileId: $(this).closest('.assembly-item').attr('data-file-id')
        };
        source.metadata = WGST.upload.assembly[source.fileName].metadata;

        // var sourceFileName = $(this).closest('.assembly-item').attr('data-name'),
        //     sourceFileId = $(this).closest('.assembly-item').attr('data-file-id'),
        //     sourceMetadata = WGST.upload.assembly[sourceFileName].metadata,
        //     targetFileId;

        var $assemblyUploadMetadataPanel = $('.wgst-panel__assembly-upload-metadata'),
            $assemblyItem,
            targetFileId;

        $.each(WGST.upload.assembly, function(targetFileName, targetFileMetadata){
            // Only copy metadata to assemblies with no metadata
            if (Object.keys(targetFileMetadata.metadata).length === 0) {
                //
                // Important! http://docstore.mik.ua/orelly/webprog/jscript/ch11_02.htm
                // This is copying by reference (not good for this case):
                // WGST.upload.assembly[targetFileName].metadata = source.metadata;
                // We need to copy by value!
                //
                // Copy datetime
                WGST.upload.assembly[targetFileName].metadata.datetime = source.metadata.datetime;
                // Copy geography
                WGST.upload.assembly[targetFileName].metadata.geography = {
                    address: '',
                    position: {
                        latitude: '',
                        longitude: ''
                    },
                    type: ''
                };
                WGST.upload.assembly[targetFileName].metadata.geography.address = source.metadata.geography.address;
                WGST.upload.assembly[targetFileName].metadata.geography.position.latitude = source.metadata.geography.position.latitude;
                WGST.upload.assembly[targetFileName].metadata.geography.position.longitude = source.metadata.geography.position.longitude;
                WGST.upload.assembly[targetFileName].metadata.geography.type = source.metadata.geography.type;
                // Copy source
                WGST.upload.assembly[targetFileName].metadata.source = source.metadata.source;

                // Update UI
                $assemblyItem = $assemblyUploadMetadataPanel.find('.assembly-item[data-name="' + targetFileName + '"]');
                targetFileId = $assemblyItem.attr('data-file-id');

                $assemblyUploadMetadataPanel.find('.assembly-item[data-name="' + targetFileName + '"] .assembly-sample-location-input').val($sourceAssemblyMetadataLocation.val());
                $assemblyUploadMetadataPanel.find('.assembly-item[data-name="' + targetFileName + '"] .assembly-sample-source-input').val($sourceAssemblyMetadataSource.val());
                setAssemblyMetadataTimestamp(source.fileId, targetFileId);

                $('.assembly-item[data-name="' + targetFileName + '"] .assembly-metadata .form-block').show();
            } // if
        });

        // // Get metadata from selected assembly
        // var //metadataElementTimestamp = $(this).closest('.assembly-metadata').find('.assembly-sample-datetime-input'),
        //     metadataElementLocation = $(this).closest('.assembly-metadata').find('.assembly-sample-location-input'),
        //     metadataElementSource = $(this).closest('.assembly-metadata').find('.assembly-sample-source-input');

        // // Set value
        // $('.assembly-item').each(function(){
        //     targetFileId = $(this).attr('data-file-id');

        //     console.dir($(this));

        //     console.log('sourceFileId: ' + sourceFileId);
        //     console.log('targetFileId: ' + targetFileId);

        //     setAssemblyMetadataTimestamp(sourceFileId, targetFileId);
        // });

        //$('.assembly-metadata').find('.assembly-sample-datetime-input').val(metadataElementTimestamp.val());
        // $('.assembly-metadata').find('.assembly-sample-location-input').val(metadataElementLocation.val());
        // $('.assembly-metadata').find('.assembly-sample-source-input').val(metadataElementSource.val());

        // // Set data
        // $('.assembly-metadata').find('.assembly-sample-location-input').attr('data-latitude', metadataElementLocation.attr('data-latitude'));
        // $('.assembly-metadata').find('.assembly-sample-location-input').attr('data-longitude', metadataElementLocation.attr('data-longitude'));

        // Show all metadata
        $('.assembly-metadata-block').show();

        updateMetadataProgressBar();
    });

    // $('.wgst-panel__assembly-upload-metadata').on('click', '.apply-to-all-assemblies-button', function() {

    //     // ---------------------------------------------------------
    //     // Copy same metadata to all assemblies
    //     // ---------------------------------------------------------
    //     var sourceFileName = $(this).closest('.assembly-item').attr('data-name'),
    //         sourceFileId = $(this).closest('.assembly-item').attr('data-file-id'),
    //         sourceMetadata = WGST.upload.assembly[sourceFileName].metadata,
    //         targetFileId;

    //     $.each(WGST.upload.assembly, function(targetFileName, targetMetadata){
    //         WGST.upload.assembly[targetFileName].metadata = sourceMetadata;
    //     });

    //     // Get metadata from selected assembly
    //     var //metadataElementTimestamp = $(this).closest('.assembly-metadata').find('.assembly-sample-datetime-input'),
    //         metadataElementLocation = $(this).closest('.assembly-metadata').find('.assembly-sample-location-input'),
    //         metadataElementSource = $(this).closest('.assembly-metadata').find('.assembly-sample-source-input');

    //     // Set value
    //     $('.assembly-item').each(function(){
    //         targetFileId = $(this).attr('data-file-id');

    //         console.dir($(this));

    //         console.log('sourceFileId: ' + sourceFileId);
    //         console.log('targetFileId: ' + targetFileId);

    //         setAssemblyMetadataTimestamp(sourceFileId, targetFileId);
    //     });

    //     //$('.assembly-metadata').find('.assembly-sample-datetime-input').val(metadataElementTimestamp.val());
    //     $('.assembly-metadata').find('.assembly-sample-location-input').val(metadataElementLocation.val());
    //     $('.assembly-metadata').find('.assembly-sample-source-input').val(metadataElementSource.val());

    //     // // Set data
    //     // $('.assembly-metadata').find('.assembly-sample-location-input').attr('data-latitude', metadataElementLocation.attr('data-latitude'));
    //     // $('.assembly-metadata').find('.assembly-sample-location-input').attr('data-longitude', metadataElementLocation.attr('data-longitude'));

    //     // Show metadata
    //     $('.assembly-metadata-block').show();

    //     updateMetadataProgressBar();

    // });

    $('.wgst-panel__collection, .wgst-fullscreen__collection').on('click', '.show-on-representative-tree', function(event){

        return false;

        openRepresentativeCollectionTree();

        // endPanelLoadingIndicator('representativeCollectionTree');
        // activatePanel('representativeCollectionTree');
        // showPanel('representativeCollectionTree');
        // showPanelBodyContent('representativeCollectionTree');
        // bringPanelToTop('representativeCollectionTree');

        var collectionId = $(this).closest('.wgst-collection-info').attr('data-collection-id'),
            //collectionId = $(this).closest('.wgst-panel__collection').attr('data-collection-id'),
            assemblyId = $(this).attr('data-assembly-id'),
            referenceId = WGST.collection[collectionId].assemblies[assemblyId].FP_COMP.topScore.referenceId;

        WGST.collection.representative.tree.canvas.selectNodes(referenceId);

        event.preventDefault();
    });

    // Open Assembly from Collection list
    $('.wgst-panel__collection, .wgst-panel__assembly-upload-progress, .wgst-fullscreen__collection').on('click', '.open-assembly-button', function(event){

        var assemblyId = $(this).attr('data-assembly-id');

        // ============================================================
        // Close any previously openned assembly panels
        // ============================================================

        if (isPanelActive('assembly')) {
            deactivatePanel('assembly');
            // Remove content
            $('.wgst-panel__assembly .assembly-details .assembly-detail-content').html('');
        }

        openAssemblyPanel(assemblyId);

        event.preventDefault();
    });

    $('.wgst-panel__collection').on('click', '.wgst-collection-control__show-tree', function(){
        var collectionId = $(this).attr('data-collection-id'),
            collectionTreeType = $(this).attr('data-tree-type'),
            collectionTreePanelId = 'collectionTree' + '__' + collectionId + '__' + collectionTreeType;

        activatePanel(collectionTreePanelId);
        showPanel(collectionTreePanelId);
        showPanelBodyContent(collectionTreePanelId);
        bringPanelToTop(collectionTreePanelId);
    });

    $('.wgst-panel__collection').on('click', '.wgst-collection-control__show-data-table', function(){
        var collectionId = $(this).attr('data-collection-id');
        
        // Get all assembly ids for this collection
        var assemblies = WGST.collection[collectionId].assemblies,
            assemblyIds = Object.keys(assemblies);

        // Request data
        $.ajax({
            type: 'POST',
            url: '/api/assembly/table-data',
            datatype: 'json', // http://stackoverflow.com/a/9155217
            data: {
                assemblyIds: assemblyIds
            }
        })
        .done(function(assemblyTableData, textStatus, jqXHR) {
            console.log('[WGST] Got assembly table data');
            console.dir(assemblyTableData);
        });

        // activatePanel(collectionTreePanelId);
        // showPanel(collectionTreePanelId);
        // showPanelBodyContent(collectionTreePanelId);
        // bringPanelToTop(collectionTreePanelId);
    });

    /**
     * Description
     * @method openAssemblyPanel
     * @param {} assemblyId
     * @return 
     */
    var openAssemblyPanel = function(assemblyId) {

        // ============================================================
        // Open panel
        // ============================================================

        // Show animated loading circle
        //$('.wgst-panel__assembly .wgst-panel-loading').show();

        activatePanel('assembly');
        bringPanelToTop('assembly');
        startPanelLoadingIndicator('assembly');
        showPanel('assembly');

        // ============================================================
        // Get assembly data
        // ============================================================

        // Get assembly data
        $.ajax({
            type: 'POST',
            url: '/api/assembly',
            datatype: 'json', // http://stackoverflow.com/a/9155217
            data: {
                assemblyId: assemblyId
            }
        })
        .done(function(data, textStatus, jqXHR) {
            console.log('[WGST] Received data for assembly id: ' + assemblyId);
            console.dir(data);

            // ============================================================
            // Prepare assembly panel
            // ============================================================

            var assembly = data.assembly,
                assemblyPanel = $('.wgst-panel__assembly');

            // Set assembly name
            assemblyPanel.find('.header-title small').text(assembly.ASSEMBLY_METADATA.userAssemblyId);

            // ============================================================
            // Prepare predicted resistance profile
            // ============================================================

            var antibiotics = data.antibiotics,
                assemblyResistanceProfile = assembly.PAARSNP_RESULT.paarResult.resistanceProfile,
                assemblyResistanceProfileHtml = '',
                antibioticGroupHtml = '',
                antibioticResistancesHtml = '';

            // Parse each antibiotic group
            for (var antibioticGroupName in antibiotics) {
                if (antibiotics.hasOwnProperty(antibioticGroupName)) {

                    antibioticGroupHtml = 
                    '<table class="antibiotic-group" data-antibiotic-group-name="{{antibioticGroupName}}">'
                    + '<thead>'
                        + '<tr>'
                            + '<th>{{antibioticGroupName}}</th>'
                        + '</tr>'
                    + '</thead>'
                    + '<tbody>'
                        + '<tr>'
                            + '<td>'
                                + '<table>'
                                    + '<tbody>'
                                        + '<tr>{{antibioticResistancesHtml}}</tr>'
                                    + '</tbody>'
                                + '</table>'
                            + '</td>'
                        + '</tr>'
                    + '</tbody>'
                    + '</table>',
                    antibioticNamesHtml = '',
                    antibioticResistancesHtml = '';

                    // Parse each antibiotic
                    for (var antibioticName in antibiotics[antibioticGroupName]) {
                        if (antibiotics[antibioticGroupName].hasOwnProperty(antibioticName)) {

                            var antibioticNamesHtml = antibioticNamesHtml + '<td>' + antibioticName + '</td>';

                            // Antibiotic found in Resistance Profile for this assembly
                            if (typeof assemblyResistanceProfile[antibioticGroupName] !== 'undefined') {
                                
                                if (typeof assemblyResistanceProfile[antibioticGroupName][antibioticName] !== 'undefined') {

                                    console.log('antibioticName: ' + antibioticName);

                                    var assemblyAntibioticResistanceState = assemblyResistanceProfile[antibioticGroupName][antibioticName].resistanceState;

                                    if (assemblyAntibioticResistanceState === 'RESISTANT') {
                                        antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-fail" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                    } else if (assemblyAntibioticResistanceState === 'SENSITIVE') {
                                        antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-success" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                    } else {
                                        antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                    }

                                } else {
                                    antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                    console.log('>>> Assembly resistance profile has no antibiotic: ' + antibioticName);
                                }

                            } else {
                                antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                console.log('>>> Assembly resistance profile has no antibiotic group: ' + antibioticGroupName);
                            }

                        } // if
                    } // for

                    antibioticGroupHtml = antibioticGroupHtml.replace(/{{antibioticGroupName}}/g, antibioticGroupName);
                    antibioticGroupHtml = antibioticGroupHtml.replace(/{{antibioticResistancesHtml}}/, antibioticResistancesHtml);

                    assemblyResistanceProfileHtml = assemblyResistanceProfileHtml + antibioticGroupHtml;

                } // if
            } // for

            $('.wgst-panel__assembly .assembly-detail__resistance-profile .assembly-detail-content').html($(assemblyResistanceProfileHtml));

            // ============================================================
            // Prepare ST type
            // ============================================================

            if (assembly.MLST_RESULT.stType.length === 0) {
                $('.wgst-panel__assembly .assembly-detail__st-type .assembly-detail-content').html('Not found');
            } else {
                $('.wgst-panel__assembly .assembly-detail__st-type .assembly-detail-content').html(assembly.MLST_RESULT.stType);
            } 

            // ============================================================
            // Prepare MLST
            // ============================================================

            var assemblyAlleles = assembly.MLST_RESULT.alleles,
                assemblyAllele,
                assemblyAlleleName,
                assemblyMlstHtml =
                '<table>'
                    + '<tbody>'
                        + '<tr>'
                            + '<td class="row-title">Locus Id</td>'
                            + '{{locusIds}}'
                        + '</tr>'
                        + '<tr>'
                            + '<td class="row-title">Allele Id</td>'
                            + '{{alleleIds}}'
                        + '</tr>'
                    + '</tbody>'
                + '</table>',
                locusDataHtml = '',
                alleleDataHtml = '';

            console.debug('assemblyAlleles:');
            console.dir(assemblyAlleles);

            for (assemblyAlleleName in assemblyAlleles) {
                if (assemblyAlleles.hasOwnProperty(assemblyAlleleName)) {
                    assemblyAllele = assemblyAlleles[assemblyAlleleName];
                    if (assemblyAllele === null) {
                        locusDataHtml = locusDataHtml + '<td>' + 'None' + '</td>';
                        alleleDataHtml = alleleDataHtml + '<td>' + assemblyAlleleName + '</td>';
                    } else {
                        locusDataHtml = locusDataHtml + '<td>' + assemblyAlleles[assemblyAlleleName].locusId + '</td>';
                        alleleDataHtml = alleleDataHtml + '<td>' + assemblyAlleles[assemblyAlleleName].alleleId + '</td>';
                    }
                } // if
            } // for

            assemblyMlstHtml = assemblyMlstHtml.replace('{{locusIds}}', locusDataHtml);
            assemblyMlstHtml = assemblyMlstHtml.replace('{{alleleIds}}', alleleDataHtml);

            $('.wgst-panel__assembly .assembly-detail__mlst .assembly-detail-content').html($(assemblyMlstHtml));

            // ============================================================
            // Prepare nearest representative
            // ============================================================

            var assemblyScores = assembly['FP_COMP'].scores,
                assemblyTopScore = calculateAssemblyTopScore(assemblyScores);

            $('.wgst-panel__assembly .assembly-detail__nearest-representative .assembly-detail-content').text(assemblyTopScore.referenceId);

            // ============================================================
            // Prepare scores
            // ============================================================

            var assemblyScoresHtml =
                '<table>'
                    + '<thead>'
                        + '<tr>'
                            + '<th>Reference Id</th>'
                            + '<th>Score</th>'
                        + '</tr>'
                    + '</thead>'
                    + '<tbody>'
                        + '{{assemblyScoresDataHtml}}'
                    + '</tbody>'
                + '</table>',
                assemblyScoresDataHtml = '',
                scoreText;

            // Sort scores
            var sortedAssemblyScores = Object.keys(assemblyScores).sort(function(assemblyScoreReferenceId1, assemblyScoreReferenceId2){
                return assemblyScores[assemblyScoreReferenceId1] - assemblyScores[assemblyScoreReferenceId2];
            });

            var assemblyScoreCounter = sortedAssemblyScores.length;
            for (; assemblyScoreCounter !== 0;) {
                assemblyScoreCounter = assemblyScoreCounter - 1;

                    var referenceId = sortedAssemblyScores[assemblyScoreCounter],
                        scoreData = assemblyScores[referenceId],
                        scoreText = scoreData.score.toFixed(2) + ' = ' + Math.round(scoreData.score * parseInt(assembly['FP_COMP']['fingerprintSize'], 10)) + '/' + assembly['FP_COMP']['fingerprintSize'];

                    assemblyScoresDataHtml = assemblyScoresDataHtml 
                        + '<tr>' 
                            + '<td>' + scoreData.referenceId + '</td>'
                            + '<td>' + scoreText + '</td>'
                        + '</tr>';
            } // for

            assemblyScoresHtml = assemblyScoresHtml.replace('{{assemblyScoresDataHtml}}', assemblyScoresDataHtml);

            $('.wgst-panel__assembly .assembly-detail__score .assembly-detail-content').html(assemblyScoresHtml);

            // Hide animated loading circle
            $('.wgst-panel__assembly .wgst-panel-loading').hide();
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('[WGST][ERROR] Failed to get assembly data');
            console.error(textStatus);
            console.error(errorThrown);
            console.error(jqXHR);

            showNotification(textStatus);
        });
    };

    // $('.collection-controls-show-on-representative-tree').on('click', function(){
    //     var collectionId = $(this).closest('.wgst-panel__collection').attr('data-collection-id'),
    //         nearestRepresentative = WGST.collection[collectionId];

    //         console.dir(nearestRepresentative);
    // });

    $('body').on('click', '.wgst-tree-control__show-newick', function(){
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            collectionTreeType = $(this).closest('.wgst-panel').attr('data-collection-tree-type'),
            newickStringWithLabels,
            newWindow;

        newickStringWithLabels = WGST.collection[collectionId].tree[collectionTreeType].newickStringWithLabels;

        newWindow = window.open();
        newWindow.document.write(newickStringWithLabels);
    });

    $('body').on('click', '.wgst-tree-control__decrease-label-font-size', function(){
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            collectionTreeType = $(this).closest('.wgst-panel').attr('data-collection-tree-type'),
            currentNodeTextSize,
            tree;

        tree = WGST.collection[collectionId].tree[collectionTreeType].canvas;
        currentNodeTextSize = tree.textSize;
        tree.setTextSize(currentNodeTextSize - 3);
    });

    $('body').on('click', '.wgst-tree-control__increase-label-font-size', function(){
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            collectionTreeType = $(this).closest('.wgst-panel').attr('data-collection-tree-type'),
            currentNodeTextSize,
            tree;

        tree = WGST.collection[collectionId].tree[collectionTreeType].canvas;
        currentNodeTextSize = tree.textSize;
        tree.setTextSize(currentNodeTextSize + 3);
    });

    $('body').on('click', '.wgst-tree-control__decrease-node-size', function(){
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            collectionTreeType = $(this).closest('.wgst-panel').attr('data-collection-tree-type'),
            tree,
            currentNodeSize;

        tree = WGST.collection[collectionId].tree[collectionTreeType].canvas;
        currentNodeSize = tree.baseNodeSize;

        if (currentNodeSize > 3) {
            tree.setNodeSize(currentNodeSize - 3);
            currentNodeSize = tree.baseNodeSize;
            if (currentNodeSize < 3) {
                $(this).attr('disabled', true);
            }
        } else {
            $(this).attr('disabled', true);
        }
    });
    $('body').on('click', '.wgst-tree-control__increase-node-size', function(){
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            collectionTreeType = $(this).closest('.wgst-panel').attr('data-collection-tree-type'),
            tree,
            currentNodeSize;

        tree = WGST.collection[collectionId].tree[collectionTreeType].canvas;
        currentNodeSize = tree.baseNodeSize;
        tree.setNodeSize(currentNodeSize + 3);

        if (tree.baseNodeSize > 3) {
            $(this).closest('.wgst-tree-control').find('.wgst-tree-control__decrease-node-size').attr('disabled', false);
        }
    });
    $('body').on('change', '.wgst-tree-control__show-node-labels', function(){
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            collectionTreeType = $(this).closest('.wgst-panel').attr('data-collection-tree-type'),
            tree;
        
        tree = WGST.collection[collectionId].tree[collectionTreeType].canvas;
        tree.toggleLabels();
    });

    // $('body').on('click', '.wgst-tree-control__merge-collection-trees', function(){

    //     var mergeButton = $(this);

    //     mergeButton.attr('disabled', true);
    //     mergeButton.find('.wgst-spinner-label').hide();
    //     mergeButton.find('.wgst-spinner').show();

    //     var requestData = {
    //         collectionId: mergeButton.closest('.wgst-panel').attr('data-collection-id'),
    //         mergeWithCollectionId: 'b8d3aab1-625f-49aa-9857-a5e97f5d6be5', //'78cb7009-64ac-4f04-8428-d4089aae2a13',//'851054d9-86c2-452e-b9af-8cac1d8f0ef6',
    //         collectionTreeType: mergeButton.attr('data-collection-tree-type'),
    //         socketRoomId: WGST.socket.roomId
    //     };

    //     console.log('[WGST] Requesting to merge collection trees: ' + requestData.collectionId + ', ' + requestData.mergeWithCollectionId);

    //     // Merge collection trees
    //     $.ajax({
    //         type: 'POST',
    //         url: '/api/collection/tree/merge',
    //         datatype: 'json', // http://stackoverflow.com/a/9155217
    //         data: requestData
    //     })
    //     .done(function(mergeRequestSent, textStatus, jqXHR) {
    //         console.log('[WGST] Requested to merge collection trees: ' + requestData.collectionId + ', ' + requestData.mergeWithCollectionId);
    //     });

    // });

    $('body').on('click', '.wgst-tree-control__merge-collection-trees', function(){

        var mergeButton = $(this);

        mergeButton.attr('disabled', true);
        mergeButton.find('.wgst-spinner-label').hide();
        mergeButton.find('.wgst-spinner').show();

        //-----------------------------
        // Remove after demo
        //
        var mapCollectionIdToMergedTreeId = {
            '5324c298-4cd0-4329-848b-30d7fe28a560': 'ab66c759-2242-42c2-a245-d364fcbc7c4f'
        };
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id');
        if (collectionId === '5324c298-4cd0-4329-848b-30d7fe28a560') {
            demoMergeCollectionTrees(mapCollectionIdToMergedTreeId[collectionId]);
            return;
        }
        //-----------------------------

        var requestData = {
            collectionId: mergeButton.closest('.wgst-panel').attr('data-collection-id'),
            mergeWithCollectionId: 'b8d3aab1-625f-49aa-9857-a5e97f5d6be5', //'78cb7009-64ac-4f04-8428-d4089aae2a13',//'851054d9-86c2-452e-b9af-8cac1d8f0ef6',
            collectionTreeType: mergeButton.attr('data-collection-tree-type'),
            socketRoomId: WGST.socket.roomId
        };

        console.log('[WGST] Requesting to merge collection trees: ' + requestData.collectionId + ', ' + requestData.mergeWithCollectionId);

        // Merge collection trees
        $.ajax({
            type: 'POST',
            url: '/api/collection/tree/merge',
            datatype: 'json', // http://stackoverflow.com/a/9155217
            data: requestData
        })
        .done(function(mergeRequestSent, textStatus, jqXHR) {
            console.log('[WGST] Requested to merge collection trees: ' + requestData.collectionId + ', ' + requestData.mergeWithCollectionId);
        });

    });

    var demoMergeCollectionTrees = function(mergeTreeId) {
        var mergeButton = $(this);

        mergeButton.attr('disabled', true);
        mergeButton.find('.wgst-spinner-label').hide();
        mergeButton.find('.wgst-spinner').show();

        var requestData = {
            mergeTreeId: mergeTreeId,
            //collectionId: mergeButton.closest('.wgst-panel').attr('data-collection-id'),
            //mergeWithCollectionId: 'b8d3aab1-625f-49aa-9857-a5e97f5d6be5', //'78cb7009-64ac-4f04-8428-d4089aae2a13',//'851054d9-86c2-452e-b9af-8cac1d8f0ef6',
            //collectionTreeType: mergeButton.attr('data-collection-tree-type'),
            socketRoomId: WGST.socket.roomId
        };

        console.log('[WGST] Requesting merge tree');

        // Merge collection trees
        $.ajax({
            type: 'POST',
            url: '/api/collection/merged',
            datatype: 'json', // http://stackoverflow.com/a/9155217
            data: requestData
        })
        .done(function(mergeRequestSent, textStatus, jqXHR) {
            console.log('[WGST] Requested merge tree');
        });
    };

    /**
     * Description
     * @method renderRepresentativeCollectionTree
     * @return 
     */
    var renderRepresentativeCollectionTree = function() {
        console.log('[WGST] Rendering representative collection tree');

        var collectionId = 'representative';//WGST.settings.representativeCollectionId;

        // Remove previosly rendered collection tree
        $('.wgst-panel__representative-collection-tree .wgst-tree-content').html('');
        // Attach collection id
        $('.wgst-panel__representative-collection-tree .wgst-tree-content').attr('id', 'phylocanvas_' + collectionId);

        console.log('WGST.collection.representative:');
        console.dir(WGST.collection.representative);

        WGST.collection.representative.tree.canvas = new PhyloCanvas.Tree($('[data-panel-name="representativeCollectionTree"] .wgst-tree-content').get(0), { history_collapsed: true });
        WGST.collection.representative.tree.canvas.load('/data/reference_tree.nwk');
        WGST.collection.representative.tree.canvas.treeType = 'rectangular';

        // // Need to resize to fit it correctly
        // WGST.collection.representative.tree.canvas.resizeToContainer();
        // // Need to redraw to actually see it
        // WGST.collection.representative.tree.canvas.drawn = false;
        // WGST.collection.representative.tree.canvas.draw();
    };

    /**
     * Description
     * @method openRepresentativeCollectionTree
     * @return 
     */
    var openRepresentativeCollectionTree = function() {
        console.log('[WGST] Opening representative collection tree');

        // TO DO: Figure out whether representative tree is just another collection or it's a completely separate entity.
        // Currently treating it like just another collection.

        var collectionId = 'representative';//WGST.settings.representativeCollectionId;

        // ----------------------------------------
        // Init panels
        // ----------------------------------------
        // Set collection id to representativeCollectionTree panel
        $('.wgst-panel__representative-collection-tree').attr('data-collection-id', collectionId);

        // activatePanel('representativeCollectionTree', function(){
        //     startPanelLoadingIndicator('representativeCollectionTree');
        // });

        activatePanel('representativeCollectionTree');
        endPanelLoadingIndicator('representativeCollectionTree');
        showPanelBodyContent('representativeCollectionTree');
        showPanel('representativeCollectionTree');
        bringPanelToTop('representativeCollectionTree');

        // getRepresentativeCollectionTreeMetadata(function(error, representativeCollectionMetadata){
        //     if (error) {
        //         // Show error notification
        //         return;
        //     }
           
        //     renderRepresentativeCollectionTree();

        //     // // Init collection tree
        //     // WGST.collection.representative.tree.canvas = new PhyloCanvas.Tree($('[data-panel-name="representativeCollectionTree"] .phylocanvas')[0]);
        //     // // Render collection tree
        //     // //renderCollectionTree(collectionId);

        //     // WGST.collection.representative.tree.canvas.load('/data/reference_tree.nwk');
        //     // WGST.collection.representative.tree.canvas.treeType = 'rectangular';
        //     // //WGST.collection.representative.tree.showLabels = false;
        //     // WGST.collection.representative.tree.canvas.baseNodeSize = 0.5;
        //     // WGST.collection.representative.tree.canvas.setTextSize(24);
        //     // WGST.collection.representative.tree.canvas.selectedNodeSizeIncrease = 0.5;
        //     // WGST.collection.representative.tree.canvas.selectedColor = '#0059DE';
        //     // WGST.collection.representative.tree.canvas.rightClickZoom = true;
        //     // //WGST.collection.representative.tree.canvas.onselected = showRepresentativeTreeNodesOnMap;

        //     // endPanelLoadingIndicator('representativeCollectionTree');
        //     // showPanelBodyContent('representativeCollectionTree');
        //     // showPanel('representativeCollectionTree');
        // });

        // // Get representative collection metadata
        // $.ajax({
        //     type: 'GET',
        //     url: '/api/collection/representative/metadata',
        //     datatype: 'json' // http://stackoverflow.com/a/9155217
        // })
        // .done(function(representativeCollectionMetadata, textStatus, jqXHR) {
        //     console.log('[WGST] Got representative collection metadata');
        //     console.dir(representativeCollectionMetadata);

        //     // ----------------------------------------
        //     // Render collection tree
        //     // ----------------------------------------
        //     // Remove previosly rendered collection tree
        //     $('.wgst-panel__representative-collection-tree .phylocanvas').html('');
        //     // Attach collection id
        //     $('.wgst-panel__representative-collection-tree .phylocanvas').attr('id', 'phylocanvas_' + collectionId);
        //     // Init collection tree
        //     WGST.collection.representative.tree.canvas = new PhyloCanvas.Tree($('[data-panel-name="representativeCollectionTree"] .phylocanvas')[0]);
        //     // Render collection tree
        //     //renderCollectionTree(collectionId);

        //     WGST.collection.representative.tree.canvas.load('/data/reference_tree.nwk');
        //     WGST.collection.representative.tree.canvas.treeType = 'rectangular';
        //     //WGST.collection.representative.tree.showLabels = false;
        //     WGST.collection.representative.tree.canvas.baseNodeSize = 0.5;
        //     WGST.collection.representative.tree.canvas.setTextSize(24);
        //     WGST.collection.representative.tree.canvas.selectedNodeSizeIncrease = 0.5;
        //     WGST.collection.representative.tree.canvas.selectedColor = '#0059DE';
        //     WGST.collection.representative.tree.canvas.rightClickZoom = true;
        //     //WGST.collection.representative.tree.canvas.onselected = showRepresentativeTreeNodesOnMap;

        //     endPanelLoadingIndicator('representativeCollectionTree');
        //     showPanelBodyContent('representativeCollectionTree');
        //     showPanel('representativeCollectionTree');
        // })
        // .fail(function(jqXHR, textStatus, errorThrown) {
        //     console.error('✗ [WGST][Error] Failed to get representative collection metadata');
        //     console.error(textStatus);
        //     console.error(errorThrown);
        //     console.error(jqXHR);
        // });

            //WGST.collection.representative.tree.data = data.collection.tree;
            //WGST.collection[collectionId].assemblies = data.collection.assemblies;

            // // ----------------------------------------
            // // Render collection tree
            // // ----------------------------------------
            // // Remove previosly rendered collection tree
            // $('.wgst-panel__collection-tree .phylocanvas').html('');
            // // Attach collection id
            // $('.wgst-panel__collection-tree .phylocanvas').attr('id', 'phylocanvas_' + collectionId);
            // // Init collection tree
            // WGST.collection[collectionId].tree.canvas = new PhyloCanvas.Tree(document.getElementById('phylocanvas_' + collectionId));
            // // Render collection tree
            // renderCollectionTree(collectionId);

            // endPanelLoadingIndicator('collectionTree');
            // //showPanelBodyContent('collectionTree');

        // ----------------------------------------
        // Load representative collection tree
        // ----------------------------------------
        // AAA


        // WGST.representativeTree.tree.load('/data/reference_tree.nwk');
        // WGST.representativeTree.tree.treeType = 'rectangular';
        // //WGST.representativeTree.tree.showLabels = false;
        // WGST.representativeTree.tree.baseNodeSize = 0.5;
        // WGST.representativeTree.tree.setTextSize(24);
        // WGST.representativeTree.tree.selectedNodeSizeIncrease = 0.5;
        // WGST.representativeTree.tree.selectedColor = '#0059DE';
        // WGST.representativeTree.tree.rightClickZoom = true;
        // WGST.representativeTree.tree.onselected = showRepresentativeTreeNodesOnMap;

        // // ==============================
        // // Load reference tree metadata
        // // ==============================
        // console.log('[WGST] Getting representative tree metadata');

        // $.ajax({
        //     type: 'POST',
        //     url: '/representative-tree-metadata/',
        //     datatype: 'json', // http://stackoverflow.com/a/9155217
        //     data: {}
        // })
        // .done(function(data, textStatus, jqXHR) {
        //     console.log('[WGST] Got representative tree metadata');
        //     console.dir(data.value);

        //     // Create representative tree markers
        //     var metadataCounter = data.value.metadata.length,
        //         metadata = data.value.metadata,
        //         accession,
        //         marker;

        //     for (; metadataCounter !== 0;) {
        //         // Decrement counter
        //         metadataCounter = metadataCounter - 1;

        //         //console.log('[WGST] Representative tree metadata for ' + metadata[metadataCounter] + ':');
        //         //console.log(metadata[metadataCounter]);

        //         accession = metadata[metadataCounter].accession;

        //         // Set representative tree metadata
        //         WGST.representativeTree[accession] = metadata[metadataCounter];
        //     } // for
        // })
        // .fail(function(jqXHR, textStatus, errorThrown) {
        //     console.log('[WGST][ERROR] Failed to get representative tree metadata');
        //     console.error(textStatus);
        //     console.error(errorThrown);
        //     console.error(jqXHR);
        // });


    };

    $('.wgst-navigation-item').on('click', function(event){
        event.preventDefault();
    });

    $('.wgst-navigation-item__map').on('click', function(){
        var activeFullscreenElement = $('.wgst-fullscreen--active');

        if (activeFullscreenElement.attr('data-fullscreen-name') === 'map') {
            bringFullscreenToPanel(false); 
        }

        window.WGST.openPanel('map');

        google.maps.event.trigger(WGST.geo.map.canvas, 'resize');
    });

    $('.wgst-navigation-item__representative-tree').on('click', function(){
        return false;
        openRepresentativeCollectionTree();
    });

    $('.wgst-navigation-item__collection').on('click', function(){
        if (isNavItemEnabled('collection')) {
            var activeFullscreenElement = $('.wgst-fullscreen--active');

            if (activeFullscreenElement.attr('data-fullscreen-name') === 'collection') {
                bringFullscreenToPanel(false); 
            }

            window.WGST.openPanel('collection');
        }
    });

google.maps.event.addDomListener(window, "resize", function() {
    var map = WGST.geo.map.canvas;
 var center = map.getCenter();
 google.maps.event.trigger(map, "resize");
 map.setCenter(center); 
});


    /**
     * Description
     * @method maximizeCollection
     * @param {} collectionId
     * @return 
     */
    var maximizeCollection = function(collectionId) {
        console.log('[WGST] Maximizing collection ' + collectionId);

        // Put map into panel
        bringFullscreenToPanel('map');

        // Destroy all Twitter Bootstrap Tooltips
        $('[data-toggle="tooltip"]').tooltip('destroy');

        bringPanelToFullscreen('collection_' + collectionId, function(){
            // Trigger Twitter Bootstrap tooltip
            $('[data-toggle="tooltip"]').tooltip();
            // Open Map panel
            window.WGST.openPanel('map');
        });

        google.maps.event.trigger(WGST.geo.map.canvas, 'resize');

        // $('.wgst-fullscreen__collection')
        // .append($('.collection-details').clone(true))
        // .addClass('wgst-fullscreen--active')
        // .addClass('wgst-fullscreen--visible');

        // deactivatePanel('collection');

        //google.maps.event.trigger(WGST.geo.map.canvas, 'resize');














        // var activeFullscreenElement = $('.wgst-fullscreen--active'),
        //     fullscreentName = activeFullscreenElement.attr('data-fullscreen-name'),
        //     fullscreenContentFragment = document.createDocumentFragment();

        // $('.wgst-panel[data-panel-name="' + fullscreenName + '"] .wgst-panel-body-content')
        //     .html('')
        //     .append(WGST.geo.map.canvas.getDiv());

        //.html(activeFullscreenElement.html());

        // activeFullscreenElement
        //     .removeClass('wgst-fullscreen--active')
        //     .removeClass('wgst-fullscreen--visible');

        //$('.wgst-fullscreen--active').removeClass('.wgst-fullscreen--active');

        // endPanelLoadingIndicator(fullscreenName);
        // showPanelBodyContent(fullscreenName);

        //$('.wgst-fullscreen__collection').html($('.collection-details').html());
        
        //$('.wgst-fullscreen__collection').append($('.collection-details').clone(true)).addClass('wgst-fullscreen--active').addClass('wgst-fullscreen--visible');
        // $('.wgst-fullscreen__collection')
        //     .html($('<div/>').append($('.collection-details')).html())
        //     .addClass('wgst-fullscreen--active')
        //     .addClass('wgst-fullscreen--visible');

        // activatePanel('map');
        // showPanel('map');
        // bringPanelToTop('map');

        //EEE
        // Put collection content into background

    };

    // ============================================================
    // Panel control buttons
    // ============================================================

    /**
     * Description
     * @method bringFullscreenToPanel
     * @param {} andShowPanel
     * @param {} callback
     * @return 
     */
    var bringFullscreenToPanel = function(andShowPanel, callback) {
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

    /**
     * Description
     * @method bringPanelToFullscreen
     * @param {} panelId
     * @param {} callback
     * @return 
     */
    var bringPanelToFullscreen = function(panelId, callback) {
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

    /**
     * Description
     * @method bringMapPanelToFullscreen
     * @param {} panelName
     * @param {} panelId
     * @return 
     */
    var bringMapPanelToFullscreen = function(panelName, panelId) {
        if (! isFullscreenActive(panelName)) {
            bringFullscreenToPanel(false);

            bringPanelToFullscreen(panelId, function(){
                $('[data-fullscreen-name="' + panelName + '"]')
                    .html('')
                    .append(WGST.geo.map.canvas.getDiv());

                google.maps.event.trigger(WGST.geo.map.canvas, 'resize');
            });
        } 
    };

    $('body').on('click', '.wgst-panel-control-button__maximize', function(){
        if ($(this).hasClass('wgst-panel-control-button--active')) {
            var panel = $(this).closest('.wgst-panel'),
                panelName = panel.attr('data-panel-name'),
                panelId = panel.attr('data-panel-id');

            if (panelName === 'collection') {

                // Destroy Twitter Bootstrap tooltip
                $('[data-toggle="tooltip"]').tooltip('destroy');
                
                bringFullscreenToPanel(false);

                bringPanelToFullscreen(panelId, function(){
                    $('[data-fullscreen-name="' + panelName + '"]')
                        .html('')
                        .append($('.collection-details').clone(true))

                    // Trigger Twitter Bootstrap tooltip
                    $('[data-toggle="tooltip"]').tooltip();
                });
            } else if (panelName === 'map') {

                bringMapPanelToFullscreen(panelName, panelId);

                // bringFullscreenToPanel(false);

                // bringPanelToFullscreen(panelId, function(){
                //     $('[data-fullscreen-name="' + panelName + '"]')
                //         .html('')
                //         .append(WGST.geo.map.canvas.getDiv());

                //     google.maps.event.trigger(WGST.geo.map.canvas, 'resize');
                // });

            } else if (panelName === 'collectionTree') {

                bringPanelToFullscreen(panelName, function(){

                    var treeHtmlElement = $('.wgst-panel__collection-tree').find('.wgst-tree-content'),
                        collectionTreeFullscreen = $('.wgst-fullscreen__collection-tree');

                    //collectionTreeFullscreen.append(treeHtmlElement.cloneNode(true));
                    collectionTreeFullscreen.append(treeHtmlElement.clone(true));

                    var collectionId = $('.wgst-panel__collection-tree').attr('data-collection-id');

                    $('.wgst-panel__collection-tree').html('');

                    console.log(collectionId);

                    WGST.collection[collectionId].tree.canvas.draw();
                });
            }
        } // if
    });

    $('body').on('click', '.wgst-panel-control-button__close', function(){
        if ($(this).hasClass('wgst-panel-control-button--active')) {
            var panel = $(this).closest('.wgst-panel'),
                panelName = panel.attr('data-panel-name');

            deactivatePanel(panelName);

            if (panelName === 'collection') {
                //var collectionId = panel.attr('data-collection-id');
                //closeCollection(collectionId);
            } else if (panelName === 'representativeCollectionTree') {
                var collectionId = panel.attr('data-collection-id');
                deselectAllTreeNodes(collectionId);
            }
        } // if
    });

    $('body').on('click', '.wgst-panel-control-button__opacity', function(){
        if ($(this).hasClass('wgst-panel-control-button--active')) {
            // Toggle opacity
            var panel = $(this).closest('.wgst-panel');
            if (panel.css('opacity') !== '1') {
                panel.css('opacity', '1');
            } else {
                panel.css('opacity', '0.85');
            }
        } // if
    });

    /**
     * Description
     * @method treeManipulationHandler
     * @param {} canvasElement
     * @return 
     */
    var treeManipulationHandler = function(canvasElement) {
        var canvas = canvasElement,
            canvasOffset = canvas.offset(),
            collectionId = canvas.closest('.wgst-panel').attr('data-collection-id'),
            tree = WGST.collection[collectionId].tree['CORE_TREE_RESULT'].canvas,
            leaves = tree.leaves,
            //leavesWithinCanvasViewport = [],
            canvasTopLeft = {
                top: tree.translateClickY(canvasOffset.top),
                left: tree.translateClickX(canvasOffset.left)
            },
            canvasBottomRight = {
                bottom: tree.translateClickY(canvasOffset.top + canvas.height()),
                right: tree.translateClickX(canvasOffset.left + canvas.width())
            },
            //updatedAssemblyListHtml = $('<div />'),
            collectionAssemblyList = $('.collection-assembly-list'),
            collectionAssemblyListFull = $('.collection-assembly-list-full');

        var filteredAssembliesHtml = document.createDocumentFragment(),
            assemblyListItemHtml,
            visibleAssemblyListItemCounter = 0,
            leaf,
            leafCounter = 0;

        for (; leafCounter < leaves.length;) {
            leaf = leaves[leafCounter];

            if (leaf.centerx >= canvasTopLeft.left 
                && leaf.centerx <= canvasBottomRight.right
                && leaf.centery >= canvasTopLeft.top
                && leaf.centery <= canvasBottomRight.bottom) {

                //leavesWithinCanvasViewport.push(leaf.id);

                assemblyListItemHtml = collectionAssemblyListFull.find('.assembly-list-item[data-assembly-id="' + leaf.id + '"]')[0];
                filteredAssembliesHtml.appendChild(assemblyListItemHtml.cloneNode(true));

                visibleAssemblyListItemCounter = visibleAssemblyListItemCounter + 1;
            } // if

            leafCounter = leafCounter + 1;
        } // for

        // Scrolling hint
        if (visibleAssemblyListItemCounter > 7) {
            $('.collection-assembly-list-more-assemblies').show();
        } else {
            $('.collection-assembly-list-more-assemblies').hide();
        }

        // Remove existing assemblies from assembly list
        var assemblyListHtml = collectionAssemblyList[0];
        while (assemblyListHtml.firstChild) {
            assemblyListHtml.removeChild(assemblyListHtml.firstChild);
        }

        // Append new assemblies to assembly list
        assemblyListHtml.appendChild(filteredAssembliesHtml);

        collectionAssemblyList.find('.antibiotic[data-toggle="tooltip"]').tooltip();
    };

    $('.collection-assembly-list-view-all-assemblies').on('click', function(e) {
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            collectionAssemblyList = $('.collection-assembly-list');

        // Redraw original tree and set original zoom
        WGST.collection[collectionId].tree.canvas.redrawOriginalTree();
        WGST.collection[collectionId].tree.canvas.setZoom(-0.05);

        // Remove existing assemblies from assembly list
        collectionAssemblyList.find('.assembly-list-item').remove();
        // Append new assemblies
        collectionAssemblyList.append($('.collection-assembly-list-full .assembly-list-item').clone());

        collectionAssemblyList.find('.antibiotic[data-toggle="tooltip"]').tooltip();

        // Hide filter message
        $('.collection-assembly-list-all-assemblies').hide();
        // Show scroll message
        $('.collection-assembly-list-more-assemblies').show();

        e.preventDefault();
    });

    // ============================================================
    // Listen to Phylocanvas tree user manipulation
    // ============================================================

    // $('body').on('mousedown', 'canvas', function(){
    //     $('body').on('mousemove', 'canvas', function(){
    //         treeManipulationHandler(this);            
    //     });
    //     $('body').on('mouseup', 'canvas', function(){
    //         $('body').off('mousemove', 'canvas');
    //     });
    // });

    // $('body').on('mousewheel mousedown', 'canvas', function(){
    //     treeManipulationHandler(this);
    // });

    $('body').on('click', '.tree-controls-match-assembly-list', function(){
        var $canvas = $(this).closest('.wgst-panel-body-content').find('canvas.phylocanvas');
        treeManipulationHandler($canvas);
    });

    // Init map
    WGST.geo.map.init();

});

// TO DO:
// + Sort assemblies selected to upload alphabetically.