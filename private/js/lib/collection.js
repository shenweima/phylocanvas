$(function(){

	(function(){

		//
		// Map collection id to collection name
		//
		window.WGST.exports.mapCollectionIdToCollectionName = {
			'5324c298-4cd0-4329-848b-30d7fe28a560': 'EMRSA15',
			'c0ca8c57-11b9-4e27-93a5-6ffe841e7768': 'ST239',
			'b8d3aab1-625f-49aa-9857-a5e97f5d6be5': 'Reference'
		};

		//
		// Init collection data structure
		//
	    window.WGST.exports.initCollectionDataStructure = function(collectionId, collectionTreeTypes) {
	        WGST.collection[collectionId] = {
	            assemblies: {},
	            tree: {}
	        };

	        // Init each collection tree type
	        if ($.isArray(collectionTreeTypes)) {
	            collectionTreeTypes.forEach(function(collectionTreeType){
	                window.WGST.collection[collectionId].tree[collectionTreeType] = {};
	            });
	        }
	    };

	    window.WGST.exports.setCollectionData = function(collectionId, collectionAssemblies, collectionTrees) {
	    	//
	    	// Init collection data structure
	        //
	        window.WGST.exports.initCollectionDataStructure(collectionId);
	        
	        //
	        // Put in data
	        //
	        
	        // Put in assemblies
	        window.WGST.collection[collectionId].assemblies = collectionAssemblies;

	        // Put in trees
	        $.each(collectionTrees, function(collectionTreeType, collectionTreeData) {
	            window.WGST.collection[collectionId].tree[collectionTreeType] = {
	                type: collectionTreeType,
	                data: collectionTreeData.data,
	                name: collectionTreeData.name
	            };
	        });
	    };

	    var sortCollectionAssemblies = function(collectionId) {
            var assemblies = WGST.collection[collectionId].assemblies,
                sortedAssemblies = [],
                sortedAssemblyIds = [];

            // Sort assemblies in order in which they are displayed on tree
            $.each(window.WGST.collection[collectionId].tree['CORE_TREE_RESULT'].leavesOrder, function(leafCounter, leaf){
                sortedAssemblies.push(assemblies[leaf.id]);
                sortedAssemblyIds.push(leaf.id);
            });

            WGST.collection[collectionId].sortedAssemblyIds = sortedAssemblyIds;
	    };

	    window.WGST.exports.getCollection = function(collectionId) {
	        console.log('[WGST] Getting collection ' + collectionId);

	        if (WGST.speak) {
	            var message = new SpeechSynthesisUtterance('Loading collection');
	            window.speechSynthesis.speak(message);
	        }

	        // When extending current collection, close it and then open it again
	        //
	        // ???
	        //
	        //closeCollection(collectionId);

	        // Get collection data
	        $.ajax({
	            type: 'POST',
	            url: '/collection/',
	            // http://stackoverflow.com/a/9155217
	            datatype: 'json',
	            data: {
	                collectionId: collectionId
	            }
	        })
	        .done(function(data, textStatus, jqXHR) {
	            console.log('[WGST] Got collection ' + collectionId + ' data');
	            //console.dir(data);

	            if (Object.keys(data).length > 0) {
	                console.log('[WGST] Collection ' + collectionId + ' has ' + Object.keys(data.collection.assemblies).length + ' assemblies');

	            	//
	                // Update list of antibiotics
	                //
	                window.WGST.antibiotics = data.antibiotics;

	                //
	                // Set collection data
	                //
	                window.WGST.exports.setCollectionData(collectionId, data.collection.assemblies, data.collection.tree);

	                //
	                // Create collection data panel
	                // 
	        		var collectionPanelId = window.WGST.exports.createCollectionDataPanel(collectionId);
	        		var $collectionPanel = $('.wgst-panel[data-panel-id="' + collectionPanelId + '"]');

                    //
				    // Initialise map
				    //
			    	window.WGST.geo.map.init();

	                //
	                // Create collection map fullscreen
	                // 
	        		window.WGST.exports.createFullscreen('collection-map', {
	        			fullscreenType: 'collection-map'
	        		});

	        		//
		            // Bring panel to top
		            //
	        		window.WGST.exports.bringPanelToFront(collectionPanelId);

	                //
	                // Render
	                //
	                window.WGST.exports.renderCollectionTrees(collectionId);
	                window.WGST.exports.renderCollectionTreeButtons(collectionId, collectionPanelId);
	                //renderCollectionDataButton(collectionId);

	                //
	                // Set resistance profile data to collection
	                //
	                window.WGST.exports.addResistanceProfileDataToCollection(collectionId);

	                //
	                // Sort collection assemblies
	                //
	                sortCollectionAssemblies(collectionId);

	                //
	                // Render assembly analysis list
	                //
	                window.WGST.exports.renderAssemblyAnalysisList(collectionId, collectionPanelId, WGST.antibiotics);

	                //
	                // Show panel
	                //
	               	// window.WGST.exports.togglePanel(collectionPanelId);
	                window.WGST.exports.showPanel(collectionPanelId);

	                //
	                // Set collection name in header
	                //
	                if (typeof window.WGST.exports.mapCollectionIdToCollectionName[collectionId] !== 'undefined') {
	                	$('.wgst-header-collection-name').text(window.WGST.exports.mapCollectionIdToCollectionName[collectionId]);
	                } else {
	                	$('.wgst-header-collection-name').text(collectionId);
	                }

	        // ----------------------------------------
	        // Init collection panel
	        // ----------------------------------------
	        //var $collectionPanel = $('.wgst-panel__collection');
	        // Set panel id
	        //$collectionPanel.attr('data-panel-id', 'collection_' + collectionId);
	        // Set collection id to collection panel
	        //$collectionPanel.attr('data-collection-id', collectionId);
	        // Set collection id
	        //$collectionPanel.find('.collection-details').attr('data-collection-id', collectionId);
	        //$collectionPanel.find('.wgst-collection-control__show-tree').attr('collection-id', collectionId);;

	       	// window.WGST.exports.activatePanel('collection', function(){
	        //     window.WGST.exports.startPanelLoadingIndicator('collection');
	        //     window.WGST.exports.showPanel('collection');
	        // });







	                // ----------------------------------------
	                // Prepare collection
	                // ----------------------------------------

	                // // Set collection creation timestamp
	                // var assemblyIds = Object.keys(assemblies),
	                //     lastAssemblyId = assemblyIds[assemblyIds.length - 1],
	                //     lastAssemblyTimestamp = assemblies[lastAssemblyId]['FP_COMP'].timestamp;
	                // // Format to readable string so that user could read detailed timestamp on mouse over
	                // $('.assembly-created-datetime').attr('title', moment(lastAssemblyTimestamp, "YYYYMMDD_HHmmss").format('YYYY-MM-DD HH:mm:ss'));
	                // // Convert to time ago string
	                // $('.timeago').timeago();

	                // ----------------------------------------
	                // Prepare collection stats
	                // ----------------------------------------
	                // $('.wgst-stats__collection .wgst-stats-value__total-number-of-assemblies').html(sortedAssemblies.length);
	                // $('.wgst-stats__collection .wgst-stats-value__number-of-displayed-assemblies').html(sortedAssemblies.length);
	                // $('.wgst-stats__collection .wgst-stats-value__number-of-selected-assemblies').html('0');
	                // $('.wgst-stats__collection .wgst-stats-value__created-on').html(moment(new Date()).format('DD/MM/YYYY'));
	                // $('.wgst-stats__collection .wgst-stats-value__author').html('Anonymous');
	                // $('.wgst-stats__collection .wgst-stats-value__privacy').html('Public');

	                // Scrolling hint
	                // if ($('.collection-assembly-list .assembly-list-item:visible').length > 7) {
	                //     $('.collection-assembly-list-more-assemblies').show();
	                // } else {
	                //     $('.collection-assembly-list-more-assemblies').hide();
	                // }

	                //showPanel('collection');
	                // window.WGST.exports.endPanelLoadingIndicator('collection');
	                // window.WGST.exports.showPanelBodyContent('collection');

	                //
	                // If collection has more than 100 assemblies then show fullscreen instead of a panel.
	                //
	                if (Object.keys(window.WGST.collection[collectionId].assemblies).length > 100) {
	                    console.log('[WGST] Collection ' + collectionId + ' will be displayed fullscreen');
	                    
	                    maximizeCollection(collectionId);
	                }

	                // Enable 'Collection' nav item

	                //window.WGST.exports.enableNavItem('collection');




	                //
	                // Update address bar
	                //
	                window.history.replaceState('Object', 'WGST Collection', '/collection/' + collectionId);




	                // ???
	                //
	                // Store open collection id
	                //
	                //WGST.collection.opened = collectionId;




	                //
	                // Show collection navigation
	                //
	                //$('.wgst-navigation__collection-panels').toggleClass('hide-this');

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

	    window.WGST.exports.addResistanceProfileDataToCollection = function(collectionId) {
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
	        
	            //console.log('WGST.collection[collectionId].assemblies[assemblyId].PAARSNP_RESULT.paarResult.ungroupedResistanceProfile:');
	            //console.dir(WGST.collection[collectionId].assemblies[assemblyId].PAARSNP_RESULT.paarResult.ungroupedResistanceProfile);
	        } // for
	    };

	    window.WGST.exports.renderAssemblyAnalysisList = function(collectionId, panelId, antibiotics) {
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

	        var $collectionDataPanel = $('.wgst-panel[data-panel-id="' + panelId + '"]'),
	        	collectionAssemblyList = $collectionDataPanel.find('.collection-assembly-list'),
	            collectionAssemblyListFull = $collectionDataPanel.find('.collection-assembly-list-full'),
	            assemblyListItemHtml,
	            assemblyListItems = document.createDocumentFragment();

	        // Render assemblies according to the sorting order
	        for (;assemblyCounter < sortedAssemblyIds.length;) {

	            assemblyId = sortedAssemblyIds[assemblyCounter];
	             
	            //console.log('[?] Assembly resistance profile:');
	            //console.dir(assemblies[assemblyId].PAARSNP_RESULT.paarResult.resistanceProfile);

	            // Create assembly resistance profile preview html
	            assemblyResistanceProfile = assemblies[assemblyId].PAARSNP_RESULT.paarResult.resistanceProfile;
	            assemblyResistanceProfileHtml = window.WGST.exports.createAssemblyResistanceProfilePreviewHtml(assemblyResistanceProfile, antibiotics);

	            // Calculate assembly top score
	            assemblyTopScore = window.WGST.exports.calculateAssemblyTopScore(assemblies[assemblyId]['FP_COMP'].scores);

	            WGST.collection[collectionId].assemblies[assemblyId]['FP_COMP'].topScore = assemblyTopScore;

	            // Get assembly latitude and longitude
	            assemblyLatitude = assemblies[assemblyId]['ASSEMBLY_METADATA'].geography.position.latitude;
	            assemblyLongitude = assemblies[assemblyId]['ASSEMBLY_METADATA'].geography.position.longitude;

	            assemblyListItemHtml = 
	                $(((assemblyCounter % 2 === 0) ? '<div class="row-stripe assembly-list-item" data-assembly-id="' + assemblies[assemblyId]['FP_COMP'].assemblyId + '">' : '<div class="assembly-list-item" data-assembly-id="' + assemblies[assemblyId]['FP_COMP'].assemblyId + '">')
	                    // + '<div class="show-on-tree-radio-button assembly-list-header-tree">'
	                    //     + '<input type="radio" data-reference-id="' + assemblyTopScore.referenceId + '" data-assembly-id="' + assemblies[assemblyId]['FP_COMP'].assemblyId + '" name="optionsRadios" value="' + assemblyTopScore.referenceId + '">'
	                    // + '</div>'
	                    + '<div class="show-on-map-checkbox assembly-list-header-map">'
	                        + '<input type="checkbox" data-reference-id="' + assemblyTopScore.referenceId + '" data-assembly-id="' + assemblies[assemblyId]['FP_COMP'].assemblyId + '" data-latitude="' + assemblyLatitude + '" data-longitude="' + assemblyLongitude + '">'
	                    + '</div>'
	                    //+ '<div class="assembly-list-generation"></div>'
	                    + '<div class="assembly-list-header-id">' + '<a href="#" class="open-assembly-button" data-assembly-id="' + assemblies[assemblyId]['FP_COMP'].assemblyId + '" title="' + assemblies[assemblyId]['ASSEMBLY_METADATA']['userAssemblyId'] + '" data-mixpanel-open-assembly-panel="' + assemblies[assemblyId]['ASSEMBLY_METADATA']['userAssemblyId'] + '">' + assemblies[assemblyId]['ASSEMBLY_METADATA']['userAssemblyId'] + '</a>' + '</div>'
	                    + '<div class="assembly-list-header-nearest-representative">' + assemblyTopScore.referenceId + ' (' + Math.round(assemblyTopScore.score.toFixed(2) * 100) + '%)</div>'
	                    //+ '<div class="assembly-list-header-nearest-representative">' + '<a href="#" class="show-on-representative-tree" data-assembly-id="' + assemblies[assemblyId]['FP_COMP'].assemblyId + '">' + assemblyTopScore.referenceId + '</a>' + ' (' + Math.round(assemblyTopScore.score.toFixed(2) * 100) + '%)</div>'
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

	        //$('.antibiotic[data-toggle="tooltip"]').tooltip();

	        // Check checkboxes
	        $('.show-on-map-checkbox input[type="checkbox"]').prop('checked', true).change();
	    };

	    window.WGST.exports.createAssemblyResistanceProfilePreviewHtml = function(assemblyResistanceProfile, antibiotics) {
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

	    var maximizeCollection = function(collectionId) {
	        console.log('[WGST] Maximizing collection ' + collectionId);

	        //
	        // Bring fullscreen into panel
	        //
	        var fullscreenId = $('.wgst-fullscreen').attr('data-fullscreen-id');
	        var panelId = fullscreenId;
	        
	        console.debug('fullscreenId: ' + fullscreenId);
	        console.debug('panelId: ' + panelId);

	        window.WGST.exports.bringFullscreenToPanel(fullscreenId);

	        //
	        // Bring panel into fullscreen
	        //
	        var panelId = 'collection-data__' + collectionId,
	        	fullscreenId = 'collection-data';

	        window.WGST.exports.bringPanelToFullscreen(panelId);

	        // Destroy all Twitter Bootstrap Tooltips
	        //$('[data-toggle="tooltip"]').tooltip('destroy');

	        // bringPanelToFullscreen('collection_' + collectionId, function(){
	        //     // Trigger Twitter Bootstrap tooltip
	        //     $('[data-toggle="tooltip"]').tooltip();
	        //     // Open Map panel
	        //     window.WGST.openPanel('map');
	        // });

	        google.maps.event.trigger(window.WGST.geo.map.canvas, 'resize');

	    };

	})();

});