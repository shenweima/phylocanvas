// ============================================================
// App
// ============================================================

$(function(){

    'use strict'; // Available in ECMAScript 5 and ignored in older versions. Future ECMAScript versions will enforce it by default.

    window.onerror = function(error) {
        console.error('[WGST][Error] ' + error);
        showNotification(error);
    };

    // ============================================================
    // Store application state
    // ============================================================

    var WGST = window.WGST || {};

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
            top: 160,
            left: 180  
        },
        mergedCollectionTree: {
            top: 160,
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
            FP_COMP: 'FP_COMP'  
        }
    };

    WGST.collection = {
        analysis: {
           COLLECTION_TREE: 'COLLECTION_TREE'
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
    WGST.settings.representativeCollectionId = '1fab53b0-e7fe-4660-b34e-21d501017397';//'59b792aa-b892-4106-b1dd-2e9e78abefc4';

    WGST.antibioticNameRegex = /[\W]+/g;

    WGST.socket = {
        //connection: io.connect(WGST.config.socketAddress, {secure: true}),
        connection: io.connect(WGST.config.socketAddress),
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
                maxZoom: 6
            },
            markers: {
                assembly: {},
                metadata: {},
                representativeTree: [],
                group: {}
            },
            markerBounds: new google.maps.LatLngBounds(),
            searchBoxBounds: new google.maps.LatLngBounds(),
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

    WGST.dragAndDrop = window.WGST.dragAndDrop || {};
    WGST.dragAndDrop.files = [];
    WGST.dragAndDrop.fastaFileNameRegex = /^.+(.fa|.fas|.fna|.ffn|.faa|.frn|.fasta|.contig)$/i;

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

    var showPanelBodyContent = function(panelNames) {
        // Overwrite function
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

    var showPanel = function(panelNames) {
        // Overwrite function
        var showPanel = function(panelName) {
            $('[data-panel-name="' + panelName + '"]').css('visibility', 'visible');
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

    var hidePanelBodyContent = function(panelNames) {
        // Overwrite function
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

    var hidePanel = function(panelNames) {
        // Overwrite function
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

    var startPanelLoadingIndicator = function(panelName) {
        // Hide body content
        // var panelBodyContent = $('[data-panel-name="' + panelName + '"] .wgst-panel-body-content');
        // panelBodyContent.css('visibility', 'hidden');
        // Show animated loading circle
        var panelLoadingIndicator = $('[data-panel-name="' + panelName + '"] .wgst-panel-loading');
        panelLoadingIndicator.show();
    };

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

        window.WGST.collection[collectionId].tree.canvas.redrawFromBranch(selectedNode);
    });

    $('.collection-view-horizontal-split').on('click', function(){
        var collectionTreePaper = $('.wgst-paper__collection-tree'),
            collectionMetadataPaper = $('.wgst-paper__collection-metadata');
    });

    var isPanelActive = function(panelName) {
        var panelElement = $('[data-panel-name="' + panelName + '"]');

        if (panelElement.hasClass('wgst-panel--active')) {
            return true;
        } else {
            return false;
        }
    };

    var isPanelVisible = function(panelName) {
        var panelElement = $('[data-panel-name="' + panelName + '"]');

        if (panelElement.hasClass('wgst-panel--visible')) {
            return true;
        } else {
            return false;
        }
    };

    var activatePanel = function(panelNames, callback) {
        // Overwrite function
        var activatePanel = function(panelName) {
            var panel = $('[data-panel-name="' + panelName + '"]');

            // Set position
            panel.css('top', WGST.panels[panelName].top);
            panel.css('left', WGST.panels[panelName].left);

            // Activate, but don't show
            panel.css('visibility', 'hidden');
            panel.fadeIn('fast');
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

    var deactivatePanel = function(panelNames, callback) {
        // Overwrite function
        var deactivatePanel = function(panelName) {
            var panel = $('[data-panel-name="' + panelName + '"]'),
                panelBodyContent = panel.find('.wgst-panel-body-content');

            panel.hide();
            panel.removeClass('wgst-panel--active');
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
        // Callback
        if (typeof callback === 'function') {
            callback();
        }
    };

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

    var openPanel = function(panelName) {
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

    var getRepresentativeCollectionTreeMetadata = function(callback) {
        console.log('[WGST] Getting representative collection tree metadata');
        // Get representative collection metadata
        $.ajax({
            type: 'GET',
            url: '/api/collection/representative/metadata',
            datatype: 'json' // http://stackoverflow.com/a/9155217
        })
        .done(function(representativeCollectionMetadata, textStatus, jqXHR) {
            console.log('[WGST] Got representative collection metadata');
            //console.dir(representativeCollectionMetadata);

            callback(null, representativeCollectionMetadata);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('✗ [WGST][Error] Failed to get representative collection metadata');
            console.error(textStatus);
            console.error(errorThrown);
            console.error(jqXHR);

            callback(textStatus, null);
        });
    };

    var showAlert = function(message, status, hideAfterShow) {
        console.error('✗ [WGST][Error] ' + message);
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

    var showNotification = function(message) {
        console.error('✗ [WGST][Error] ' + message);
        var errorHtmlElement = $('.wgst-notification__error');
        errorHtmlElement.html(message).show();
        //if (errorHtmlElement.is(':visible')) {}
        // setTimeout(function(){
        //     errorHtmlElement.hide();
        //     errorHtmlElement.html('');
        // }, 5000);
    };

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
            appendTo: 'body',
            scroll: false,
            //containment: "window",
            stop: function(event, ui) {
                // Store current panel position
                var panelName = ui.helper.attr('data-panel-name');
                WGST.panels[panelName].top = ui.position.top;
                WGST.panels[panelName].left = ui.position.left;
            }
        });

        // Init jQuery UI slider widget
        $('.assembly-list-slider').slider({
            range: "max",
            min: 1,
            max: 10,
            value: 1,
            animate: 'fast',
            slide: function(event, ui) {
                $('.selected-assembly-counter').text(ui.value);
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
            console.log('[WGST][Socket.io] Received room uuid');
            console.log('[WGST][Socket.io] Ready');

            // Set room id for this client
            window.WGST.socket.roomId = roomId;

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

        // Get representative collection tree metadata
        getRepresentativeCollectionTreeMetadata(function(error, representativeCollectionTreeMatadata){
            if (error) {
                // Show notification
                showNotification(error);
                return;
            }

            WGST.collection.representative.metadata = representativeCollectionTreeMatadata;

            activatePanel('representativeCollectionTree', function(){
                startPanelLoadingIndicator('representativeCollectionTree');

                renderRepresentativeCollectionTree();
            });

            initApp(WGST.init.all.REPRESENTATIVE_COLLECTION_TREE_METADATA);
        });

    })();

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
             
            console.log('[?] Assembly resistance profile:');
            console.dir(assemblies[assemblyId].PAARSNP_RESULT.paarResult.resistanceProfile);

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
                    + '<div class="assembly-list-header-id">' + '<a href="#" class="open-assembly-button" data-assembly-id="' + assemblies[assemblyId]['FP_COMP'].assemblyId + '" title="">' + assemblies[assemblyId]['ASSEMBLY_METADATA']['userAssemblyId'] + '</a>' + '</div>'
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
    };

    var isNavItemEnabled = function(navItemName) {
        var navItem = $('.wgst-navigation-item__' + navItemName);

        if (navItem.hasClass('wgst-navigation-item--active')) {
            return true;
        } else {
            return false;
        }
    };

    var enableNavItem = function(navItemName) {
        var navItem = $('.wgst-navigation-item__' + navItemName);

        if (! isNavItemEnabled(navItemName)) {
            navItem.addClass('wgst-navigation-item--active');
        }
    };

    var disableNavItem = function(navItemName) {
        var navItem = $('.wgst-navigation-item__' + navItemName);

        if (isNavItemEnabled(navItemName)) {
            navItem.removeClass('wgst-navigation-item--active');
        }
    };

    var clearCollectionAssemblyList = function(collectionId) {
        console.log('[WGST] Clearing ' + collectionId + ' collection assembly list');

        $('.wgst-panel__collection .collection-assembly-list').html('');
    };

    var closeCollection = function(collectionId) {
        console.log('[WGST] Closing collection ' + collectionId);

        //$('.wgst-panel__collection .collection-assembly-list').html('');
        clearCollectionAssemblyList(collectionId);

        deactivatePanel(['collection', 'collectionTree'], function(){
            // Delete collection object
            delete window.WGST.collection[collectionId];
            // Change URL
            window.history.replaceState('Object', 'WGST Collection', '');
        });

        // Disable 'Collection' nav item
        disableNavItem('collection');
    };

    var getCollection = function(collectionId) {
        console.log('[WGST] Getting collection ' + collectionId);

        // ----------------------------------------
        // Init panels
        // ----------------------------------------
        // Set panel id
        $('.wgst-panel__collection').attr('data-panel-id', 'collection_' + collectionId);
        // Set collection id to collection panel
        $('.wgst-panel__collection').attr('data-collection-id', collectionId);
        // Set collection id
        $('.wgst-panel__collection .collection-details').attr('data-collection-id', collectionId);
        // Set collection id to collectionTree panel
        $('.wgst-panel__collection-tree').attr('data-collection-id', collectionId);

        activatePanel('collection', function(){
            startPanelLoadingIndicator('collection');
            showPanel('collection');
        });
        activatePanel('collectionTree', function(){
            startPanelLoadingIndicator('collectionTree');
        });

        // Init collection object
        window.WGST.collection[collectionId] = {
            assemblies: {},
            tree: {
                data: {}
            }
        };

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

            console.log('Data: ');
            console.log(Object.keys(data).length);

            if (Object.keys(data).length > 0) {
                WGST.collection[collectionId].tree.data = data.collection.tree;
                WGST.collection[collectionId].assemblies = data.collection.assemblies;
                WGST.antibiotics = data.antibiotics;

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

                    console.log('resistanceProfileGroups: ' + resistanceProfileGroups);
                    console.dir(resistanceProfileGroups); // ZZZ

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

                // ----------------------------------------
                // Render collection tree
                // ----------------------------------------
                // Remove previosly rendered collection tree
                $('.wgst-panel__collection-tree .wgst-tree-content').html('');
                // Attach collection id
                $('.wgst-panel__collection-tree .wgst-tree-content').attr('id', 'phylocanvas_' + collectionId);

                // WGST.collection[collectionId].tree.canvas.setTextSize(20);
                // WGST.collection[collectionId].tree.canvas.selectedNodeSizeIncrease = 2;
                // WGST.collection[collectionId].tree.canvas.selectedColor = '#0059DE';

                // Render collection tree
                renderCollectionTree(collectionId);

                endPanelLoadingIndicator('collectionTree');
                //showPanelBodyContent('collectionTree');

                // ----------------------------------------
                // Render assembly metadata list
                // ----------------------------------------
                var assemblies = window.WGST.collection[collectionId].assemblies,
                    sortedAssemblies = [],
                    sortedAssemblyIds = [];

                // Sort assemblies in order in which they are displayed on tree
                $.each(window.WGST.collection[collectionId].tree.leavesOrder, function(leafCounter, leaf){
                    sortedAssemblies.push(assemblies[leaf.id]);
                    sortedAssemblyIds.push(leaf.id);
                });

                WGST.collection[collectionId].sortedAssemblyIds = sortedAssemblyIds;

                //renderAssemblyAnalysisList(sortedAssemblies, antibiotics);
                renderAssemblyAnalysisList(collectionId, WGST.antibiotics);

                //renderCollectionFamily(collectionId);

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

                // TO DO: Create table with results for each assembly in this collection
                // TO DO: Highlight parent node on the reference tree
                // TO DO: Create markers for each assembly in this collection?

                // deactivatePanel('assemblyUploadProgress', function(){
                //     resetAssemlyUploadPanel();                
                // });

                //AAA
                // activatePanel(['collection', 'collectionTree'], function(){
                //     // Prepare Collection Tree
                //     $('.wgst-panel__collection-tree .phylocanvas').attr('id', 'phylocanvas_' + collectionId);
                //     // Init collection tree
                //     window.WGST.collection[collectionId].tree.canvas = new PhyloCanvas.Tree(document.getElementById('phylocanvas_' + collectionId));
                //     // Render collection tree
                //     renderCollectionTree(collectionId);
                // });

                // var w = window.open();
                // var html = $(collectionReportHtml).html();
                // $(w.document.body).html(html);





                //
                // If collection has more than 100 assemblies then show fullscreen instead of panel.
                //
                // Collection has more than 100 assemblies - show fullscreen, otherwise show panel.
                if (Object.keys(WGST.collection[collectionId].assemblies).length > 100) {
                    console.log('[WGST] Collection ' + collectionId + ' will be displayed fullscreen');
                    
                    maximizeCollection(collectionId);

                    //deactivatePanel('collection');
                }

                // Enable 'Collection' nav item
                enableNavItem('collection');             
            }
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

        window.WGST.collection[collectionId].tree.canvas.displayLabels();
    });

    $('.tree-controls-hide-labels').on('click', function(){
        // Get collection id
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id');

        window.WGST.collection[collectionId].tree.canvas.hideLabels();
    });

    // $('.collection-assembly-list').on('scroll', function(){
    //     console.log('Scrolling...');

    //     var collectionId = $(this).attr('data-collection-id');

    //     window.WGST.collection[collectionId].displayedAssemblies = [];
    // });

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

    var removeAllGroupMarkers = function() {
        var allGroupMarkers = WGST.geo.map.markers.group,
            groupPositionString,
            groupMarker;

        for (groupPositionString in allGroupMarkers) {
            groupMarker = allGroupMarkers[groupPositionString].marker;
            groupMarker.setMap(null);
            delete WGST.geo.map.markers.group[groupPositionString];
        }
    };

    var triggerMapMarkers = function(collectionId, selectedAssemblyIds) {

        var assemblyMarkerBounds = new google.maps.LatLngBounds();

        //ZZZ

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

    var selectTreeNodes = function(collectionId, selectedAssemblyIds) {
        var assemblies = window.WGST.collection[collectionId].assemblies;

        if (selectedAssemblyIds.length > 0) {
            selectedAssemblyIds = selectedAssemblyIds.split(',');
        } else {
            selectedAssemblyIds = [];
        }

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
    //         branch = window.WGST.collection[collectionId].tree.canvas.branches[assemblyId],
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
    //     var tree = window.WGST.collection[collectionId].tree.canvas;


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

    $('.wgst-tree-control__change-node-label').on('change', function(){
        var selectedOption = $(this),
            collectionId = selectedOption.closest('.wgst-panel').attr('data-collection-id');

        var tree = WGST.collection[collectionId].tree.canvas,
            assemblies = WGST.collection[collectionId].assemblies,
            assemblyId;

        if (selectedOption.val() === '1') {

            // Set user assembly id as node label
            for (assemblyId in assemblies) {
                if (assemblies.hasOwnProperty(assemblyId)) {
                    // Set label only to leaf nodes, filtering out the root node
                    if (tree.branches[assemblyId] && tree.branches[assemblyId].leaf) {
                        tree.branches[assemblyId].label = assemblies[assemblyId].ASSEMBLY_METADATA.userAssemblyId;                 
                    }
                }
            }
            
        } else if (selectedOption.val() === '2') {

            // Set user assembly id as node label
            for (assemblyId in assemblies) {
                if (assemblies.hasOwnProperty(assemblyId)) {
                    // Set label only to leaf nodes, filtering out the root node
                    if (tree.branches[assemblyId] && tree.branches[assemblyId].leaf) {
                        tree.branches[assemblyId].label = WGST.collection[collectionId].assemblies[assemblyId]['FP_COMP'].topScore.referenceId;              
                    }
                }
            }

        } else if (selectedOption.val() === '3') {

            // Set user assembly id as node label
            for (assemblyId in assemblies) {
                if (assemblies.hasOwnProperty(assemblyId)) {
                    // Set label only to leaf nodes, filtering out the root node
                    if (tree.branches[assemblyId] && tree.branches[assemblyId].leaf) {
                        tree.branches[assemblyId].label = (assemblies[assemblyId]['MLST_RESULT'].stType.length === 0 ? 'Not found': assemblies[assemblyId]['MLST_RESULT'].stType);               
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
                    if (tree.branches[assemblyId] && tree.branches[assemblyId].leaf) {
                        tree.branches[assemblyId].label = resistanceProfileString;            
                    }
                }
            }

        } else if (selectedOption.val() === '5') {

            // Set user assembly id as node label
            for (assemblyId in assemblies) {
                if (assemblies.hasOwnProperty(assemblyId)) {
                    // Set label only to leaf nodes, filtering out the root node
                    if (tree.branches[assemblyId] && tree.branches[assemblyId].leaf) {
                        tree.branches[assemblyId].label = assemblies[assemblyId]['ASSEMBLY_METADATA'].geography.address;              
                    }
                }
            }
        }

        WGST.collection[collectionId].tree.canvas.draw();

    });

    $('.wgst-tree-control__change-node-colour').on('change', function(){
        var selectedOption = $(this).find('option:selected'),
            collectionId = selectedOption.closest('.wgst-panel').attr('data-collection-id');

        var tree = WGST.collection[collectionId].tree.canvas,
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

    $('.wgst-tree-control__change-tree-type').on('change', function(){
        var selectedOption = $(this).find('option:selected'),
            collectionId = selectedOption.closest('.wgst-panel').attr('data-collection-id'),
            tree;

        if ($(this).closest('.wgst-panel').attr('data-panel-name') === 'mergedCollectionTree') {
            tree = WGST.mergedCollectionTree[collectionId].tree.canvas;
        } else {
            tree = WGST.collection[collectionId].tree.canvas;
        }

        tree.setTreeType(selectedOption.val());
    });

    var renderCollectionTree = function(collectionId) {
        console.log('[WGST] Rendering ' + collectionId + ' collection tree');
        console.dir(WGST.collection[collectionId].tree);

        // Init collection tree
        WGST.collection[collectionId].tree.canvas = new PhyloCanvas.Tree(document.getElementById('phylocanvas_' + collectionId));
        //WGST.collection[collectionId].tree.canvas.use_navigator = false;
        //WGST.collection[collectionId].tree.canvas.backColour = true;
        WGST.collection[collectionId].tree.canvas.parseNwk(WGST.collection[collectionId].tree.data);
        WGST.collection[collectionId].tree.canvas.treeType = 'rectangular';
        // WGST.collection[collectionId].tree.canvas.showLabels = true;
        // WGST.collection[collectionId].tree.canvas.baseNodeSize = 5;
        // WGST.collection[collectionId].tree.canvas.setTextSize(10);
        // WGST.collection[collectionId].tree.canvas.selectedNodeSizeIncrease = 5;
        // WGST.collection[collectionId].tree.canvas.selectedColor = '#0059DE';
        // WGST.collection[collectionId].tree.canvas.rightClickZoom = false;

        var tree = WGST.collection[collectionId].tree.canvas,
            assemblies = WGST.collection[collectionId].assemblies,
            assemblyId;

        //tree.parseNwk(WGST.collection[collectionId].tree.data);
        // tree.treeType = 'rectangular';
        // tree.showLabels = true;
        // tree.baseNodeSize = 0.8;
        // tree.setTextSize(0.8);
        // tree.selectedNodeSizeIncrease = 0.5;
        // tree.selectedColor = '#0059DE';
        //tree.rightClickZoom = true;

        WGST.collection[collectionId].tree.canvas.onselected = function(selectedNodeIds) {
            selectTreeNodes(collectionId, selectedNodeIds);
        };

        // Set user assembly id as node label
        for (assemblyId in assemblies) {
            if (assemblies.hasOwnProperty(assemblyId)) {
                // Set label only to leaf nodes, filtering out the root node
                if (tree.branches[assemblyId].leaf) {
                    tree.branches[assemblyId].label = assemblies[assemblyId].ASSEMBLY_METADATA.userAssemblyId;                 
                }
            }
        }

        WGST.collection[collectionId].tree.canvas.draw();

        // Get order of nodes
        var leaves = tree.leaves;

        // console.log('Unsorted:');
        // console.dir(leaves);

        leaves.sort(function(leafOne, leafTwo){
            return leafOne.centery - leafTwo.centery;
        });

        WGST.collection[collectionId].tree.leavesOrder = leaves;

        // ====================================================================================================================
        // For dev only
        // ====================================================================================================================

        // Replace user assembly id with assembly id
        var newickString = window.WGST.collection[collectionId].tree.data;

        for (assemblyId in assemblies) {
            if (assemblies.hasOwnProperty(assemblyId)) {
                newickString = newickString.replace(assemblyId, assemblies[assemblyId].ASSEMBLY_METADATA.userAssemblyId);
            }
        }

        console.debug('» [WGST][DEV] Parsed Newick String:');
        console.log('» Uncomment to see.');
        //console.dir(newickString);

        // ====================================================================================================================
    
        // Populate list of antibiotics
        var selectAntibioticInputElement = $('#select-tree-node-antibiotic'),
            antibioticGroupName,
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
            selectAntibioticInputElement.append($(antibioticOptionHtmlElements[antibioticName]));
            
            antibioticCounter = antibioticCounter + 1;
        }
    };

    // Init map
    WGST.geo.map.init();

    var deselectAllTreeNodes = function(collectionId) {
        var tree = window.WGST.collection[collectionId].tree.canvas;

        // Workaround
        // TO DO: Refactor using official API
        tree.selectNodes('');
    };

    $('.tree-controls-select-none').on('click', function() {

        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id');
            //tree = window.WGST.collection[collectionId].tree.canvas;

        deselectAllTreeNodes(collectionId);

        // This is a workaround
        // TO DO: Refactor using official API
        //tree.selectNodes('');

        //showRepresentativeTreeNodesOnMap('');
    });

    $('.tree-controls-select-all').on('click', function() {

        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            tree = window.WGST.collection[collectionId].tree.canvas;
        
        //console.debug(window.WGST.collection[collectionId]);
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

    var showCollectionMetadataOnMap = function(collectionId, assemblyIds) {

        window.WGST.collection[collectionId].geo = window.WGST.collection[collectionId].geo || {};

        var collectionTree = window.WGST.collection[collectionId].tree.canvas,
            existingMarkers = window.WGST.collection[collectionId].geo.markers,
            existingMarkerCounter = existingMarkers.length;

        // Remove existing markers
        for (; existingMarkerCounter !== 0;) {
            existingMarkerCounter = existingMarkerCounter - 1;
            // Remove marker
            existingMarkers[existingMarkerCounter].setMap(null);
        }
        window.WGST.collection[collectionId].geo.markers = [];

        // Reset marker bounds
        window.WGST.geo.map.markerBounds = new google.maps.LatLngBounds();

        // Create new markers
        if (assemblyIds.length > 0) {
            console.log('[WGST] Selected assembly ids:' );
            console.dir(assemblyIds);

            var assemblyCounter = assemblyIds.length,
                assemblyId,
                assemblyMetadata,
                latitude,
                longitude;

            // For each assembly create marker
            for (; assemblyCounter !== 0;) {
                assemblyCounter = assemblyCounter - 1;

                assemblyId = assemblyIds[assemblyCounter];
                assemblyMetadata = window.WGST.collection[collectionId].assemblies[assemblyId]['ASSEMBLY_METADATA'];
                latitude = assemblyMetadata.geography.position.latitude;
                longitude = assemblyMetadata.geography.position.longitude;

                //Check if both latitude and longitude provided
                if (latitude && longitude) {
                    console.log("[WGST] Marker's latitude: " + latitude);
                    console.log("[WGST] Marker's longitude: " + longitude);

                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(latitude, longitude),
                        map: window.WGST.geo.map.canvas,
                        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                        // This must be optimized, otherwise white rectangles will be displayed when map is manipulated
                        // However, there is a known case when this should be false: http://www.gutensite.com/Google-Maps-Custom-Markers-Cut-Off-By-Canvas-Tiles
                        optimized: true
                    });

                    // Set marker
                    //window.WGST.geo.markers.representativeTree[accession] = marker;
                    window.WGST.collection[collectionId].assemblies[assemblyId].geo = window.WGST.collection[collectionId].assemblies[assemblyId].geo || {};
                    window.WGST.collection[collectionId].assemblies[assemblyId].geo.marker = marker;

                    // Store list of assembly ids with markers
                    window.WGST.collection[collectionId].geo.markers.push(assemblyIds);
                    
                    // Extend markerBounds with each metadata marker
                    window.WGST.geo.map.markerBounds.extend(marker.getPosition());
                } // if
            } // for
        } else { // No assemblies were selected
            console.log('[WGST] No selected assemblies');

            // Show Europe
            window.WGST.geo.map.canvas.panTo(new google.maps.LatLng(48.6908333333, 9.14055555556));
            window.WGST.geo.map.canvas.setZoom(5);
        }

        // if (typeof assemblyIds === 'string' && assemblyIds.length > 0) {
        //     console.log('[WGST] Selected assembly ids: ' );
        //     console.dir(assemblyIds);

        //     // Create collection tree markers
        //     var selectedNodeIds = nodeIds.split(','),
        //         nodeCounter = selectedNodeIds.length,
        //         accession,
        //         metadata;

        //     // For each node create representative tree marker
        //     for (; nodeCounter !== 0;) {
        //         // Decrement counter
        //         nodeCounter = nodeCounter - 1;

        //         accession = selectedNodeIds[nodeCounter];

        //         metadata = window.WGST.collection[collectionId].assemblies[accession];

        //         // Check if both latitude and longitude provided
        //         if (metadata.latitude && metadata.longitude) {

        //             console.log('[WGST] Marker\'s latitude: ' + metadata.latitude);
        //             console.log('[WGST] Marker\'s longitude: ' + metadata.longitude);

        //             var marker = new google.maps.Marker({
        //                 position: new google.maps.LatLng(metadata.latitude, metadata.longitude),
        //                 map: window.WGST.geo.map,
        //                 icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        //                 // This must be optimized, otherwise white rectangles will be displayed when map is manipulated
        //                 // However, there is a known case when this should be false: http://www.gutensite.com/Google-Maps-Custom-Markers-Cut-Off-By-Canvas-Tiles
        //                 optimized: true
        //             });
        //             // Set marker
        //             window.WGST.geo.markers.representativeTree[accession] = marker;
        //             // Extend markerBounds with each metadata marker
        //             window.WGST.geo.markerBounds.extend(marker.getPosition());
        //         }
        //     } // for

        //     // Pan to marker bounds
        //     window.WGST.geo.map.panToBounds(window.WGST.geo.markerBounds);
        //     // Set the map to fit marker bounds
        //     window.WGST.geo.map.fitBounds(window.WGST.geo.markerBounds);
        // } else { // No nodes were selected
        //     console.log('[WGST] No selected nodes');
        //     // Show Europe
        //     window.WGST.geo.map.panTo(new google.maps.LatLng(48.6908333333, 9.14055555556));
        //     window.WGST.geo.map.setZoom(5);
        // }
    };

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
        totalContigsSum = 0;

    var parseFastaFile = function(e, fileCounter, file, droppedFiles, collectionId) {

        // Init assembly upload metadata
        window.WGST.upload.assembly[file.name] = {
            metadata: {}
        };

            // Array of contigs
        var contigs = [],
            // Array of sequence parts
            contigParts = [],
            // Count total number of contigs in a single assembly
            contigsSum = 0,
            // Count contigs
            contigCounter = 0,
            // Array of DNA sequence strings
            dnaSequenceStrings = [],
            // Single DNA sequence string
            dnaSequenceString = '',
            // Single DNA sequence id
            dnaSequenceId = '',
            // Empty jQuery object
            assemblyListItem = $(),
            // N50 chart data
            chartData = [];

        // Trim, and split assembly string into array of individual contigs
        // then filter that array by removing empty strings
        contigs = e.target.result.trim().split('>').filter(function(element){
            return (element.length > 0);
        });

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

        // Clear this array of DNA sequence strings
        dnaSequenceStrings = [];
        // Clear this DNA sequence string
        dnaSequenceString = '';
        // Clear this DNA sequence id string
        dnaSequenceId = '';

        // Parse each contig
        for (; contigCounter < contigs.length; contigCounter++) {

            // Split contig string into parts
            contigParts = contigs[contigCounter].split(/\n/)
                // Filter out empty parts
                .filter(function(part){
                    return (part.length > 0);
                });

            // Trim each contig part
            var contigPartCounter = 0;
            for (; contigPartCounter < contigParts; i++) {
                contigParts[contigPartCounter] = contigParts[contigPartCounter].trim();
            }

            /*

            Validate contig parts

            */

            // If there is only one contig part then this contig is invalid
            if (contigParts.length > 1) {

                /*

                DNA sequence can contain:
                1) [CTAGNUX] characters.
                2) White spaces (e.g.: new line characters).

                The first line of FASTA file contains id and description.
                The second line theoretically contains comments (starts with #).

                To parse FASTA file you need to:
                1. Separate assembly into individual contigs by splitting file's content by > character.
                   Note: id and description can contain > character.
                2. For each sequence: split it by a new line character, 
                   then convert resulting array to string ignoring the first (and rarely the second) element of that array.

                */

                // Parse sequence DNA string

                // Create sub array of the contig parts array - cut the first element (id and description).
                //var sequenceDNAStringArray = contigParts.splice(1, contigParts.length);
                var contigPartsNoIdDescription = contigParts.splice(1, contigParts.length);

                // Very rarely the second line can be a comment
                // If the first element won't match regex then assume it is a comment
                if (! dnaSequenceRegex.test(contigPartsNoIdDescription[0].trim())) {
                    // Remove comment element from the array
                    contigPartsNoIdDescription = contigPartsNoIdDescription.splice(1, contigPartsNoIdDescription.length);
                }

                /*

                Contig string without id, description, comment is only left with DNA sequence string(s)

                */
                // Convert array of DNA sequence substrings into a single string
                // Remove whitespace
                dnaSequenceString = contigPartsNoIdDescription.join('').replace(/\s/g, '');

                // Parse sequence id
                dnaSequenceId = contigParts[0].trim().replace('>','');

                // Validate DNA sequence string
                if (dnaSequenceRegex.test(dnaSequenceString)) {
                    // Store it in array
                    dnaSequenceStrings.push(dnaSequenceString);
                    // Init sequence object
                    assemblies[fileCounter]['contigs']['individual'][contigCounter] = {};
                    // Store sequence id
                    assemblies[fileCounter]['contigs']['individual'][contigCounter]['id'] = dnaSequenceId;
                    // Store sequence string
                    assemblies[fileCounter]['contigs']['individual'][contigCounter]['sequence'] = dnaSequenceString;
                // Invalid DNA sequence string
                } else {
                    // Count as invalid sequence
                    assemblies[fileCounter]['contigs']['invalid'] = assemblies[fileCounter]['contigs']['invalid'] + 1;
                }
            } else {
                // Count as invalid sequence
                assemblies[fileCounter]['contigs']['invalid'] = assemblies[fileCounter]['contigs']['invalid'] + 1;
            }

        } // for

        // Store fasta file and metadata
        fastaFilesAndMetadata[file.name] = {
            // Cut FASTA file extension from the file name
            //name: file.name.substr(0, file.name.lastIndexOf('.')),
            name: file.name,
            assembly: e.target.result,
            metadata: {}
        };
        /*
        fastaFilesAndMetadata.push({
            // Cut FASTA file extension from the file name
            name: file.name.substr(0, file.name.lastIndexOf('.')),
            assembly: e.target.result,
            metadata: {}
        });
        */

        /*

        Calculate N50
        http://www.nature.com/nrg/journal/v13/n5/box/nrg3174_BX1.html

        */

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

        /*

        Sum lengths of every contig starting from the longest contig
        until this running sum equals one-half of the total length of all contigs in the assembly.

        */

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

        // Calculate average nucleotides per sequence
        var averageNucleotidesPerSequence = Math.floor(assemblyNucleotideSums[assemblyNucleotideSums.length - 1] / dnaSequenceStrings.length);

        // Calculate N50 quality
        // If sequence length is greater than average sequence length then quality is good
        /*
        if (assemblyN50['sequenceLength'] > averageNucleotidesPerSequence) {
            assemblyN50['quality'] = true;
        } else { // Quality is bad
            assemblyN50['quality'] = false;
        }
        */

        // Update total number of contigs to upload
        //contigsSum = contigsSum + contigs.length; // TO DO: Depricate contigsSum
        totalContigsSum = totalContigsSum + contigs.length;

        // Show average number of contigs per assembly
        $('.assembly-sequences-average').text(Math.floor(totalContigsSum / droppedFiles.length));

        // TO DO: Convert multiple strings concatenation to array and use join('')
        // Display current assembly
        assemblyListItem = $(
            //'<li class="assembly-item assembly-item-' + fileCounter + ' hide-this" data-name="' + assemblies[fileCounter]['name'] + '" id="assembly-item-' + fileCounter + '">'
            '<li class="assembly-item hide-this" data-name="' + assemblies[fileCounter]['name'] + '" id="assembly-item-' + fileCounter + '">'

                // Assembly overview
                + '<div class="assembly-overview">'

                    /*
                    + '<div class="assembly-stats-container assembly-file-name">'
                        + '<div>' + assemblies[fileCounter]['name'] + '</div>'
                    + '</div>'
                    */

                    + '<div class="assembly-stats-container">'
                        // Print a number with commas as thousands separators
                        // http://stackoverflow.com/a/2901298
                        + '<div class="assembly-stats-label">total nt</div>'
                        + '<div class="assembly-stats-number">' + assemblyNucleotideSums[assemblyNucleotideSums.length - 1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</div>'
                        //+ '<div class="assembly-stats-label">sequences</div>'
                    + '</div>'

                    + '<div class="assembly-stats-container">'
                        // Print a number with commas as thousands separators
                        // http://stackoverflow.com/a/2901298
                        + '<div class="assembly-stats-label">total contigs</div>'
                        + '<div class="assembly-stats-number assembly-stats-number-contigs">' + assemblies[fileCounter]['contigs']['total'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</div>'
                        //+ '<div class="assembly-stats-label">sequences</div>'
                    + '</div>'

                    + '<div class="assembly-stats-container">'
                        // Print a number with commas as thousands separators
                        // http://stackoverflow.com/a/2901298
                        + '<div class="assembly-stats-label">min contig</div>'
                        + '<div class="assembly-stats-number">' + sortedDnaSequenceStrings[sortedDnaSequenceStrings.length - 1].length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<small>nt</small></div>'
                        //+ '<div class="assembly-stats-label">sequences</div>'
                    + '</div>'

                    + '<div class="assembly-stats-container">'
                        // Print a number with commas as thousands separators
                        // http://stackoverflow.com/a/2901298
                        + '<div class="assembly-stats-label">mean contig</div>'
                        + '<div class="assembly-stats-number">' + averageNucleotidesPerSequence.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<small>nt</small></div>'
                        //+ '<div class="assembly-stats-label">nucleotides per sequence<br/> on average</div>'
                    + '</div>'

                    + '<div class="assembly-stats-container">'
                        // Print a number with commas as thousands separators
                        // http://stackoverflow.com/a/2901298
                        + '<div class="assembly-stats-label">max contig</div>'
                        + '<div class="assembly-stats-number">' + sortedDnaSequenceStrings[0].length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<small>nt</small></div>'
                        //+ '<div class="assembly-stats-label">sequences</div>'
                    + '</div>'

                    + '<div class="assembly-stats-container">'
                        // Print a number with commas as thousands separators
                        // http://stackoverflow.com/a/2901298
                        + '<div class="assembly-stats-label">contig N50</div>'
                        + '<div class="assembly-stats-number assembly-stats-n50-number">' + assemblyN50['sequenceLength'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<small>nt</small></div>'
                        //+ '<div class="assembly-stats-label">nucleotides in<br>N50 contig</div>'
                    + '</div>'

                + '</div>'

                // Summary
                + '<div class="assembly-content-data">'
/*
                    + '<div class="assembly-stats-container">'
                        + '<div class="assembly-stats-number">' + assemblies[fileCounter]['sequences']['total'] + '</div>'
                        + '<div class="assembly-stats-label">sequences</div>'
                    + '</div>'

                    + '<div class="assembly-stats-container">'
                        // Print a number with commas as thousands separators
                        // http://stackoverflow.com/a/2901298
                        + '<div class="assembly-stats-number">' + averageNucleotidesPerSequence.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</div>'
                        + '<div class="assembly-stats-label">nucleotides per sequence<br/> on average</div>'
                    + '</div>'
*/
                    + '<div class="sequence-length-distribution-chart-' + fileCounter + '"></div>'
                + '</div>'

                // Metadata form
                //+ '<div class="assembly-metadata">'
                    //+ '<h4>Please provide mandatory assembly metadata:</h4>'
                    /*+ '<form role="form">'

                        + '<div class="form-block assembly-metadata-' + fileCounter + '">'
                            + '<div class="form-group">'
                                + '<label for="assemblySampleDatetimeInput' + fileCounter + '">When this assembly was sampled?</label>'
                                + '<input type="text" class="form-control assembly-sample-datetime-input" id="assemblySampleDatetimeInput' + fileCounter + '" placeholder="">'
                            + '</div>'
                            + '<div class="checkbox">'
                                + '<label>'
                                  + '<input type="checkbox" id="assemblySampleDatetimeNotSure' + fileCounter + '" class="not-sure-checkbox"> I am not sure! <span class="not-sure-hint hide-this">Please provide your best estimate.</span>'
                                + '</label>'
                            + '</div>'
                        + '</div>'

                        + '<div class="form-block assembly-metadata-' + fileCounter + ' hide-this">'
                            + '<div class="form-group">'
                                + '<label for="assemblySampleLocationInput' + fileCounter + '">Where this assembly was sampled?</label>'
                                + '<input type="text" class="form-control assembly-sample-location-input" id="assemblySampleLocationInput' + fileCounter + '" placeholder="E.g.: London, United Kingdom">'
                            + '</div>'

                            + '<div class="checkbox">'
                                + '<label>'
                                  + '<input type="checkbox" id="assemblySampleLocationNotSure' + fileCounter + '" class="not-sure-checkbox"> I am not sure! <span class="not-sure-hint hide-this">Please provide your best estimate.</span>'
                                + '</label>'
                            + '</div>'  
                        + '</div>'

                        + '<div class="form-block assembly-metadata-' + fileCounter + ' hide-this">'
                            + '<button class="btn btn-default next-assembly-button" class="show-next-assembly">Next assembly</button>'
                            + ' <button class="btn btn-default apply-to-all-assemblies-button">Copy to all assemblies</button>'
                        + '</div>'

                    + '</form>'*/
                //+ '</div>'

                //+ '<div class="assembly-total-sequences">' + assemblies[fileCounter]['sequences']['all'] + '</div>'

/*                          + '<div class="assembly-identifier-container">'
                    + '<span class="assembly-identifier-label">Identifier:</span>'
                    + '<span class="assembly-identifier">' + assemblyCollection[assemblyCounter].identifier + '</span>'
                + '</div>'
                + '<div class="assembly-string-container">'
                    + '<span class="assembly-string-label">assembly preview:</span>'
                    + '<span class="assembly-string">' + assemblyCollection[assemblyCounter].assembly.slice(0, 100) + '...</span>'
                + '</div>'*/

            + '</li>'
        );

        var assemblyMetadataFormContainer = $('<div class="assembly-metadata"></div>'),
            assemblyMetadataFormHeader = $('<h4>Please provide mandatory assembly metadata:</h4>'),
            //assemblyMetadataForm = $('<form role="form"></form>'),
            assemblyMetadataForm = $('<div></div>'),
            /*
            assemblySampleSpeciesFormBlock = $(
            '<div class="form-block assembly-metadata-' + fileCounter + ' assembly-metadata-block">'
                + '<div class="form-group">'
                    + '<label for="assemblySampleSpeciesSelect' + fileCounter + '">What species have you sampled?</label>'
                    + '<select class="form-control assembly-sample-species-select" id="assemblySampleSpeciesSelect' + fileCounter + '">'
                        + '<option value="0" selected="selected">Choose species...</option>'
                        + '<option value="1">Staphylococcus aureus</option>'
                        + '<option value="2">Streptococcus pneumoniae</option>'
                    + '</select>'
                + '</div>'
            + '</div>'
            ),
            */
            assemblySampleDatetimeFormBlock = $(
            '<div class="form-block assembly-metadata-' + fileCounter + ' assembly-metadata-block">'
                + '<div class="form-group">'
                    + '<label for="assemblySampleDatetimeInput' + fileCounter + '">When this assembly was sampled?</label>'
                    + '<input type="text" class="form-control assembly-sample-datetime-input" id="assemblySampleDatetimeInput' + fileCounter + '" placeholder="">'

                    // + '<div class="input-group">'
                    //     //+ '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>'
                    // + '</div>'
                + '</div>'
                // + '<div class="checkbox">'
                //     + '<label>'
                //       + '<input type="checkbox" id="assemblySampleDatetimeNotSure' + fileCounter + '" class="not-sure-checkbox"> I am not sure! <span class="not-sure-hint hide-this">Please provide your best estimate.</span>'
                //     + '</label>'
                // + '</div>'
            + '</div>'
            ),
            assemblySampleLocationFormBlock = $(
            '<div class="form-block assembly-metadata-' + fileCounter + ' assembly-metadata-block hide-this">'
                + '<div class="form-group">'
                    + '<label for="assemblySampleLocationInput' + fileCounter + '">Where this assembly was sampled?</label>'
                    + '<input type="text" class="form-control assembly-sample-location-input" id="assemblySampleLocationInput' + fileCounter + '" placeholder="E.g.: London, United Kingdom">'

                    // + '<div class="input-group">'
                    //     //+ '<span class="input-group-addon"><span class="glyphicon glyphicon-globe"></span></span>'
                    // + '</div>'
                + '</div>'

                // + '<div class="checkbox">'
                //     + '<label>'
                //       + '<input type="checkbox" id="assemblySampleLocationNotSure' + fileCounter + '" class="not-sure-checkbox"> I am not sure! <span class="not-sure-hint hide-this">Please provide your best estimate.</span>'
                //     + '</label>'
                // + '</div>'  
            + '</div>'
            ),
            assemblySampleSourceFormBlock = $(
            '<div class="form-block assembly-metadata-' + fileCounter + ' assembly-metadata-block hide-this">'
                + '<div class="form-group">'
                    + '<label for="assemblySampleSourceInput' + fileCounter + '">What is the source of this sample?</label>'
                    + '<select name="select" class="form-control assembly-sample-source-input" id="assemblySampleSourceInput' + fileCounter + '">'
                      + '<option value="0" selected>Choose source</option>'
                      + '<option value="1">Human</option>'
                      + '<option value="2">Livestock</option>'
                      + '<option value="3">Biosphere</option>'
                      + '<option value="4">Environment</option>'
                    + '</select>'

                    // + '<div class="input-group">'
                    //     //+ '<span class="input-group-addon"><span class="glyphicon glyphicon-leaf"></span></span>'



                    //     //+ '<input type="text" class="form-control assembly-sample-source-input" id="assemblySampleSourceInput' + fileCounter + '" placeholder="E.g.: London, United Kingdom">'
                    // + '</div>'
                + '</div>'

                // + '<div class="checkbox">'
                //     + '<label>'
                //       + '<input type="checkbox" id="assemblySampleLocationNotSure' + fileCounter + '" class="not-sure-checkbox"> I am not sure! <span class="not-sure-hint hide-this">Please provide your best estimate.</span>'
                //     + '</label>'
                // + '</div>'  
            + '</div>'
            ),
            // assemblySampleMRSAFormBlock = $(
            // '<div class="form-block assembly-metadata-' + fileCounter + ' assembly-metadata-block hide-this">'
            //     + '<div class="form-group">'
            //         + '<label for="assemblySampleMRSAInput' + fileCounter + '">MRSA or MSSA?</label>'
            //         + '<select name="select" class="form-control assembly-sample-source-input" id="assemblySampleMRSAInput' + fileCounter + '">'
            //           + '<option value="0" selected>Choose</option>'
            //           + '<option value="1">MRSA</option>'
            //           + '<option value="2">MSSA</option>'
            //           + '<option value="3">Don\'t know</option>'
            //         + '</select>'
            //     + '</div>'
            // + '</div>'
            // ),
            assemblyControlsFormBlock = $(
            '<div class="form-block assembly-metadata-' + fileCounter + ' hide-this">'
                + '<button class="btn btn-default next-assembly-button" class="show-next-assembly">Next empty metadata</button>'
                + ' <button class="btn btn-default apply-to-all-assemblies-button">Copy to all assemblies</button>'
            + '</div>'
            ),
            assemblyMeatadataDoneBlock = $(
            '<div class="form-block assembly-metadata-' + fileCounter + ' hide-this">'
                + 'Ready? Click "Upload" button to upload your assemblies and metadata.'
            + '</div>'
            );

/*                <div class="upload-controls-container">
                  <button type="button" class="btn btn-success assemblies-upload-ready-button" disabled="disabled">Upload sequences and metadata</button>
                  <button type="button" class="btn btn-success assemblies-upload-ready-button" disabled="disabled">Upload metadata only</button>
                </div>*/

        //assemblyMetadataForm.append(assemblySampleSpeciesFormBlock);
        assemblyMetadataForm.append(assemblySampleDatetimeFormBlock);
        assemblyMetadataForm.append(assemblySampleLocationFormBlock);
        assemblyMetadataForm.append(assemblySampleSourceFormBlock);

        // Show form navigation buttons only when you're at the last assembly
        // TO DO: Append to .assembly-metadata instead of the classless div
        if (fileCounter < droppedFiles.length) {
            assemblyMetadataForm.append(assemblyControlsFormBlock);
        } else {
            //assemblyMetadataForm.append(assemblyMeatadataDoneBlock);
        }
        assemblyMetadataFormContainer.append(assemblyMetadataFormHeader);
        assemblyMetadataFormContainer.append(assemblyMetadataForm);

        // REFACTOR!
        var assemblyMetadataListItem = $(
            //'<li class="assembly-item assembly-item-' + fileCounter + ' hide-this" data-name="' + assemblies[fileCounter]['name'] + '" id="assembly-item-' + fileCounter + '">'
            '<li class="assembly-item hide-this" data-name="' + assemblies[fileCounter]['name'] + '" id="assembly-metadata-item-' + fileCounter + '">'
            + '</li>'
        );

        assemblyMetadataListItem.append(assemblyMetadataFormContainer);
        $('.assembly-metadata-list-container ul').append(assemblyMetadataListItem);


        //assemblyListItem.append(assemblyMetadataFormContainer);

        // Append assembly
        $('.assembly-list-container ul').append(assemblyListItem);

        // Draw N50 chart
        drawN50Chart(assemblyNucleotideSums, assemblyN50, fileCounter);

        // Chart 1
        /*          
        var data = [
            {   sequenceLength: 100,
                lengthFrequency: 10
            },
            {
                sequenceLength: 200,
                lengthFrequency: 20
            },
            {
                sequenceLength: 300,
                lengthFrequency: 30
            },
            {
                sequenceLength: 400,
                lengthFrequency: 40
            },
            {
                sequenceLength: 500,
                lengthFrequency: 50
            }
        ];
        data = chartData;
        console.log(JSON.stringify(data));

        var chartWidth = 460,
            chartHeight = 312;

        // Extent
        var xExtent = d3.extent(chartData, function(datum){
            return datum.sequenceLength;
        });

        // Scales

        // X
        var xScale = d3.scale.linear()
            //.domain(xExtent) // your data min and max
            .domain([0, d3.max(chartData, function(datum){
                return +datum.sequenceLength;
            })])
            .range([40, chartWidth - 50]); // the pixels to map, i.e. the width of the diagram

        // Y
        var yScale = d3.scale.linear()
            .domain([d3.max(chartData, function(datum){ // Can't use d3.extent in this case because min value has to be 0.
                return +datum.lengthFrequency;
            }), 0])
            .range([30, chartHeight - 52]);

        // Axes

        // X
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom');

        // Y
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left')
            // http://stackoverflow.com/a/18822793
            .ticks(d3.max(chartData, function(datum){
                return datum.lengthFrequency;
            }))
            .tickFormat(d3.format("d"));

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
            .text('Sequence length')
            .attr('class', 'axis-label')
            .attr('text-anchor', 'end')
            //.attr('x', chartWidth - 49)
            .attr('x', (chartWidth / 2) + 49)
            .attr('y', 45);

        // Y
        svg.select('.y.axis')
            .append('text')
            .text('Frequency')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            //.attr('x', -80)
            .attr('x', -(chartHeight / 2) - 22)
            //.attr('y', chartHeight / 2)
            .attr('y', -30);

        // Circles
        svg.selectAll('circle')
            .data(chartData)
            .enter()
            .append('circle')
            .attr('cx', function(datum){
                return xScale(datum.sequenceLength) + 20;
            })
            .attr('cy', function(datum){
                return yScale(datum.lengthFrequency);
            })
            .attr('r', 5);
        */

        // Show first assembly
        //$('.assembly-item-1').removeClass('hide-this');
        //$('.assembly-item').eq('0').show();
        $('#assembly-item-1').show();
        $('#assembly-metadata-item-1').show();

        // Set file name in metadata panel title
        $('.wgst-panel__assembly-upload-metadata .header-title small').text($('#assembly-metadata-item-1').attr('data-name'));

        // Set file name in analytics panel title
        $('.wgst-panel__assembly-upload-analytics .header-title small').text($('#assembly-item-1').attr('data-name'));

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
            var autocompleteInput = $('.assembly-metadata-list-container li[data-name="' + fileName + '"] .assembly-sample-location-input');

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

                if (typeof place.geometry === 'undefined') {
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

            // On change store datetime in assembly metadata
            $('li.assembly-item[data-name="' + fileName + '"] .assembly-sample-datetime-input').datetimepicker({
                useCurrent: false,
                language: 'en-gb'
            }).on('change', function(){
                WGST.upload.assembly[fileName].metadata = WGST.upload.assembly[fileName].metadata || {};
                WGST.upload.assembly[fileName].metadata.datetime = $(this).val();
            });

            // On change store source in assembly metadata
            $('li.assembly-item[data-name="' + fileName + '"] .assembly-sample-source-input').on('change', function(){
                WGST.upload.assembly[fileName].metadata = WGST.upload.assembly[fileName].metadata || {};
                WGST.upload.assembly[fileName].metadata.source = $(this).val();
            });
        
        }(file.name));
    
    }; // parseFastaFile()

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

    var handleDragOver = function(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy
    };

    var handleDrop = function(event) {
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

            // Set the highest z index for this panel
            $('.assembly-upload-panel').trigger('mousedown');

            // FileList object
            // https://developer.mozilla.org/en-US/docs/Web/API/FileList
            var droppedFiles = event.dataTransfer.files;

            WGST.dragAndDrop.files = $.merge(WGST.dragAndDrop.files, droppedFiles);
            
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
            $('.assembly-list-slider').slider("option", "max", allDroppedFiles.length);

            // Set file name
            $('.assembly-file-name').text(fileName);

            // If there is more than 1 file dropped then show assembly navigator
            if (allDroppedFiles.length > 1) {
                // Show assembly navigator
                $('.assembly-navigator').show();
                // Focus on slider handle
                $('.ui-slider-handle').focus();
            }

            $.each(allDroppedFiles, function(fileCounter, file){
                // https://developer.mozilla.org/en-US/docs/Web/API/FileList#item()
                //file = droppedFiles.item(fileCounter);

                // Validate file name   
                if (file.name.match(WGST.dragAndDrop.fastaFileNameRegex)) {
                    if ($('.wgst-panel__assembly-upload-analytics .assembly-item[data-name="' + file.name + '"]').length === 0) {

                        // Create closure (new scope) to save fileCounter, file variable with it's current value
                        (function(){
                            var fileReader = new FileReader();

                            fileReader.addEventListener('load', function(event){
                                parseFastaFile(event, fileCounter, file, droppedFiles, collectionId);
                            });

                            // Read file as text
                            fileReader.readAsText(file);
                        })();

                    }
                // Invalid file name
                } else {
                    console.log("[WGST] File not supported");
                }
            });

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
    
    var updateSelectedFilesUI = function(elementCounter) {
        // Update sequence counter label
        $('.selected-assembly-counter').text(elementCounter);
        // Update sequence list item content
        // Hide all sequences
        $('.assembly-item').hide();
        // Show selected sequence
        //$('.assembly-item-' + ui.value).show();
        //$('.assembly-item').eq(elementCounter - 1).show(); // Convert one-based index to zero-based index used by .eq()

        // Analytics
        var selectedFastaFileElement = $('#assembly-item-' + elementCounter);
        selectedFastaFileElement.show();

        // Metadata
        var selectedFastaFileElementMetadata = $('#assembly-metadata-item-' + elementCounter);
        selectedFastaFileElementMetadata.show();

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
        // Store displayed fasta file name
        //selectedFastaFileName = $('.assembly-item').eq(elementCounter - 1).attr('data-name'); 
        selectedFastaFileName = selectedFastaFileElement.attr('data-name'); 
    };

    var resetPanelAssemblyUploadNavigator = function() {
        var panel = $('.wgst-panel__assembly-upload-navigator');
        // Set average number of contigs per assembly
        panel.find('.assembly-sequences-average').text('0');
        // Set total number of selected assemblies/files
        panel.find('.assembly-upload-total-number').text('0');
    };

    var resetPanelAssemblyUploadProgress = function() {
        var panel = $('.wgst-panel__assembly-upload-progress');
        panel.find('.assemblies-upload-progress .progress-bar').attr('class', 'progress-bar').attr('aria-valuenow', '0');
        panel.find('.assemblies-upload-progress .progress-bar').attr('style', 'width: 0%');
        panel.find('.assemblies-upload-progress .progress-bar').html('');
        panel.find('.assemblies-upload-progress .assemblies-upload-processed').html('0');
        panel.find('.assembly-list-upload-progress tbody').html('');
    };

    var resetPanelAssemblyUploadMetadata = function() {
        var panel = $('.wgst-panel__assembly-upload-metadata');

        // Clear metadata list of assembly items
        panel.find('.assembly-metadata-list-container ul').html('');

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

    var resetPanelAssemblyUploadAnalytics = function() {
        var panel = $('.wgst-panel__assembly-upload-analytics');
        panel.find('.assembly-list-container ul').html('');
    };

    var resetAssemlyUpload = function() {
        // Empty list of selected FASTA files and metadata
        fastaFilesAndMetadata = {};

        resetPanelAssemblyUploadNavigator();
        resetPanelAssemblyUploadAnalytics();
        resetPanelAssemblyUploadMetadata();
    };

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

    var assemblyListSliderEventHandler = function(event, ui) {
        updateSelectedFilesUI(ui.value);
        /*
        // Update sequence list item content
        // Hide all sequences
        $('.assembly-item').hide();
        // Show selected sequence
        //$('.assembly-item-' + ui.value).show();
        $('.assembly-item').eq(ui.value-1).show();
        // Update assembly file name
        $('.assembly-file-name').text($('.assembly-item-' + ui.value).attr('data-name'));
        // Store displayed fasta file name
        selectedFastaFileName = $('.assembly-item-' + ui.value).attr('data-name');
        */
    };
    // Handle slide event
    // Triggered when user moved but didn't release range handle
    $('.assembly-list-slider').on('slide', assemblyListSliderEventHandler);
    // Handle slidechange event
    // Triggered when user clicks a button or releases range handle
    $('.assembly-list-slider').on('slidechange', assemblyListSliderEventHandler);
    // Navigate to the previous sequence
    $('.nav-prev-item').on('click', function(e){
        // Check if selected sequence counter value is greater than 1
        if ($('.assembly-list-slider').slider('value') > 1) {
            // Decrement slider's value
            $('.assembly-list-slider').slider('value', $('.assembly-list-slider').slider('value') - 1);
        }
        e.preventDefault();
    });
    // Navigate to the next sequence
    $('.nav-next-item').on('click', function(e){
        // Check if selected sequence counter value is less than total number of dropped assemblies
        if ($('.assembly-list-slider').slider('value') < parseInt($('.total-number-of-dropped-assemblies').text(), 10)) {
            // Increment slider's value
            $('.assembly-list-slider').slider('value', $('.assembly-list-slider').slider('value') + 1);
        }
        e.preventDefault();
    });

    // Assembly metadata from

    // Show hint message when 'I am not sure' checkbox is checkec
    $('.assembly-metadata-list-container').on('click', '.not-sure-checkbox', function(){
        // Show 'I am not sure' message
        $(this).closest('label').find('.not-sure-hint').toggleClass('hide-this');
    });

    var updateMetadataProgressBar = function() {
        // Calculate total number of metadata form elements
        var totalNumberOfMetadataItems = 
            + $('.assembly-sample-datetime-input').length
            + $('.assembly-sample-location-input').length
            + $('.assembly-sample-source-input').length;

        // Calculate number of non empty metadata form elements
        var numberOfNonEmptyMetadataItems =
            // Filter out empty datetime inputs
            + $('.assembly-sample-datetime-input').filter(function(){
                return this.value.length !== 0;
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

    // Show next form block when user fills in an input
    // http://stackoverflow.com/a/6458946
    // Relevant issue: https://github.com/Eonasdan/bootstrap-datetimepicker/issues/83
    $('.assembly-metadata-list-container').on('change change.dp', '.assembly-sample-datetime-input', function(){
        // TODO: validate input value
        // Show next form block
        $(this).closest('.form-block').next('.form-block').fadeIn();
        // Scroll to the next form block
        //$(this).closest('.assembly-metadata').scrollTop($(this).closest('.assembly-metadata').height());
        //$(this).closest('.assembly-metadata').animate({scrollTop: $(this).closest('.assembly-metadata').height()}, 400);
        // Focus on the next input
        $(this).closest('.form-block').next('.form-block').find('.assembly-sample-location-input').focus();
        //$('.assembly-sample-location-input').focus();
    });
    // Increment metadata progress bar
    $('.assembly-metadata-list-container').on('change change.dp', '.assembly-sample-datetime-input', function(){
        // Increment progress bar
        updateMetadataProgressBar();
    });
    $('.assembly-metadata-list-container').one('hide.dp', '.assembly-sample-datetime-input', function(event){
        var that = $(this);
        setTimeout(function(){
            // Scroll to the next form block
            //$(this).closest('.assembly-metadata').scrollTop($(this).closest('.assembly-metadata').height());
            that.closest('.assembly-metadata').animate({scrollTop: that.closest('.assembly-metadata').height()}, 400);
        }, 500);
    });

    var handleMetadataInputChange = function(inputElement) {

        console.log(inputElement);

        // Show next form block if current input has some value
        if (inputElement.val().length > 0) {

            // TO DO: Validate input value

            // Show next metadata form block
            inputElement.closest('.form-block').next('.form-block').fadeIn();

            // Scroll to the next form block
            //$(this).closest('.assembly-metadata').scrollTop($(this).closest('.assembly-metadata').height());
            inputElement.closest('.assembly-metadata').animate({scrollTop: inputElement.closest('.assembly-metadata').height()}, 400);
        } // if

        // Increment metadata progress bar
        updateMetadataProgressBar();
        // Hide progress hint
        $('.adding-metadata-progress-container .progress-hint').fadeOut();
    };

    // DEPRECATED
    // Show next form block when user fills in an input
    // $('.assembly-metadata-list-container').on('input_content_change', '.assembly-sample-location-input', function(){
    // } 
    // function(){

    //     // Show next form block if current input has some value
    //     if ($(this).val().length > 0) {

    //         // TO DO: Validate input value

    //         // Show next metadata form block
    //         $(this).closest('.form-block').next('.form-block').fadeIn();

    //         // Scroll to the next form block
    //         //$(this).closest('.assembly-metadata').scrollTop($(this).closest('.assembly-metadata').height());
    //         $(this).closest('.assembly-metadata').animate({scrollTop: $(this).closest('.assembly-metadata').height()}, 400);
    //     } // if

    //     // Increment metadata progress bar
    //     updateMetadataProgressBar();
    //     // Hide progress hint
    //     $('.adding-metadata-progress-container .progress-hint').fadeOut();
    // }
    // );

    // Show next form block when user fills in an input
    $('.assembly-metadata-list-container').on('change', '.assembly-sample-source-input', function(){

        // Show next form block if user selected non default option
        if ($(this).val() !== 0) {
            // Show next metadata form block
            $(this).closest('.form-block').next('.form-block').fadeIn();
            // Scroll to the next form block
            $(this).closest('.assembly-metadata').animate({scrollTop: $(this).closest('.assembly-metadata').height()}, 400);
        } // if

        // Increment metadata progress bar
        updateMetadataProgressBar();
        // Hide progress hint
        $('.adding-metadata-progress-container .progress-hint').fadeOut();
    });



    // TO DO: Refactor
    // When 'Next empty assembly' button is pressed
    $('.assembly-metadata-list-container').on('click', '.assembly-metadata button.next-assembly-button', function(event){
        // Show assembly with empty metadata input field

        // Trigger to show next assembly
        $('.nav-next-item').trigger('click');

        //$('#assembly-item-' + (+currentAssemblyIdCounter + 1)).find('input:first').focus();

        // Focus on the next empty input field
        //$(this).closest('.assembly-metadata-list-container').find('.assembly-metadata-item input:text[value=""]').focus();
        //console.log($(this).closest('.assembly-metadata-list-container').find('.assembly-metadata-item input:text[value=""]'));

        var currentAssemblyIdCounter = $(this).closest('.assembly-item').attr('id').replace('assembly-metadata-item-', '');

        $(this).closest('.assembly-metadata-list-container').find('.assembly-metadata-block input:text[value=""]').focus();

        event.preventDefault();
    });

    // var REMOVE_updateAssemblyUploadProgressBar = function(collectionId) {
    //     // Get total number of assemblies to upload
    //     var totalNumberOfAssemblies = Object.keys(fastaFilesAndMetadata).length;
    //     // Calculate number of uploaded assemblies
    //     var numberOfUploadedAssemblies = 0;
    //     for (var fastaFileAndMetadata in fastaFilesAndMetadata) {
    //         if (fastaFilesAndMetadata.hasOwnProperty(fastaFileAndMetadata)) {
    //             if (fastaFilesAndMetadata[fastaFileAndMetadata].uploaded) {
    //                 numberOfUploadedAssemblies = numberOfUploadedAssemblies + 1;
    //             }
    //         }
    //     }

    //     // If all assemblies have been uploaded then end progress bar
    //     if (numberOfUploadedAssemblies === totalNumberOfAssemblies) {
    //         endAssemblyUploadProgressBar(collectionId);
    //     } else {
    //         // Calculate new progress bar percentage value
    //         var newProgressBarPercentageValue = Math.floor(numberOfUploadedAssemblies * 100 / totalNumberOfAssemblies);

    //         // Update bar's width
    //         $('.uploading-assembly-progress-container .progress-bar').width(newProgressBarPercentageValue + '%');
    //         // Update aria-valuenow attribute
    //         $('.uploading-assembly-progress-container .progress-bar').attr('aria-valuenow', newProgressBarPercentageValue);
    //         // Update percentage value
    //         $('.uploading-assembly-progress-container .progress-percentage').text(newProgressBarPercentageValue + '%');
    //     }
    // };

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

    var updateAssemblyUploadProgress = function(collectionId, userAssemblyId, assemblyId, result) {};

    var updateCollectionUploadProgress = function(collectionId, userAssemblyId, assemblyId, result) {
        // ------------------------------------------
        // Create assembly row HTML
        // ------------------------------------------
        var assemblyRow = $('.assembly-list-upload-progress tr[data-assembly-id="' + userAssemblyId + '"] '),
            assemblyRowProgressBar = assemblyRow.find('.progress-bar'),
            statusCompleteHtml = '<span class="glyphicon glyphicon-ok"></span>';

        if (result === WGST.assembly.analysis.UPLOAD_OK) {
            assemblyRow.find('.assembly-upload-uploaded').html(statusCompleteHtml);
        } else if (result === WGST.assembly.analysis.MLST_RESULT) {
            assemblyRow.find('.assembly-upload-result-mlst').html(statusCompleteHtml);
        } else if (result === WGST.assembly.analysis.PAARSNP_RESULT) {
            assemblyRow.find('.assembly-upload-result-paarsnp').html(statusCompleteHtml);
        } else if (result === WGST.assembly.analysis.FP_COMP) {
            assemblyRow.find('.assembly-upload-result-fp-comp').html(statusCompleteHtml);
        }

        // ------------------------------------------
        // Update assembly progress
        // ------------------------------------------
        if (result !== WGST.collection.analysis.COLLECTION_TREE) {
            var numberOfResultsPerAssembly = Object.keys(WGST.assembly.analysis).length,
                progressStepSize = 100 / numberOfResultsPerAssembly,
                ariaValueNowAttr = parseInt(assemblyRow.find('.progress-bar').attr('aria-valuenow'), 10);

            // Update assembly upload progress bar value
            assemblyRowProgressBar
                            .css('width', (ariaValueNowAttr + progressStepSize) + '%')
                            .attr('aria-valuenow', (ariaValueNowAttr + progressStepSize));

            // If assembly processing has started then show percentage value
            if (assemblyRowProgressBar.attr('aria-valuenow') > 0) {
                assemblyRowProgressBar.text(assemblyRowProgressBar.attr('aria-valuenow') + '%');
            }

            // When progress bar reached 100%...
            if (assemblyRowProgressBar.attr('aria-valuenow') === '100') {
                // Update number of processing assemblies
                numberOfFilesProcessing = numberOfFilesProcessing - 1;

                // Remove stripes from progress bar
                assemblyRow.find('.progress').removeClass('active').removeClass('progress-striped');

                // Change progress bar color to green
                assemblyRowProgressBar.removeClass('progress-bar-info');
                assemblyRowProgressBar.addClass('progress-bar-success');

                var assemblyName = assemblyRow.find('.assembly-upload-name').text();
                assemblyRow.find('.assembly-upload-name').html('<a href="#" class="open-assembly-button" data-assembly-id="' + assemblyId + '">' + assemblyName + '</a>');            

                // Update total number of processed assemblies
                $('.assemblies-upload-processed').text(parseInt($('.assemblies-upload-processed').text(), 10) + 1);
            } // if
        } // if

        // ------------------------------------------
        // Update collection progress
        // ------------------------------------------
        var currentProgressValue = parseFloat($('.assemblies-upload-progress').find('.progress-bar').attr('aria-valuenow')),
            totalNumberOfAssemblies = parseInt($('.assemblies-upload-total').text(), 10),
            numberOfResultsPerAssembly = Object.keys(WGST.assembly.analysis).length,
            progressStepSize = 0;

        // COLLECTION_TREE will take 10% of overall progress
        if (result === WGST.collection.analysis.COLLECTION_TREE) {
            if (! WGST.upload.collection[collectionId].notifications.tree) {
                progressStepSize = 10;
                WGST.upload.collection[collectionId].notifications.tree = true;
            } else {
                progressStepSize = 0;
            }
        // All other results
        } else {
            progressStepSize = 90 / (totalNumberOfAssemblies * numberOfResultsPerAssembly);
        }

        // Calculate updated progress value
        var updatedProgressValue = (currentProgressValue + progressStepSize).toFixed(2);

        $('.assemblies-upload-progress').find('.progress-bar').css('width', updatedProgressValue + '%');
        $('.assemblies-upload-progress').find('.progress-bar').attr('aria-valuenow', updatedProgressValue);

        // Show percentage number on progress bar once you are above 0%
        if (updatedProgressValue > 0) {
            $('.assemblies-upload-progress').find('.progress-bar').text(updatedProgressValue + '%');            
        }
    };

    WGST.socket.connection.on('collectionTreeMergeNotification', function(mergedCollectionTreeData) {
        console.dir(mergedCollectionTreeData);

        // ------------------------------------------
        // Get assemblies
        // ------------------------------------------

        var assemblyIds = [],
            assemblyIdCounter = mergedCollectionTreeData.assemblies.length,
            assemblies;

        for (; assemblyIdCounter !== 0;) {
            assemblyIdCounter = assemblyIdCounter - 1;

            assemblyIds.push(mergedCollectionTreeData.assemblies[assemblyIdCounter].assemblyId);
        }

        console.log('Assembly ids to request:');
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
            console.log('Assemblies:');
            console.dir(assemblies);

            // ------------------------------------------
            // Render tree
            // ------------------------------------------

            var mergedCollectionTreeId = mergedCollectionTreeData.mergedCollectionTreeId,
                panelName = 'mergedCollectionTree';

            console.log('[WGST] Rendering merged collection tree ' + mergedCollectionTreeId);

            $('.wgst-panel__merged-collection-tree').attr('data-collection-id', mergedCollectionTreeId);
            $('.wgst-panel__merged-collection-tree .wgst-tree-content').attr('id', 'phylocanvas_' + mergedCollectionTreeId);

            activatePanel(panelName);

            console.log('mergedCollectionTreeId:');
            console.log(mergedCollectionTreeId);

            WGST.mergedCollectionTree = WGST.mergedCollectionTree || {};
            WGST.mergedCollectionTree[mergedCollectionTreeId] = {
                tree: {
                    canvas: {},
                    data: mergedCollectionTreeData.tree
                }
            };

            // Init collection tree
            WGST.mergedCollectionTree[mergedCollectionTreeId].tree.canvas = new PhyloCanvas.Tree(document.getElementById('phylocanvas_' + mergedCollectionTreeId));
            WGST.mergedCollectionTree[mergedCollectionTreeId].tree.canvas.parseNwk(WGST.mergedCollectionTree[mergedCollectionTreeId].tree.data);
            WGST.mergedCollectionTree[mergedCollectionTreeId].tree.canvas.treeType = 'rectangular';
            // WGST.mergedCollectionTree[mergedCollectionTreeId].tree.canvas.onselected = function(selectedNodeIds) {
            //     selectTreeNodes(collectionId, selectedNodeIds);
            // };

            // Get assemblies from merged collection

            var tree = WGST.mergedCollectionTree[mergedCollectionTreeId].tree.canvas,
                assemblyId;

            // Set user assembly id as node label
            for (assemblyId in assemblies) {
                if (assemblies.hasOwnProperty(assemblyId)) {
                    // Set label only to leaf nodes, filtering out the root node
                    if (tree.branches[assemblyId].leaf) {
                        tree.branches[assemblyId].label = assemblies[assemblyId].ASSEMBLY_METADATA.userAssemblyId;                 
                    }

                    // Create marker for each assembly

                }
            }

            WGST.mergedCollectionTree[mergedCollectionTreeId].tree.canvas.draw();

            //WGST.mergedCollectionTree[mergedCollectionTreeId].tree.canvas.draw();

            endPanelLoadingIndicator(panelName);
            showPanelBodyContent(panelName);
            showPanel(panelName);
            bringPanelToTop(panelName);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('[WGST][Error] Failed to get assemblies');
            console.error(textStatus);
            console.error(errorThrown);
            console.error(jqXHR);

        });
    });

    // Listen to notifications
    WGST.socket.connection.on('assemblyUploadNotification', function(data) {

        var collectionId = data.collectionId,
            assemblyId = data.assemblyId,
            userAssemblyId = data.userAssemblyId,
            result = data.result,
            assemblies = Object.keys(fastaFilesAndMetadata),
            totalNumberOfCollectionAnalysisResults = assemblies.length * Object.keys(WGST.assembly.analysis).length + assemblies.length;//Object.keys(WGST.collection.analysis).length);

        console.log('[WGST][Socket.io] Received ' + assemblyId + ' assembly upload notification: ' + result);

        if (result === WGST.assembly.analysis.UPLOAD_OK) {
            console.log('[WGST] Successfully uploaded ' + assemblyId + ' assembly');

            // Mark assembly as uploaded
            fastaFilesAndMetadata[assemblyId].uploaded = true;
        } // if

        // Keep track of all received notifications
        WGST.upload.collection[collectionId].notifications.all.push(collectionId + '__' + assemblyId + '__' + result);

        // Update view
        updateCollectionUploadProgress(collectionId, userAssemblyId, assemblyId, result);

        console.debug('» Received ' + WGST.upload.collection[collectionId].notifications.all.length + ' out of ' + totalNumberOfCollectionAnalysisResults + ' assembly results' );

        //console.debug('totalNumberOfCollectionAnalysisResults: ' + totalNumberOfCollectionAnalysisResults);
        //console.debug('WGST.upload.collection[collectionId].notifications.all.length: ' + WGST.upload.collection[collectionId].notifications.all.length);

        // When all results were processed - get collection
        if (totalNumberOfCollectionAnalysisResults === WGST.upload.collection[collectionId].notifications.all.length) {

            //$('.assemblies-upload-progress').find('.progress').removeClass('active');
            //$('.assemblies-upload-progress').find('.progress').removeClass('progress-striped');
            $('.assemblies-upload-progress').find('.progress-bar').addClass('progress-bar-success');

            setTimeout(function(){
                deactivatePanel('assemblyUploadProgress', function(){
                    resetAssemlyUpload();
                    // Update address bar
                    window.history.replaceState('Object', 'WGST Collection', '/collection/' + collectionId);
                    getCollection(collectionId);         
                });
            }, 1000);
        } // if
    });

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

    /*
    $('.wgst-panel__collection-panel .assemblies-summary-table').on('click', 'tr', function(event) {
        if (event.target.type !== 'radio' && event.target.type !== 'checkbox') {
            $(':checkbox', this).trigger('click');
        }
    });
    */

    var isFullscreenActive = function(fullscreenName) {
        var fullscreenElement = $('[data-fullscreen-name="' + fullscreenName + '"]');

        if (fullscreenElement.hasClass('wgst-fullscreen--active')) {
            return true;
        } else {
            return false;
        }
    };

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
            collectionId = $(this).closest('.wgst-collection').attr('data-collection-id');//,
            //assemblyIdMarker;//,
            //assemblyMarkerBounds = new google.maps.LatLngBounds();

        var allCheckedCheckboxes = $(this).closest('.collection-assembly-list').find('.show-on-map-checkbox [type="checkbox"]:checked'),
            selectedAssemblyIds = [],
            selectedAssemblyId;

        allCheckedCheckboxes.each(function(index, element){
            selectedAssemblyId = $(this).attr('data-assembly-id');
            selectedAssemblyIds.push(selectedAssemblyId);
        });

        triggerMapMarkers(collectionId, selectedAssemblyIds);

        // ZZZ

        openPanel('map');

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
        //     //         map: window.WGST.geo.map.canvas,
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
    //$('.wgst-panel__collection .collection-assembly-list').on('change', 'input[type="radio"]', function(e) {
    $('.collection-assembly-list').on('change', 'input[type="radio"]', function(e) {

        var selectedAssemblyId = $(this).attr('data-assembly-id'),
            collectionId = $(this).closest('.wgst-collection-info').attr('data-collection-id');

        $('.collection-assembly-list .assembly-list-item.row-selected').removeClass('row-selected');
        $('.collection-assembly-list .assembly-list-item[data-assembly-id="' + selectedAssemblyId + '"]').addClass('row-selected');

        window.WGST.collection[collectionId].tree.canvas.selectNodes(selectedAssemblyId);

        // var leaves = window.WGST.collection[collectionId].tree.canvas.leaves;
        // console.dir(window.WGST.collection[collectionId].tree.canvas.leaves);
        // var selectedLeaf = $.grep(leaves, function(leaf){ return leaf.id === selectedAssemblyId; });
        // selectedLeaf[0].nodeShape = 'square';
        //window.WGST.collection[collectionId].tree.canvas.leaves[selectedAssemblyId].nodeShape = 'rectangular';

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
        // //console.dir(window.WGST.collection[collectionId].tree.canvas);

        // // Highlight assembly with the highest score on the representative tree

        // window.WGST.collection[collectionId].tree.canvas.selectNodes(checkedAssemblyNodesString);
        // //window.WGST.representativeTree.tree.selectNodes(checkedAssemblyNodesString);
    });

    $('.assemblies-upload-cancel-button').on('click', function() {
        // Close FASTA files upload panel
        $('.assembly-upload-panel').hide();
        // Remove stored dropped FASTA files
        fastaFilesAndMetadata = {};
        // Remove stored selected FASTA file
        selectedFastaFileName = '';
        // Remove analytics HTML element
        $('.assembly-list-container ul').html('');
        // Remove metadata HTML element
        $('.assembly-metadata-list-container ul').html('');
        // Reset progress bar
        // Update bar's width
        $('.adding-metadata-progress-container .progress-bar').width('0%');
        // Update aria-valuenow attribute
        $('.adding-metadata-progress-container .progress-bar').attr('aria-valuenow', 0);
        // Update percentage value
        $('.adding-metadata-progress-container .progress-percentage').text('0%');
        // Remove metadata marker
        window.WGST.geo.map.markers.metadata.setMap(null);
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

    var uploadAssembly = function(collectionId, assemblyId) {
        // Upload assembly only if you are within parallel assembly upload limit
        if (numberOfFilesProcessing < PARALLEL_UPLOAD_ASSEMBLY_LIMIT) {
            console.log('[WGST] Uploading ' + assemblyId + ' assembly');

            // Increment number of assembly upload counter
            numberOfFilesProcessing = numberOfFilesProcessing + 1;
            // Set socket room id
            fastaFilesAndMetadata[assemblyId].socketRoomId = window.WGST.socket.roomId;
            // Set assembly id
            fastaFilesAndMetadata[assemblyId].assemblyId = assemblyId;
            // Post assembly
            $.ajax({
                type: 'POST',
                url: '/assembly/add/',
                datatype: 'json', // http://stackoverflow.com/a/9155217
                data: fastaFilesAndMetadata[assemblyId]
            })
            //.done(assemblyUploadDoneHandler(collectionId, assemblyId))
            .done(function(data, textStatus, jqXHR) {
                // Do nothing
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log('[WGST][ERROR] Failed to send FASTA file object to server or received error message');
                console.error(textStatus);
                console.error(errorThrown);
                console.error(jqXHR);

                showNotification(textStatus);
                //updateAssemblyUploadProgressBar();
            });
        } else {
            setTimeout(uploadAssembly, ASSEMBLY_UPLOAD_TIMER, collectionId, assemblyId);
        }
    };

    var GET_COLLECTION_ID_TIMER = 2000;

    $('.assemblies-upload-ready-button').on('click', function() {
        console.log('[WGST] Getting ready to upload assemblies and metadata');

        // Reset panels
        resetPanelAssemblyUploadMetadata();
        resetPanelAssemblyUploadProgress();

        // Disable upload button
        //$(this).attr('disabled','disabled');

        // Remove metadata marker
        window.WGST.geo.map.markers.metadata.setMap(null);

        // Close panels
        deactivatePanel(['assemblyUploadNavigator', 'assemblyUploadAnalytics', 'assemblyUploadMetadata']);

        window.WGST.dragAndDrop.files = [];

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
                        WGST.upload.collection[collectionId].notifications = {};
                        WGST.upload.collection[collectionId].notifications.all = [];
                        WGST.upload.collection[collectionId].notifications.tree = false; // Have you received at least 1 COLLECTION_TREE notification

                        // Replace user assembly id (fasta file name) with assembly id generated on server side
                        var fastaFilesAndMetadataWithUpdatedIds = {};
                        $.each(userAssemblyIdToAssemblyIdMap, function(assemblyId){
                            console.log('==============================================');
                            console.dir(userAssemblyIdToAssemblyIdMap);
                            console.log(assemblyId);

                            var userAssemblyId = userAssemblyIdToAssemblyIdMap[assemblyId];

                            if (typeof fastaFilesAndMetadata[userAssemblyId] !== 'undefined') {
                                fastaFilesAndMetadataWithUpdatedIds[assemblyId] = fastaFilesAndMetadata[userAssemblyId];
                            }
                        });
                        // $.each(fastaFilesAndMetadata, function(userAssemblyId){
                        //     var assemblyId = userAssemblyIdToAssemblyIdMap[userAssemblyId];
                        //     fastaFilesAndMetadataWithUpdatedIds[assemblyId] = fastaFilesAndMetadata[userAssemblyId];
                        // });

                        fastaFilesAndMetadata = fastaFilesAndMetadataWithUpdatedIds;

                        console.dir(fastaFilesAndMetadata);

                        // Post each FASTA file separately
                        for (assemblyId in fastaFilesAndMetadata) {
                            if (fastaFilesAndMetadata.hasOwnProperty(assemblyId)) {                                

                                //var savedCollectionId = collectionId,
                                var userAssemblyId = fastaFilesAndMetadata[assemblyId].name;

                                // Add collection id to each FASTA file object
                                //fastaFilesAndMetadata[assemblyId].collectionId = savedCollectionId;
                                fastaFilesAndMetadata[assemblyId].collectionId = collectionId;

                                // TO DO: Change 'data-name' to 'data-file-name'
                                var autocompleteInput = $('li[data-name="' + userAssemblyId + '"] .assembly-sample-location-input');

                                console.debug('userAssemblyId: ' + userAssemblyId);
                                console.dir(window.WGST.upload);

                                // Add metadata to each FASTA file object
                                fastaFilesAndMetadata[assemblyId].metadata = {
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

                                console.log('[WGST] Metadata for ' + assemblyId + ':');
                                console.debug(fastaFilesAndMetadata[assemblyId].metadata);

                                // Create closure to save collectionId and assemblyId
                                (function() {
                                    console.log('===================================================================');
                                    console.log('collectionId: ' + collectionId + ' assemblyId: ' + assemblyId);
                                    console.log('===================================================================');

                                    uploadAssembly(collectionId, assemblyId);
                                })();
                            } // if
                        } // for
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
    });

    $('.cancel-assembly-upload-button').on('click', function(){
        // Remove selected FASTA file

        // Remove HTML element
        $('.assembly-item[data-name="' + selectedFastaFileName + '"]').remove();
        // Delete data object
        delete fastaFilesAndMetadata[selectedFastaFileName];

        // Update assembly list slider
        $('.assembly-list-slider').slider("option", "max", Object.keys(fastaFilesAndMetadata).length);
        // Recalculate total number of selected files
        $('.total-number-of-dropped-assemblies').text(Object.keys(fastaFilesAndMetadata).length);

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
    $('.wgst-panel').on('mousedown', function(){

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

    $('.wgst-panel__assembly-upload-metadata').on('click', '.apply-to-all-assemblies-button', function(){

        // Copy the same metadata to all assemblies
        var sourceFileName = $(this).closest('.assembly-item').attr('data-name'),
            sourceMetadata = window.WGST.upload.assembly[sourceFileName].metadata;

        $.each(window.WGST.upload.assembly, function(destinationFileName, destinationMetadata){
            window.WGST.upload.assembly[destinationFileName].metadata = sourceMetadata;
        });

        // Get metadata from selected assembly
        var metadataElementTimestamp = $(this).closest('.assembly-metadata').find('.assembly-sample-datetime-input'),
            metadataElementLocation = $(this).closest('.assembly-metadata').find('.assembly-sample-location-input'),
            metadataElementSource = $(this).closest('.assembly-metadata').find('.assembly-sample-source-input');

        // Set value
        $('.assembly-metadata').find('.assembly-sample-datetime-input').val(metadataElementTimestamp.val());
        $('.assembly-metadata').find('.assembly-sample-location-input').val(metadataElementLocation.val());
        $('.assembly-metadata').find('.assembly-sample-source-input').val(metadataElementSource.val());

        // // Set data
        // $('.assembly-metadata').find('.assembly-sample-location-input').attr('data-latitude', metadataElementLocation.attr('data-latitude'));
        // $('.assembly-metadata').find('.assembly-sample-location-input').attr('data-longitude', metadataElementLocation.attr('data-longitude'));

        // Show metadata
        $('.assembly-metadata-block').show();

        updateMetadataProgressBar();

    });

    $('.wgst-panel__collection, .wgst-fullscreen__collection').on('click', '.show-on-representative-tree', function(event){

        openRepresentativeCollectionTree();

        // endPanelLoadingIndicator('representativeCollectionTree');
        // activatePanel('representativeCollectionTree');
        // showPanel('representativeCollectionTree');
        // showPanelBodyContent('representativeCollectionTree');
        // bringPanelToTop('representativeCollectionTree');

        var collectionId = $(this).closest('.wgst-collection-info').attr('data-collection-id'),
            //collectionId = $(this).closest('.wgst-panel__collection').attr('data-collection-id'),
            assemblyId = $(this).attr('data-assembly-id'),
            referenceId = window.WGST.collection[collectionId].assemblies[assemblyId].FP_COMP.topScore.referenceId;

        window.WGST.collection.representative.tree.canvas.selectNodes(referenceId);

        event.preventDefault();
    });

    // Open Assembly from Collection list
    $('.wgst-panel__collection, .wgst-panel__assembly-upload-progress, .wgst-fullscreen__collection').on('click', '.open-assembly-button', function(e){

        var assemblyId = $(this).attr('data-assembly-id');

        // ============================================================
        // Close any previously openned assembly panels
        // ============================================================

        if (isPanelActive('assembly')) {
            deactivatePanel('assembly', function(){
                // Remove content
                $('.wgst-panel__assembly .assembly-details .assembly-detail-content').html('');
                openAssemblyPanel(assemblyId);
            });
        } else {
            openAssemblyPanel(assemblyId);
        }

        e.preventDefault();
    });

    $('.wgst-panel__collection .collection-controls-show-tree').on('click', function(){
        activatePanel('collectionTree');
        showPanel('collectionTree');
        showPanelBodyContent('collectionTree');
        bringPanelToTop('collectionTree');
    });

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

    $('.wgst-tree-control__decrease-label-font-size').on('click', function(){
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            currentNodeTextSize,
            tree;

        if ($(this).closest('.wgst-panel').attr('data-panel-name') === 'mergedCollectionTree') {
            tree = WGST.mergedCollectionTree[collectionId].tree.canvas;
            currentNodeTextSize = tree.textSize;
        } else {
            tree = WGST.collection[collectionId].tree.canvas;
            currentNodeTextSize = tree.textSize;
        }
        
        tree.setTextSize(currentNodeTextSize - 3);
    });
    $('.wgst-tree-control__increase-label-font-size').on('click', function(){
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            currentNodeTextSize,
            tree;

        if ($(this).closest('.wgst-panel').attr('data-panel-name') === 'mergedCollectionTree') {
            tree = WGST.mergedCollectionTree[collectionId].tree.canvas;
            currentNodeTextSize = tree.textSize;
        } else {
            tree = WGST.collection[collectionId].tree.canvas;
            currentNodeTextSize = tree.textSize;
        }

        tree.setTextSize(currentNodeTextSize + 3);
    });

    $('.wgst-tree-control__decrease-node-size').on('click', function(){
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            tree,
            currentNodeSize;

        if ($(this).closest('.wgst-panel').attr('data-panel-name') === 'mergedCollectionTree') {
            tree = WGST.mergedCollectionTree[collectionId].tree.canvas;
            currentNodeSize = tree.baseNodeSize;
        } else {
            tree = WGST.collection[collectionId].tree.canvas;
            currentNodeSize = tree.baseNodeSize;
        }

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
    $('.wgst-tree-control__increase-node-size').on('click', function(){
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            tree,
            currentNodeSize;

        if ($(this).closest('.wgst-panel').attr('data-panel-name') === 'mergedCollectionTree') {
            tree = WGST.mergedCollectionTree[collectionId].tree.canvas;
            currentNodeSize = tree.baseNodeSize;
        } else {
            tree = WGST.collection[collectionId].tree.canvas;
            currentNodeSize = tree.baseNodeSize;
        }

        tree.setNodeSize(currentNodeSize + 3);

        if (tree.baseNodeSize > 3) {
            $(this).closest('.wgst-tree-control').find('.wgst-tree-control__decrease-node-size').attr('disabled', false);
        }
    });
    $('.wgst-tree-control__show-node-labels').on('change', function(){
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            tree;

        if ($(this).closest('.wgst-panel').attr('data-panel-name') === 'mergedCollectionTree') {
            tree = WGST.mergedCollectionTree[collectionId].tree.canvas;
        } else {
            tree = WGST.collection[collectionId].tree.canvas;
        }

        tree.toggleLabels();
    });
    $('.wgst-tree-control__merge-collection-trees').on('click', function(){
        var requestData = {
            collectionId: $(this).closest('.wgst-panel').attr('data-collection-id'),
            mergeWithCollectionId: '78cb7009-64ac-4f04-8428-d4089aae2a13',//'851054d9-86c2-452e-b9af-8cac1d8f0ef6',
            socketRoomId: WGST.socket.roomId
        };

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
    var renderRepresentativeCollectionTree = function() {
        console.log('[WGST] Rendering representative collection tree');

        var collectionId = 'representative';//WGST.settings.representativeCollectionId;

        // Remove previosly rendered collection tree
        $('.wgst-panel__representative-collection-tree .wgst-tree-content').html('');
        // Attach collection id
        $('.wgst-panel__representative-collection-tree .wgst-tree-content').attr('id', 'phylocanvas_' + collectionId);

        WGST.collection.representative.tree.canvas = new PhyloCanvas.Tree($('[data-panel-name="representativeCollectionTree"] .wgst-tree-content')[0]);
        WGST.collection.representative.tree.canvas.load('/data/reference_tree.nwk');
        WGST.collection.representative.tree.canvas.treeType = 'rectangular';
        // WGST.collection.representative.tree.canvas.showLabels = true;
        // WGST.collection.representative.tree.canvas.baseNodeSize = 2;
        // WGST.collection.representative.tree.canvas.setTextSize(21);
        // WGST.collection.representative.tree.canvas.selectedNodeSizeIncrease = 1;
        // WGST.collection.representative.tree.canvas.selectedColor = '#0059DE';
        // WGST.collection.representative.tree.canvas.rightClickZoom = false;
    };

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
        //     // window.WGST.collection.representative.tree.canvas = new PhyloCanvas.Tree($('[data-panel-name="representativeCollectionTree"] .phylocanvas')[0]);
        //     // // Render collection tree
        //     // //renderCollectionTree(collectionId);

        //     // window.WGST.collection.representative.tree.canvas.load('/data/reference_tree.nwk');
        //     // window.WGST.collection.representative.tree.canvas.treeType = 'rectangular';
        //     // //window.WGST.collection.representative.tree.showLabels = false;
        //     // window.WGST.collection.representative.tree.canvas.baseNodeSize = 0.5;
        //     // window.WGST.collection.representative.tree.canvas.setTextSize(24);
        //     // window.WGST.collection.representative.tree.canvas.selectedNodeSizeIncrease = 0.5;
        //     // window.WGST.collection.representative.tree.canvas.selectedColor = '#0059DE';
        //     // window.WGST.collection.representative.tree.canvas.rightClickZoom = true;
        //     // //window.WGST.collection.representative.tree.canvas.onselected = showRepresentativeTreeNodesOnMap;

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
        //     window.WGST.collection.representative.tree.canvas = new PhyloCanvas.Tree($('[data-panel-name="representativeCollectionTree"] .phylocanvas')[0]);
        //     // Render collection tree
        //     //renderCollectionTree(collectionId);

        //     window.WGST.collection.representative.tree.canvas.load('/data/reference_tree.nwk');
        //     window.WGST.collection.representative.tree.canvas.treeType = 'rectangular';
        //     //window.WGST.collection.representative.tree.showLabels = false;
        //     window.WGST.collection.representative.tree.canvas.baseNodeSize = 0.5;
        //     window.WGST.collection.representative.tree.canvas.setTextSize(24);
        //     window.WGST.collection.representative.tree.canvas.selectedNodeSizeIncrease = 0.5;
        //     window.WGST.collection.representative.tree.canvas.selectedColor = '#0059DE';
        //     window.WGST.collection.representative.tree.canvas.rightClickZoom = true;
        //     //window.WGST.collection.representative.tree.canvas.onselected = showRepresentativeTreeNodesOnMap;

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

            //window.WGST.collection.representative.tree.data = data.collection.tree;
            //window.WGST.collection[collectionId].assemblies = data.collection.assemblies;

            // // ----------------------------------------
            // // Render collection tree
            // // ----------------------------------------
            // // Remove previosly rendered collection tree
            // $('.wgst-panel__collection-tree .phylocanvas').html('');
            // // Attach collection id
            // $('.wgst-panel__collection-tree .phylocanvas').attr('id', 'phylocanvas_' + collectionId);
            // // Init collection tree
            // window.WGST.collection[collectionId].tree.canvas = new PhyloCanvas.Tree(document.getElementById('phylocanvas_' + collectionId));
            // // Render collection tree
            // renderCollectionTree(collectionId);

            // endPanelLoadingIndicator('collectionTree');
            // //showPanelBodyContent('collectionTree');

        // ----------------------------------------
        // Load representative collection tree
        // ----------------------------------------
        // AAA


        // window.WGST.representativeTree.tree.load('/data/reference_tree.nwk');
        // window.WGST.representativeTree.tree.treeType = 'rectangular';
        // //window.WGST.representativeTree.tree.showLabels = false;
        // window.WGST.representativeTree.tree.baseNodeSize = 0.5;
        // window.WGST.representativeTree.tree.setTextSize(24);
        // window.WGST.representativeTree.tree.selectedNodeSizeIncrease = 0.5;
        // window.WGST.representativeTree.tree.selectedColor = '#0059DE';
        // window.WGST.representativeTree.tree.rightClickZoom = true;
        // window.WGST.representativeTree.tree.onselected = showRepresentativeTreeNodesOnMap;

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
        //         window.WGST.representativeTree[accession] = metadata[metadataCounter];
        //     } // for
        // })
        // .fail(function(jqXHR, textStatus, errorThrown) {
        //     console.log('[WGST][ERROR] Failed to get representative tree metadata');
        //     console.error(textStatus);
        //     console.error(errorThrown);
        //     console.error(jqXHR);
        // });


    };

    // $('.show-representative-collection button').on('click', function(){
    //     openRepresentativeCollectionTree();
    // });


    $('.wgst-navigation-item').on('click', function(event){
        event.preventDefault();
    });

    $('.wgst-navigation-item__map').on('click', function(){
        var activeFullscreenElement = $('.wgst-fullscreen--active');

        if (activeFullscreenElement.attr('data-fullscreen-name') === 'map') {
            bringFullscreenToPanel(false); 
        }

        openPanel('map');

        google.maps.event.trigger(WGST.geo.map.canvas, 'resize');
    });

    $('.wgst-navigation-item__representative-tree').on('click', function(){
        openRepresentativeCollectionTree();
    });

    $('.wgst-navigation-item__collection').on('click', function(){
        if (isNavItemEnabled('collection')) {
            var activeFullscreenElement = $('.wgst-fullscreen--active');

            if (activeFullscreenElement.attr('data-fullscreen-name') === 'collection') {
                bringFullscreenToPanel(false); 
            }

            openPanel('collection');
        }
    });

google.maps.event.addDomListener(window, "resize", function() {
    var map = WGST.geo.map.canvas;
 var center = map.getCenter();
 google.maps.event.trigger(map, "resize");
 map.setCenter(center); 
});


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
            openPanel('map');
        });

        google.maps.event.trigger(WGST.geo.map.canvas, 'resize');

        // EEE

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

            deactivatePanel(panelName, function(){
                if (panelName === 'collection') {
                    var collectionId = panel.attr('data-collection-id');
                    closeCollection(collectionId);
                } else if (panelName === 'representativeCollectionTree') {
                    var collectionId = panel.attr('data-collection-id');
                    deselectAllTreeNodes(collectionId);
                }
            });
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

    var treeManipulationHandler = function(canvasElement) {

        var canvas = $(canvasElement),
            canvasOffset = canvas.offset(),
            collectionId = canvas.closest('.wgst-panel').attr('data-collection-id'),
            tree = window.WGST.collection[collectionId].tree.canvas,
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

    $('.collection-assembly-list-view-all-assemblies').on('click', function(e){
        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
            collectionAssemblyList = $('.collection-assembly-list');

        // Redraw original tree and set original zoom
        window.WGST.collection[collectionId].tree.canvas.redrawOriginalTree();
        window.WGST.collection[collectionId].tree.canvas.setZoom(-0.05);

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

    $('.tree-controls-match-assembly-list').on('click', function(){
        var canvas = $(this).closest('.wgst-panel-body-content').find('canvas.phylocanvas');
        treeManipulationHandler(canvas);
    });

});

// TO DO:
// + Sort assemblies selected to upload alphabetically.