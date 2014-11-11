$(function(){

	(function(){

        window.WGST.exports.createCollectionDataPanel = function(collectionId) {
            var panelId = 'collection-data' + '__' + collectionId,
                panelType = 'collection-data';
                
            var templateContext = {
                collectionId: collectionId,
                panelId: panelId,
                panelType: panelType
            };

            window.WGST.exports.createPanel(panelType, templateContext);

            return panelId;
        };

        var clearCollectionAssemblyList = function(collectionId) {
            console.log('[WGST] Clearing ' + collectionId + ' collection assembly list');

            $('.wgst-panel__collection .collection-assembly-list').html('');
        };

        //
        // User wants to show assembly on a map
        //
        $('body').on('change', '.wgst-assembly-show-on-map', function(e) {

            //======================================================
            // Map
            //======================================================
            var checkedAssemblyId = $(this).attr('data-assembly-id'),
                collectionId = $(this).closest('[data-wgst-collection-data]').attr('data-collection-id');

            var allCheckedCheckboxes = $(this).closest('.wgst-collection-data-assemblies').find('.wgst-assembly-show-on-map:checked'),
                selectedAssemblyIds = [],
                selectedAssemblyId;

            allCheckedCheckboxes.each(function(index, element){
                selectedAssemblyId = $(this).attr('data-assembly-id');
                selectedAssemblyIds.push(selectedAssemblyId);
            });

            console.debug('>>> }}} A');
            console.dir(selectedAssemblyIds);

            window.WGST.exports.triggerMapMarkers(collectionId, selectedAssemblyIds);

            // Open map panel if it's not displayed and map is not in fullscreen mode
            if ($('.wgst-fullscreen--active').attr('data-fullscreen-name') !== 'map') {
                if (! $('.wgst-panel__map').hasClass('wgst-panel--active')) {
                    window.WGST.exports.showPanel('map');
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
            if ($(this).closest('.wgst-collection-data-assemblies').find('input[type="checkbox"]:not(:checked)').length === 0) {
                $('.wgst-assembly-show-all-on-map').prop('checked', true);
            } else {
                $('.wgst-assembly-show-all-on-map').prop('checked', false);
            }
        });

        // $('.wgst-panel__collection, .wgst-fullscreen__collection').on('click', '.show-on-representative-tree', function(event){

        //     return false;

        //     openRepresentativeCollectionTree();

        //     // endPanelLoadingIndicator('representativeCollectionTree');
        //     // activatePanel('representativeCollectionTree');
        //     // showPanel('representativeCollectionTree');
        //     // showPanelBodyContent('representativeCollectionTree');
        //     // bringPanelToTop('representativeCollectionTree');

        //     var collectionId = $(this).closest('.wgst-collection-info').attr('data-collection-id'),
        //         //collectionId = $(this).closest('.wgst-panel__collection').attr('data-collection-id'),
        //         assemblyId = $(this).attr('data-assembly-id'),
        //         referenceId = WGST.collection[collectionId].assemblies[assemblyId].FP_COMP.topScore.referenceId;

        //     WGST.collection.representative.tree.canvas.selectNodes(referenceId);

        //     event.preventDefault();
        // });

        // Open Assembly from Collection list
        $('body').on('click', '.open-assembly-button', function(event){

            var assemblyId = $(this).attr('data-assembly-id');

            window.WGST.exports.getAssembly(assemblyId);

            event.preventDefault();
        });

        $('body').on('click', '.wgst-collection-control__show-tree', function(){
            var collectionId = $(this).attr('data-collection-id'),
                collectionTreeType = $(this).attr('data-tree-type'),
                collectionTreePanelId = 'collection-tree' + '__' + collectionId + '__' + collectionTreeType;

            //window.WGST.exports.togglePanel(collectionTreePanelId);
            //$('[data-panel-id="' + collectionTreePanelId + '"]').css('visibility', 'visible');

            window.WGST.exports.showPanel(collectionTreePanelId);
            window.WGST.exports.bringPanelToFront(collectionTreePanelId);

            // window.WGST.exports.activatePanel(collectionTreePanelId);
            // window.WGST.exports.showPanel(collectionTreePanelId);
            // window.WGST.exports.showPanelBodyContent(collectionTreePanelId);
            // window.WGST.exports.bringPanelToTop(collectionTreePanelId);
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

        window.WGST.exports.renderCollectionTreeButtons = function(collectionId, panelId) {
            // Init all collection trees
            var collectionTrees = WGST.collection[collectionId].tree;

            $.each(collectionTrees, function(collectionTreeType, collectionTreeData) {
                if (collectionTreeType === 'COLLECTION_TREE') {
                    // Render collection tree button
                    renderCollectionTreeButton(collectionId, panelId, collectionTreeType);    
                }
            });
        };

        var renderCollectionTreeButton = function(collectionId, panelId, collectionTreeType) {

            var collectionTree = WGST.collection[collectionId].tree[collectionTreeType],
                collectionTreeName = collectionTree.name;

            var templateContext = {
                collectionTreeType: collectionTreeType,
                collectionId: collectionId,
                collectionTreeName: 'Tree'
            };

            //
            // Render button
            //
            var buttonTemplateSource = $('.wgst-template[data-template-id="panel-body__collection-data__tree-button"]').html(),
                buttonTemplate = Handlebars.compile(buttonTemplateSource);

            //
            // Html
            //
            var buttonHtml = buttonTemplate(templateContext);
            $('.wgst-panel[data-panel-id="' + panelId + '"]').find('.wgst-collection-controls__show-tree .btn-group').prepend(buttonHtml);






            // // Init all collection trees
            // var collectionTree = WGST.collection[collectionId].tree[collectionTreeType],
            //     collectionTreeName = collectionTree.name,
            //     openTreeButton,
            //     openTreeButtonTemplate = '<button type="button" class="btn btn-sm btn-default wgst-collection-control__show-tree" data-tree-type="{{collectionTreeType}}" data-collection-id="{{collectionId}}" data-mixpanel-show-tree-button="{{collectionTreeType}}">{{collectionTreeName}}</button>',
            //     $collectionControlsShowTree = $('.wgst-collection-controls__show-tree .btn-group');//,
            //     //$collectionControlsShowDataTable = $('.wgst-collection-controls__show-data-table .btn-group');

            // // Add "Open tree" button to this collection panel
            // openTreeButton = openTreeButtonTemplate.replace(/{{collectionTreeType}}/g, collectionTreeType);
            // openTreeButton = openTreeButton.replace(/{{collectionId}}/g, collectionId);
            // openTreeButton = openTreeButton.replace(/{{collectionTreeName}}/g, collectionTreeName);
            // $collectionControlsShowTree.append($(openTreeButton));

            // $('.wgst-panel[data-panel-id="' + panelId + '"]').find('.wgst-collection-controls__show-data-table .btn-group');
        };

        // var renderCollectionDataButton = function(collectionId) {
        //     // Init all collection trees
        //     var openCollectionDataTableButton,
        //         openCollectionDataTableTemplate = '<button type="button" class="btn btn-sm btn-default wgst-collection-control__show-data-table" data-collection-id="{{collectionId}}">Core Genome Profile</button>',
        //         $collectionControlsShowDataTable = $('.wgst-collection-controls__show-data-table .btn-group');

        //     openCollectionDataTableButton = openCollectionDataTableTemplate.replace(/{{collectionId}}/g, collectionId);
        //     $collectionControlsShowDataTable.append($(openCollectionDataTableButton));
        // };

        window.WGST.exports.renderCollectionTrees = function(collectionId, collectionTreeOptions) {

            var collectionTrees = window.WGST.collection[collectionId].tree;

            console.dir(window.WGST.collection[collectionId]);

            $.each(collectionTrees, function(collectionTreeType, collectionTreeData) {

                //
                // Render collection tree
                //
                renderCollectionTree(collectionId, collectionTreeType, collectionTreeOptions);
            });
        };

        var renderCollectionTree = function(collectionId, collectionTreeType, options) {
            console.log('[WGST] Rendering ' + collectionId + ' collection ' +  collectionTreeType + ' tree');

            //
            // Create panel
            //
            var collectionTreePanelId = 'collection-tree' + '__' + collectionId + '__' + collectionTreeType,
                collectionTreeName = window.WGST.collection[collectionId].tree[collectionTreeType].name.capitalize();

            var phylocanvasId = 'phylocanvas__' + collectionId + '__' + collectionTreeType;

            var panelType = 'collection-tree';

            var templateContext = {
                panelId: collectionTreePanelId,
                panelType: panelType,
                collectionId: collectionId,
                collectionTreeType: collectionTreeType,
                collectionTreeTitle: collectionTreeName,
                phylocanvasId: phylocanvasId,
                invisibleThis: true,
                dataAttributes: [{
                    name: 'data-collection-tree-type',
                    value: collectionTreeType
                }]
            };

            //
            // Extend template context if needed - different type of trees need different data
            //
            if (typeof options !== 'undefined') {
                $.extend(templateContext, options);
            }

            //
            // Do not allow reference collection to merge with itself
            //
            if (collectionId === window.WGST.config.referenceCollectionId) {
                templateContext.mergeWithButton = true;
            }

            //
            // Create panel
            //
            window.WGST.exports.createPanel(panelType, templateContext);

            //
            // Render tree
            //
            var tree = window.WGST.collection[collectionId].tree[collectionTreeType],
                assemblies = window.WGST.collection[collectionId].assemblies,
                assemblyId;

            tree.canvas = new PhyloCanvas.Tree($('[data-phylocanvas-id="' + phylocanvasId + '"]')[0], { history_collapsed: true });
            tree.canvas.parseNwk(tree.data);
            tree.canvas.treeType = 'rectangular';

            var treeCanvas = tree.canvas;

            //
            // Handle selected event
            //
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

                //
                // No tree nodes to select - return
                //
                if (selectedNodeIds.length === 0) {
                    return;
                }

                //
                // Select tree nodes
                //
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

            window.WGST.collection[collectionId].tree[collectionTreeType].newickStringWithLabels = newickString;

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

            //
            // Populate list of antibiotics
            //
            $collectionTreePanel = $('.wgst-panel[data-panel-id="' + collectionTreePanelId + '"]');
            window.WGST.exports.populateListOfAntibiotics($collectionTreePanel.find('.wgst-tree-control__change-node-colour'));

            // Need to resize to fit it correctly
            treeCanvas.resizeToContainer();
            // Need to redraw to actually see it
            treeCanvas.drawn = false;
            treeCanvas.draw();
        };

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

            window.WGST.exports.triggerMapMarkers(collectionId, selectedAssemblyIds);

            //
            // If only one assembly was selected then check radiobox
            //
            if (selectedAssemblyIds.length === 1) {
                $('.collection-assembly-list .assembly-list-item[data-assembly-id="' + selectedAssemblyIds + '"] [type="radio"]').prop('checked', true);
            }

            // if (selectedAssemblyIds.split(',').length > 2) {
            //     $('.tree-controls-draw-subtree').attr('data-selected-node', selectedAssemblyIds.split(',')[0]);
            // }
        };

        //
        // User wants to toggle all assemblies on map
        //
        $('body').on('change', '.wgst-assembly-show-all-on-map', function(e) {

            var $showOnMapCheckboxes = $(this).closest('[data-wgst-collection-data]').find('.wgst-collection-data-assemblies .wgst-assembly-show-on-map');
            
            if ($(this).prop('checked')) {

                console.log('X1');

                //
                // Check all
                //
                $showOnMapCheckboxes.prop('checked', true).trigger('change');

            } else {
                
                console.log('X2');

                //
                // Uncheck all
                //
                $showOnMapCheckboxes.prop('checked', false).trigger('change');
            }
        });

        //
        // Download assembly metadata
        //
        $('body').on('click', '[data-wgst-download-metadata]', function(){

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