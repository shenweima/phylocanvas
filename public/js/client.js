//
// App version
//
window.WGST.version = '0.1.4';

//
// Setup socket
//
window.WGST.socket = {
    //connection: io.connect(WGST.config.socketAddress, {secure: true}),
    connection: io.connect(window.WGST.config.socketAddress),
    roomId: ''
};

//
// WGSA now can speak!
//
window.WGST.speak = false;

//
// Store panels position
//
window.WGST.panels = {
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

//
// Store assembly
//
window.WGST.assembly = {
    analysis: {
        UPLOAD_OK: 'UPLOAD_OK',
        METADATA_OK: 'METADATA_OK',
        MLST_RESULT: 'MLST_RESULT',
        PAARSNP_RESULT: 'PAARSNP_RESULT',
        FP_COMP: 'FP_COMP',
        CORE: 'CORE'
    }
};

//
// Store collection
//
window.WGST.collection = {
    analysis: {
        //COLLECTION_TREE: 'COLLECTION_TREE',
        CORE_MUTANT_TREE: 'CORE_MUTANT_TREE'
    },
    representative: {
        tree: {},
        metadata: {}
    }
};

//
// Settings
//
window.WGST.settings = window.WGST.settings || {};
window.WGST.settings.referenceCollectionId = window.WGST.config.referenceCollectionId; //'1fab53b0-e7fe-4660-b34e-21d501017397';//'59b792aa-b892-4106-b1dd-2e9e78abefc4';

//
// Regexes
//
window.WGST.antibioticNameRegex = /[\W]+/g;













$(function(){

    'use strict'; // Available in ECMAScript 5 and ignored in older versions. Future ECMAScript versions will enforce it by default.

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
        $('.wgst-page__app').removeClass('wgst--hide-this');
    } else {

        //
        // Show default page
        //
        $('.wgst-page__landing').removeClass('wgst--hide-this');

        return;
    }

    if (window.WGST.speak) {
        var message = new SpeechSynthesisUtterance('Welcome to WGSA');
        window.speechSynthesis.speak(message);
    }

    //
    // Init Bootstrap Tooltip
    //
    $('body').tooltip({
        selector: '[data-toggle="tooltip"]'
    });

    // //
    // // Create fullscreen
    // //
    // var fullscreenType = 'collection-map';
    // var fullscreenId = fullscreenType + '__' + 'NEW';

    // if (window.WGST.requestedCollectionId !== 'undefined') {
    //     var fullscreenId = fullscreenType + '__' + window.WGST.requestedCollectionId;
    // }

    // window.WGST.exports.createFullscreen(fullscreenId, {
    //     fullscreenType: fullscreenType,
    //     fullscreenId: fullscreenId
    // });

    // if (typeof window.WGST.requestedCollectionId !== 'undefined') {

    //     //
    //     // Create map fullscreen
    //     //
    //     var fullscreenType = 'collection-map',
    //         fullscreenId = 'collection-map'; //fullscreenType + '__' + window.WGST.requestedCollectionId;

    //     window.WGST.exports.createFullscreen(fullscreenId, {
    //         fullscreenType: fullscreenType,
    //         fullscreenId: fullscreenId
    //     });

    //     //
    //     // Show fullscreen
    //     //
    //     window.WGST.exports.showFullscreen(fullscreenId);
    // }












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

    //var socketAddress = '//' + window.WGST.config.socketAddress;



    window.WGST.geo = {
        map: {
            initialised: false,
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
            init: function() {

                console.debug('*** 1 No no no ****');

                //
                // Do nothing if map was already initialised
                //
                if (this.initialised === true) {
                    return;
                }

                console.debug('*** 2 No no no ****');

                //
                // Create map
                //
                window.WGST.geo.map.canvas = new google.maps.Map($('.wgst-map')[0], window.WGST.geo.map.options);

                //
                // Set map as initialised
                //
                window.WGST.geo.map.initialised = true;

                //
                // Create metadata marker
                //
                window.WGST.geo.map.markers.metadata = new google.maps.Marker({
                    position: new google.maps.LatLng(51.511214, -0.119824),
                    map: window.WGST.geo.map.canvas,
                    visible: false
                });

                //
                // Bias the SearchBox results towards places that are within the bounds of the current map's viewport.
                //
                google.maps.event.addListener(window.WGST.geo.map.canvas, 'bounds_changed', function() {
                    window.WGST.geo.map.searchBoxBounds = window.WGST.geo.map.canvas.getBounds();
                });
            },
            remove: function() {

                //
                //
                //
                // Known memory leak issue: https://code.google.com/p/gmaps-api-issues/issues/detail?id=3803
                //
                //
                //

                //
                // Set map as initialised
                //
                window.WGST.geo.map.initialised = false;
            }
        },
        placeSearchBox: {} // Store Google SearchBox object for each dropped file
    };

    window.WGST.alert = {
        status: {
            SUCCESS: 'success',
            FAILURE: 'failure'
        }
    };

    window.WGST.init = {
        all: {
            SOCKET_CONNECT: 'Socket connected',
            SOCKET_ROOM_ID: 'Received socket room id',
            REPRESENTATIVE_COLLECTION_TREE_METADATA: 'Loaded representative collectiontree metadata'
        },
        loaded: []
    };
    
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

            delete window.WGST.init;
        } // if
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
            start: function() {
                ringDragging = true;
            },
            stop: function(event, ui) {
                ringDragging = false;
                // Store current panel position
                var panelName = ui.helper.attr('data-panel-name');
                WGST.panels[panelName].top = ui.position.top;
                WGST.panels[panelName].left = ui.position.left;
            }
        });

        // Init jQuery UI slider widget
        // $('.assembly-list-slider').slider({
        //     range: "max",
        //     min: 0,
        //     max: 10,
        //     value: 0,
        //     animate: 'fast',
        //     slide: function(event, ui) {
        //         //$('.selected-assembly-counter').text(ui.value);
        //     }
        // });

        // Popover
        // $('.add-data button').popover({
        //     html: true,
        //     placement: 'bottom',
        //     title: 'Add your data',
        //     content: '<div class="upload-data"><span>You can drag and drop your CSV files anywhere on the map.</span><input type="file" id="exampleInputFile"></div>'
        // });

        // Toggle timeline
        // $('.timeline-toggle-button').on('click', function(){
        //     if ($(this).hasClass('active')) {
        //         $('#timeline').hide();
        //     } else {
        //         $('#timeline').css('bottom', '0');
        //         $('#timeline').show();
        //     }
        // });

        // Toggle graph
        // $('.graph-toggle-button').on('click', function(){
        //     if ($(this).hasClass('active')) {
        //         $('.tree-panel').hide();
        //     } else {
        //         $('.tree-panel').show();
        //     }
        // });

        // Toggle all panels
        // $('.all-panels-toggle-button').on('click', function(){
        //     if ($(this).hasClass('active')) {
        //         $('.wgst-panel--active').hide();
        //     } else {
        //         $('.wgst-panel--active').show();
        //     }
        // });

        // Show graph
        //$('.graph-toggle-button').trigger('click');
        
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





    // var removeCollectionTreePanel = function(collectionId, collectionTreeType) {
    //     var collectionTreePanelId = 'collectionTree' + '__' + collectionId + '__' + collectionTreeType,
    //         $collectionTreePanel = $('.wgst-panel[data-panel-name="' + collectionTreePanelId + '"]');

    //     $collectionTreePanel.remove();
    // };

    // var removeCollectionTreePanels = function(collectionId) {
    //     var collectionTrees = WGST.collection[collectionId].tree;

    //     $.each(collectionTrees, function(collectionTreeType, collectionTreeData) {
    //         // Render collection tree button
    //         removeCollectionTreePanel(collectionId, collectionTreeType);
    //     });
    // };









    // If user provided collection id in url then load requested collection
    if (typeof WGST.requestedCollectionId !== 'undefined') {
        //
        // Get existing collection
        //
        window.WGST.exports.getCollection(WGST.requestedCollectionId);
    } else {
        //
        // Suggest to create new collection
        //
        window.WGST.exports.showBackground('drag-and-drop');
        //$('.wgst-header-collection-name').text('New');
        //$('.wgst-drag-and-drop').removeClass('wgst--hide-this');
    }




    // $('.collection-assembly-list').on('scroll', function(){
    //     console.log('Scrolling...');

    //     var collectionId = $(this).attr('data-collection-id');

    //     WGST.collection[collectionId].displayedAssemblies = [];
    // });









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

    // $('.tree-controls-select-none').on('click', function() {

    //     var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id');
    //         //tree = WGST.collection[collectionId].tree.canvas;

    //     deselectAllTreeNodes(collectionId);

    //     // This is a workaround
    //     // TO DO: Refactor using official API
    //     //tree.selectNodes('');

    //     //showRepresentativeTreeNodesOnMap('');
    // });

    // $('.tree-controls-select-all').on('click', function() {

    //     var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
    //         tree = WGST.collection[collectionId].tree['CORE_TREE_RESULT'].canvas;
        
    //     //console.debug(WGST.collection[collectionId]);
    //     //console.debug(tree);

    //     // Get all assembly ids in this tree

    //     var leaves = tree.leaves,
    //         leafCounter = leaves.length,
    //         assemblyIds = [],
    //         assemblyId;

    //     // Concatenate all assembly ids into one string
    //     for (; leafCounter !== 0;) {
    //         leafCounter = leafCounter - 1;

    //         assemblyId = leaves[leafCounter].id;
    //         assemblyIds.push(assemblyId);

    //         // if (assemblyIds.length > 0) {
    //         //     assemblyIds = assemblyIds + ',' + leaves[leafCounter].id;
    //         // } else {
    //         //     assemblyIds = leaves[leafCounter].id;
    //         // }
    //     }

    //     // This is a workaround
    //     // TO DO: Refactor using official API
    //     tree.root.setSelected(true, true);
    //     tree.draw();

    //     //showRepresentativeTreeNodesOnMap(nodeIds);

    //     showCollectionMetadataOnMap(collectionId, assemblyIds);
    // });

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

    // // --------------------------------------------------------------------------------------
    // // WGSA Ring
    // // To do: add WGSA namespace
    // // To do: rename WGST to WGSA
    // // --------------------------------------------------------------------------------------
    // var ringTimeout,
    //     // Are you dragging it?
    //     ringDragging = false,
    //     // Have you clicked on it?
    //     ringFixed = false;

    // (function(){

    //     // Init jQuery UI draggable interaction
    //     $('[data-wgst-js="ring"]').draggable({
    //         //handle: '.wgst-ring',
    //         appendTo: 'body',
    //         scroll: false,
    //         containment: "window"
    //     });

    //     $('.wgst-ring-content').on('mouseover', function(){
    //         if (ringDragging === false) {
    //             ringTimeout = setTimeout(function(){
    //                 if (typeof ringTimeout !== 'undefined' && ringDragging === false) {
    //                     ringTimeout = undefined;
    //                     $('.wgst-panel--visible').fadeOut();
    //                 }
    //             }, 300);
    //         }
    //     });
    //     $('.wgst-ring-content').on('mouseout', function(){
    //         if (ringDragging === false && ringFixed === false) {
    //             ringTimeout = undefined;
    //             $('.wgst-panel--visible').fadeIn();
    //         }
    //     });
    //     $('[data-wgst-js="ring"]').on('mousedown', function(){
    //         console.log('mouse down');
    //         ringTimeout = undefined;
    //         ringDragging = true;
    //         if (ringFixed === false) {
    //             $('.wgst-ring-content').css('background-color', '#999');                
    //         }
    //     });
    //     $('[data-wgst-js="ring"]').on('mouseup', function(){
    //         console.log('mouse up');
    //         ringTimeout = undefined;
    //         ringDragging = false;
    //         if (ringFixed === false) {
    //             $('.wgst-ring-content').css('background-color', '');                
    //         }
    //     });
    //     $('.wgst-ring-content').on('click', function(){
    //         console.log('ring click');
    //         if (ringFixed === false) {
    //             ringFixed = true;
    //             $(this).addClass('wgst-ring-fixed');
    //             $('.wgst-panel--visible').fadeOut();
    //         } else {
    //             ringFixed = false;
    //             $(this).removeClass('wgst-ring-fixed');
    //         }
    //     });
    //     $('.wgst-ring-content').on('mousedown', function(event){
    //         console.log('mouse down');
    //         event.stopPropagation();
    //     });        
    // }());


















        // Array of objects that store content of FASTA file and user-provided metadata
    var fastaFilesAndMetadata = {},
        // Stores file name of displayed FASTA file
        selectedFastaFileName = '',
        // Element on which user can drag and drop files
        
        // Store individual assembly objects used for displaying data
        assemblies = [],
        // DNA sequence regex
        dnaSequenceRegex = /^[CTAGNUX]+$/i,
        // Count total number of contigs in all selected assemblies
        totalContigsSum = 0,
        totalNumberOfContigsDropped = 0;










    // var handleFastaDrop = function(file) {};

    // var handleCsvDrop = function(file) {};

    // var openAssemblyUploadPanels = function() {
    //     if (! isPanelActive('assemblyUploadNavigator')) {
    //         activatePanel('assemblyUploadNavigator');
    //         showPanel('assemblyUploadNavigator');
    //     }

    //     if (! isPanelActive('assemblyUploadAnalytics')) {
    //         activatePanel('assemblyUploadAnalytics');
    //         showPanel('assemblyUploadAnalytics');
    //     }        

    //     if (! isPanelActive('assemblyUploadMetadata')) {
    //         activatePanel('assemblyUploadMetadata');
    //         showPanel('assemblyUploadMetadata');
    //     }
    // };







    // /*
    //     Sequence list navigation buttons
    // */
    // // Disable/enable range navigation buttons
    // /**
    //  * Description
    //  * @method updateRangeNavigationButtons
    //  * @param {} handleValue
    //  * @return 
    //  */
    // var updateRangeNavigationButtons = function(handleValue) {
    //     // Update sequence navigation buttons
    //     if (handleValue === 1) { // Reached min limit
    //         // Disable prev sequence button
    //         $('.nav-prev-item').attr('disabled', 'disabled');
    //         // Enable next sequence button (if disabled)
    //         $('.nav-next-item').removeAttr('disabled', 'disabled');
    //     } else if (handleValue === parseInt($('.total-number-of-dropped-assemblies').text())) { // Reached max limit
    //         // Disable next sequence button
    //         $('.nav-next-item').attr('disabled', 'disabled');
    //         // Enable prev sequence button (if disabled)
    //         $('.nav-prev-item').removeAttr('disabled', 'disabled');
    //     } else {
    //         // Enable both buttons (if any disabled)
    //         $('.nav-next-item').removeAttr('disabled', 'disabled');
    //         $('.nav-prev-item').removeAttr('disabled', 'disabled');
    //     }
    // };

    // /**
    //  * Description
    //  * @method resetPanelAssemblyUploadNavigator
    //  * @return 
    //  */
    // var resetPanelAssemblyUploadNavigator = function() {
    //     var panel = $('.wgst-panel__assembly-upload-navigator');
    //     // Set average number of contigs per assembly
    //     panel.find('.assembly-sequences-average').text('0');
    //     // Set total number of selected assemblies/files
    //     panel.find('.assembly-upload-total-number').text('0');
    // };




    // /**
    //  * Description
    //  * @method resetPanelAssemblyUploadAnalytics
    //  * @return 
    //  */
    // var resetPanelAssemblyUploadAnalytics = function() {
    //     var panel = $('.wgst-panel__assembly-upload-analytics');
    //     panel.find('.wgst-assembly-upload__analytics ul').html('');
    // };



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

    // var updateSelectedFilesUI = function(elementCounter) {
    //     // Update sequence counter label
    //     $('.selected-assembly-counter').text(elementCounter);

    //     // Update assembly file name
    //     var fileName = $('.assembly-item').eq(elementCounter - 1).attr('data-name');

    //     // Update file name in Assembly Upload Navigator
    //     $('.wgst-panel__assembly-upload-navigator .assembly-file-name').text(fileName);

    //     // Update file name in Assembly Upload Metadata panel
    //     $('.wgst-panel__assembly-upload-metadata .header-title small').text(fileName);

    //     // Update file name in Assembly Upload Analytics panel
    //     $('.wgst-panel__assembly-upload-analytics .header-title small').text(fileName);

    //     // Update sequence counter label
    //     updateRangeNavigationButtons(elementCounter);
    // };

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

    // // Navigate to the previous sequence
    // $('.nav-prev-item').on('click', function() {
    //     var $slider = $('.assembly-list-slider'),
    //         currentSliderValue = $slider.slider('value');

    //     console.log('@@@ currentSliderValue: ' + currentSliderValue);

    //     // Check if selected sequence counter value is greater than 1
    //     if (currentSliderValue > 0) {
    //         // Decrement slider's value
    //         $slider.slider('value', currentSliderValue - 1);

    //         //showPreviousAssembly();
    //     }
    // });
    // // Navigate to the next sequence
    // $('.nav-next-item').on('click', function() {
    //     var $slider = $('.assembly-list-slider'),
    //         currentSliderValue = $slider.slider('value');

    //     console.log('@@@ currentSliderValue: ' + currentSliderValue);

    //     // Check if selected sequence counter value is less than total number of dropped assemblies
    //     if (currentSliderValue < WGST.dragAndDrop.loadedFiles.length) {
    //         // Increment slider's value
    //         $slider.slider('value', currentSliderValue + 1);

    //         //showNextAssembly();
    //     }
    // });

    // Assembly metadata from

    // // Show hint message when 'I am not sure' checkbox is checkec
    // $('.wgst-assembly-upload__metadata').on('click', '.not-sure-checkbox', function(){
    //     // Show 'I am not sure' message
    //     $(this).closest('label').find('.not-sure-hint').toggleClass('wgst--hide-this');
    // });



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











    // /**
    //  * Description
    //  * @method endAssemblyUploadProgressBar
    //  * @param {} collectionId
    //  * @return 
    //  */
    // var endAssemblyUploadProgressBar = function(collectionId) {
    //     // Update bar's width
    //     $('.uploading-assembly-progress-container .progress-bar').width('100%');
    //     // Update aria-valuenow attribute
    //     $('.uploading-assembly-progress-container .progress-bar').attr('aria-valuenow', 100);
    //     // Update percentage value
    //     $('.uploading-assembly-progress-container .progress-percentage').text('100%');

    //     //$('.uploading-assembly-progress-container .progress').removeClass('active');

    //     // Allow smooth visual transition of elements
    //     setTimeout(function(){
    //         $('.uploading-assembly-progress-container .progress-percentage').text('All done!');
    //         $('.uploading-assembly-progress-container .progress').slideUp(function(){

                
    //             // Allow smooth visual transition of elements
    //             // setTimeout(function(){
    //             //     $('.uploaded-assembly-url').slideDown(function(){
    //             //         $('.uploading-assembly-progress-container .progress-label').slideUp();
    //             //     });
    //             // }, 500);
                

    //         });
    //     }, 500);

    //     // It takes less than 30 seconds to process one assembly
    //     //var seconds = 30 * Object.keys(fastaFilesAndMetadata).length;
    //         //function() {
    //             //$('.visit-url-seconds-number').text(seconds);
    //             //seconds = seconds - 1;
    //             //if (seconds === 0) {
    //                 // Hide processing assembly seconds countdown
    //                 //$('.uploaded-assembly-process-countdown-label').fadeOut(function(){
    //                     // Update status
    //                     //$('.uploaded-assembly-process-status').text('finished processing');
    //                 //});
    //             //}

    // };

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



    // // User wants to select representative tree branch
    // $('.collection-assembly-list').on('change', 'input[type="radio"]', function(e) {

    //     //
    //     // Temporary disable this functionality until representative collection is reuploaded
    //     //
    //     return;

    //     var selectedAssemblyId = $(this).attr('data-assembly-id'),
    //         collectionId = $(this).closest('.wgst-collection-info').attr('data-collection-id');

    //     $('.collection-assembly-list .assembly-list-item.row-selected').removeClass('row-selected');
    //     $('.collection-assembly-list .assembly-list-item[data-assembly-id="' + selectedAssemblyId + '"]').addClass('row-selected');

    //     WGST.collection[collectionId].tree.canvas.selectNodes(selectedAssemblyId);

    //     // var leaves = WGST.collection[collectionId].tree.canvas.leaves;
    //     // console.dir(WGST.collection[collectionId].tree.canvas.leaves);
    //     // var selectedLeaf = $.grep(leaves, function(leaf){ return leaf.id === selectedAssemblyId; });
    //     // selectedLeaf[0].nodeShape = 'square';
    //     //WGST.collection[collectionId].tree.canvas.leaves[selectedAssemblyId].nodeShape = 'rectangular';

    //     // Show collection tree panel
    //     activatePanel('collectionTree');
    //     showPanel('collectionTree');
    //     showPanelBodyContent('collectionTree');
    //     bringPanelToTop('collectionTree');

    //     //======================================================
    //     // Tree - THIS IS FOR SELECTING MULTIPLE ASSEMBLIES
    //     //======================================================

    //     // // Store node ids to highlight in a string
    //     // var checkedAssemblyNodesString = '',
    //     //     collectionId = $(this).closest('.wgst-panel').attr('data-collection-id');

    //     // // Get node id of each node that user selected via checked checkbox 
    //     // $('.wgst-panel__collection .collection-assembly-list input[type="radio"]:checked').each(function(){
    //     //     // Concat assembly ids to string
    //     //     // Use this string to highlight nodes on tree
    //     //     if (checkedAssemblyNodesString.length > 0) {
    //     //         checkedAssemblyNodesString = checkedAssemblyNodesString + ',' + $(this).attr('data-assembly-id');
    //     //     } else {
    //     //         checkedAssemblyNodesString = $(this).attr('data-assembly-id');
    //     //     }
    //     // });

    //     // //console.debug('checkedAssemblyNodesString: ' + checkedAssemblyNodesString);
    //     // //console.dir(WGST.collection[collectionId].tree.canvas);

    //     // // Highlight assembly with the highest score on the representative tree

    //     // WGST.collection[collectionId].tree.canvas.selectNodes(checkedAssemblyNodesString);
    //     // //WGST.representativeTree.tree.selectNodes(checkedAssemblyNodesString);
    // });

    // $('.assemblies-upload-cancel-button').on('click', function() {
    //     // Close FASTA files upload panel
    //     $('.assembly-upload-panel').hide();
    //     // Remove stored dropped FASTA files
    //     fastaFilesAndMetadata = {};
    //     // Remove stored selected FASTA file
    //     selectedFastaFileName = '';
    //     // Remove analytics HTML element
    //     $('.wgst-assembly-upload__analytics ul').html('');
    //     // Remove metadata HTML element
    //     $('.wgst-assembly-upload__metadata ul').html('');
    //     // Reset progress bar
    //     // Update bar's width
    //     $('.adding-metadata-progress-container .progress-bar').width('0%');
    //     // Update aria-valuenow attribute
    //     $('.adding-metadata-progress-container .progress-bar').attr('aria-valuenow', 0);
    //     // Update percentage value
    //     $('.adding-metadata-progress-container .progress-percentage').text('0%');
    //     // Remove metadata marker
    //     WGST.geo.map.markers.metadata.setMap(null);
    // });

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



    // Deselect Twitter Bootstrap button on click
    $('.tree-panel .wgst-tree-controls button').on('click', function(){
        $(this).blur();
    });









    // $('.collection-controls-show-on-representative-tree').on('click', function(){
    //     var collectionId = $(this).closest('.wgst-panel__collection').attr('data-collection-id'),
    //         nearestRepresentative = WGST.collection[collectionId];

    //         console.dir(nearestRepresentative);
    // });



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



    // /**
    //  * Description
    //  * @method renderRepresentativeCollectionTree
    //  * @return 
    //  */
    // var renderRepresentativeCollectionTree = function() {
    //     console.log('[WGST] Rendering representative collection tree');

    //     var collectionId = 'representative';//WGST.settings.representativeCollectionId;

    //     // Remove previosly rendered collection tree
    //     $('.wgst-panel__representative-collection-tree .wgst-tree-content').html('');
    //     // Attach collection id
    //     $('.wgst-panel__representative-collection-tree .wgst-tree-content').attr('id', 'phylocanvas_' + collectionId);

    //     console.log('WGST.collection.representative:');
    //     console.dir(WGST.collection.representative);

    //     WGST.collection.representative.tree.canvas = new PhyloCanvas.Tree($('[data-panel-name="representativeCollectionTree"] .wgst-tree-content').get(0), { history_collapsed: true });
    //     WGST.collection.representative.tree.canvas.load('/data/reference_tree.nwk');
    //     WGST.collection.representative.tree.canvas.treeType = 'rectangular';

    //     // // Need to resize to fit it correctly
    //     // WGST.collection.representative.tree.canvas.resizeToContainer();
    //     // // Need to redraw to actually see it
    //     // WGST.collection.representative.tree.canvas.drawn = false;
    //     // WGST.collection.representative.tree.canvas.draw();
    // };

    // /**
    //  * Description
    //  * @method openRepresentativeCollectionTree
    //  * @return 
    //  */
    // var openRepresentativeCollectionTree = function() {
    //     console.log('[WGST] Opening representative collection tree');

    //     // TO DO: Figure out whether representative tree is just another collection or it's a completely separate entity.
    //     // Currently treating it like just another collection.

    //     var collectionId = 'representative';//WGST.settings.representativeCollectionId;

    //     // ----------------------------------------
    //     // Init panels
    //     // ----------------------------------------
    //     // Set collection id to representativeCollectionTree panel
    //     $('.wgst-panel__representative-collection-tree').attr('data-collection-id', collectionId);

    //     // activatePanel('representativeCollectionTree', function(){
    //     //     startPanelLoadingIndicator('representativeCollectionTree');
    //     // });

    //     activatePanel('representativeCollectionTree');
    //     endPanelLoadingIndicator('representativeCollectionTree');
    //     showPanelBodyContent('representativeCollectionTree');
    //     showPanel('representativeCollectionTree');
    //     bringPanelToTop('representativeCollectionTree');

    //     // getRepresentativeCollectionTreeMetadata(function(error, representativeCollectionMetadata){
    //     //     if (error) {
    //     //         // Show error notification
    //     //         return;
    //     //     }
           
    //     //     renderRepresentativeCollectionTree();

    //     //     // // Init collection tree
    //     //     // WGST.collection.representative.tree.canvas = new PhyloCanvas.Tree($('[data-panel-name="representativeCollectionTree"] .phylocanvas')[0]);
    //     //     // // Render collection tree
    //     //     // //renderCollectionTree(collectionId);

    //     //     // WGST.collection.representative.tree.canvas.load('/data/reference_tree.nwk');
    //     //     // WGST.collection.representative.tree.canvas.treeType = 'rectangular';
    //     //     // //WGST.collection.representative.tree.showLabels = false;
    //     //     // WGST.collection.representative.tree.canvas.baseNodeSize = 0.5;
    //     //     // WGST.collection.representative.tree.canvas.setTextSize(24);
    //     //     // WGST.collection.representative.tree.canvas.selectedNodeSizeIncrease = 0.5;
    //     //     // WGST.collection.representative.tree.canvas.selectedColor = '#0059DE';
    //     //     // WGST.collection.representative.tree.canvas.rightClickZoom = true;
    //     //     // //WGST.collection.representative.tree.canvas.onselected = showRepresentativeTreeNodesOnMap;

    //     //     // endPanelLoadingIndicator('representativeCollectionTree');
    //     //     // showPanelBodyContent('representativeCollectionTree');
    //     //     // showPanel('representativeCollectionTree');
    //     // });

    //     // // Get representative collection metadata
    //     // $.ajax({
    //     //     type: 'GET',
    //     //     url: '/api/collection/representative/metadata',
    //     //     datatype: 'json' // http://stackoverflow.com/a/9155217
    //     // })
    //     // .done(function(representativeCollectionMetadata, textStatus, jqXHR) {
    //     //     console.log('[WGST] Got representative collection metadata');
    //     //     console.dir(representativeCollectionMetadata);

    //     //     // ----------------------------------------
    //     //     // Render collection tree
    //     //     // ----------------------------------------
    //     //     // Remove previosly rendered collection tree
    //     //     $('.wgst-panel__representative-collection-tree .phylocanvas').html('');
    //     //     // Attach collection id
    //     //     $('.wgst-panel__representative-collection-tree .phylocanvas').attr('id', 'phylocanvas_' + collectionId);
    //     //     // Init collection tree
    //     //     WGST.collection.representative.tree.canvas = new PhyloCanvas.Tree($('[data-panel-name="representativeCollectionTree"] .phylocanvas')[0]);
    //     //     // Render collection tree
    //     //     //renderCollectionTree(collectionId);

    //     //     WGST.collection.representative.tree.canvas.load('/data/reference_tree.nwk');
    //     //     WGST.collection.representative.tree.canvas.treeType = 'rectangular';
    //     //     //WGST.collection.representative.tree.showLabels = false;
    //     //     WGST.collection.representative.tree.canvas.baseNodeSize = 0.5;
    //     //     WGST.collection.representative.tree.canvas.setTextSize(24);
    //     //     WGST.collection.representative.tree.canvas.selectedNodeSizeIncrease = 0.5;
    //     //     WGST.collection.representative.tree.canvas.selectedColor = '#0059DE';
    //     //     WGST.collection.representative.tree.canvas.rightClickZoom = true;
    //     //     //WGST.collection.representative.tree.canvas.onselected = showRepresentativeTreeNodesOnMap;

    //     //     endPanelLoadingIndicator('representativeCollectionTree');
    //     //     showPanelBodyContent('representativeCollectionTree');
    //     //     showPanel('representativeCollectionTree');
    //     // })
    //     // .fail(function(jqXHR, textStatus, errorThrown) {
    //     //     console.error('✗ [WGST][Error] Failed to get representative collection metadata');
    //     //     console.error(textStatus);
    //     //     console.error(errorThrown);
    //     //     console.error(jqXHR);
    //     // });

    //         //WGST.collection.representative.tree.data = data.collection.tree;
    //         //WGST.collection[collectionId].assemblies = data.collection.assemblies;

    //         // // ----------------------------------------
    //         // // Render collection tree
    //         // // ----------------------------------------
    //         // // Remove previosly rendered collection tree
    //         // $('.wgst-panel__collection-tree .phylocanvas').html('');
    //         // // Attach collection id
    //         // $('.wgst-panel__collection-tree .phylocanvas').attr('id', 'phylocanvas_' + collectionId);
    //         // // Init collection tree
    //         // WGST.collection[collectionId].tree.canvas = new PhyloCanvas.Tree(document.getElementById('phylocanvas_' + collectionId));
    //         // // Render collection tree
    //         // renderCollectionTree(collectionId);

    //         // endPanelLoadingIndicator('collectionTree');
    //         // //showPanelBodyContent('collectionTree');

    //     // ----------------------------------------
    //     // Load representative collection tree
    //     // ----------------------------------------
    //     // AAA


    //     // WGST.representativeTree.tree.load('/data/reference_tree.nwk');
    //     // WGST.representativeTree.tree.treeType = 'rectangular';
    //     // //WGST.representativeTree.tree.showLabels = false;
    //     // WGST.representativeTree.tree.baseNodeSize = 0.5;
    //     // WGST.representativeTree.tree.setTextSize(24);
    //     // WGST.representativeTree.tree.selectedNodeSizeIncrease = 0.5;
    //     // WGST.representativeTree.tree.selectedColor = '#0059DE';
    //     // WGST.representativeTree.tree.rightClickZoom = true;
    //     // WGST.representativeTree.tree.onselected = showRepresentativeTreeNodesOnMap;

    //     // // ==============================
    //     // // Load reference tree metadata
    //     // // ==============================
    //     // console.log('[WGST] Getting representative tree metadata');

    //     // $.ajax({
    //     //     type: 'POST',
    //     //     url: '/representative-tree-metadata/',
    //     //     datatype: 'json', // http://stackoverflow.com/a/9155217
    //     //     data: {}
    //     // })
    //     // .done(function(data, textStatus, jqXHR) {
    //     //     console.log('[WGST] Got representative tree metadata');
    //     //     console.dir(data.value);

    //     //     // Create representative tree markers
    //     //     var metadataCounter = data.value.metadata.length,
    //     //         metadata = data.value.metadata,
    //     //         accession,
    //     //         marker;

    //     //     for (; metadataCounter !== 0;) {
    //     //         // Decrement counter
    //     //         metadataCounter = metadataCounter - 1;

    //     //         //console.log('[WGST] Representative tree metadata for ' + metadata[metadataCounter] + ':');
    //     //         //console.log(metadata[metadataCounter]);

    //     //         accession = metadata[metadataCounter].accession;

    //     //         // Set representative tree metadata
    //     //         WGST.representativeTree[accession] = metadata[metadataCounter];
    //     //     } // for
    //     // })
    //     // .fail(function(jqXHR, textStatus, errorThrown) {
    //     //     console.log('[WGST][ERROR] Failed to get representative tree metadata');
    //     //     console.error(textStatus);
    //     //     console.error(errorThrown);
    //     //     console.error(jqXHR);
    //     // });


    // };

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

    // google.maps.event.addDomListener(window, "resize", function() {
    //     var map = WGST.geo.map.canvas;
    //     var center = map.getCenter();
    //     google.maps.event.trigger(map, "resize");
    // map.setCenter(center); 
    // });








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

    // $('.collection-assembly-list-view-all-assemblies').on('click', function(e) {
    //     var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id'),
    //         collectionAssemblyList = $('.collection-assembly-list');

    //     // Redraw original tree and set original zoom
    //     WGST.collection[collectionId].tree.canvas.redrawOriginalTree();
    //     WGST.collection[collectionId].tree.canvas.setZoom(-0.05);

    //     // Remove existing assemblies from assembly list
    //     collectionAssemblyList.find('.assembly-list-item').remove();
    //     // Append new assemblies
    //     collectionAssemblyList.append($('.collection-assembly-list-full .assembly-list-item').clone());

    //     collectionAssemblyList.find('.antibiotic[data-toggle="tooltip"]').tooltip();

    //     // Hide filter message
    //     $('.collection-assembly-list-all-assemblies').hide();
    //     // Show scroll message
    //     $('.collection-assembly-list-more-assemblies').show();

    //     e.preventDefault();
    // });

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
        var $canvas = $(this).closest('.wgst-panel-body-container').find('canvas.phylocanvas');
        treeManipulationHandler($canvas);
    });

    // Init map
    //window.WGST.geo.map.init();

});

// TO DO:
// + Sort assemblies selected to upload alphabetically.