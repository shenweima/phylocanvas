$(function(){

	(function(){

		var openedInfoWindow;

	    var groupAssembliesByPosition = function(collectionId, assemblyIds) {
	        var assemblyIdsGroupedByPosition = {},
	            assemblies = window.WGST.collection[collectionId].assemblies,
	            assemblyId,
	            assemblyPositionLatitude,
	            assemblyPositionLongitude,
	            assemblyLatLng;

	        var counter = 0;

	        for (; counter < assemblyIds.length; counter++) {
	            assemblyId = assemblyIds[counter];
	            assemblyPositionLatitude = assemblies[assemblyId].ASSEMBLY_METADATA.geography.position.latitude;
	            assemblyPositionLongitude = assemblies[assemblyId].ASSEMBLY_METADATA.geography.position.longitude;
	            assemblyLatLng = new google.maps.LatLng(assemblyPositionLatitude, assemblyPositionLongitude);

	            if (typeof assemblyIdsGroupedByPosition[assemblyLatLng.toString()] === 'undefined') {
	                assemblyIdsGroupedByPosition[assemblyLatLng.toString()] = [];
	            }
	            
	            assemblyIdsGroupedByPosition[assemblyLatLng.toString()].push(assemblyId);
	        } // for

	        console.log('[WGST] Assembly ids grouped by position:');
	        console.dir(assemblyIdsGroupedByPosition);

	        return assemblyIdsGroupedByPosition;
	    };

	    var createGroupInfoWindow = function(groupAssemblies) {

            var templateContext = {
	            	groupAssemblies: groupAssemblies,
	            	location: groupAssemblies[0].ASSEMBLY_METADATA.geography.address
	            },
            	infoWindowTemplateSource = $('.wgst-template[data-template-id="info-window"]').html(),
                infoWindowTemplate = Handlebars.compile(infoWindowTemplateSource),
                infoWindowHtml = infoWindowTemplate(templateContext);

			var infoWindow = new google.maps.InfoWindow({
				content: '<div class="test">' + infoWindowHtml + '</div>'
			});

			return infoWindow;
	    };

	    var createGroupMarker = function(collectionId, groupAssemblies) {

	    	var groupAssemblyIds = groupAssemblies.map(function(assembly){
	    		return assembly.ASSEMBLY_METADATA.assemblyId;
	    	});

	    	var groupLatitude = groupAssemblies[0].ASSEMBLY_METADATA.geography.position.latitude,
		    	groupLongitude = groupAssemblies[0].ASSEMBLY_METADATA.geography.position.longitude;

		    var groupSize = groupAssemblies.length;

	        var markerIcon = '//chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + groupSize + '|00FFFF|000000',
	            groupPosition = new google.maps.LatLng(groupLatitude, groupLongitude),
	            groupPositionString = groupPosition.toString();

	        window.WGST.geo.map.markers.group[groupPositionString] = {
	            assemblyIds: groupAssemblyIds,
	            marker: {}
	        };

	        window.WGST.geo.map.markers.group[groupPositionString].marker = new google.maps.Marker({
	            position: groupPosition,
	            map: window.WGST.geo.map.canvas,
	            icon: markerIcon,
	            //draggable: true,
	            optimized: true // http://www.gutensite.com/Google-Maps-Custom-Markers-Cut-Off-By-Canvas-Tiles
	        });

	        //
	        // Create Info Window for a group of assermbly ids
	        //
	        var groupInfoWindow = createGroupInfoWindow(groupAssemblies);

	        //
	        // Handle marker click - open info window
	        //
			google.maps.event.addListener(window.WGST.geo.map.markers.group[groupPositionString].marker, 'click', function() {
				//
				// Close previously opened info window
				//
				if (typeof openedInfoWindow !== 'undefined') {
					openedInfoWindow.close();
				}

				//
				// Open current info window
				//
				groupInfoWindow.open(window.WGST.geo.map.canvas, window.WGST.geo.map.markers.group[groupPositionString].marker);
			
				//
				// Set current info window as opened
				// 
				openedInfoWindow = groupInfoWindow;

				//
				// Select nodes on a tree
				//
				window.WGST.collection[collectionId].tree['COLLECTION_TREE'].canvas.selectNodes(groupAssemblyIds);
			});

	        // //
	        // // Handle marker click
	        // //
	        // google.maps.event.addListener(WGST.geo.map.markers.group[groupPositionString].marker, 'click', function(e) {
	        //     // If there is only one assembly id in a group then open that assembly
	        //     if (WGST.geo.map.markers.group[groupPositionString].assemblyIds.length === 1) {
	        //         openAssemblyPanel(WGST.geo.map.markers.group[groupPositionString].assemblyIds[0]);
	        //     } else {
	        //         // Do nothing yet
	        //     }
	        // });
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

	        // Uncheck All Assemblies On Map checkbox
	        $('.show-all-assemblies-on-map').prop('checked', false);
	    };

	    window.WGST.exports.triggerMapMarkers = function(collectionId, selectedAssemblyIds) {

	        var assemblyMarkerBounds = new google.maps.LatLngBounds();

	        //
	        // Remove existing markers
	        //
	        removeAllGroupMarkers();

	        //
	        // Create new markers if there are assemblies selected
	        //
	        if (selectedAssemblyIds.length > 0) {

	        	//
	        	// Group assemblies by position
	        	//
	            var assemblyIdsGroupedByPosition = groupAssembliesByPosition(collectionId, selectedAssemblyIds);

	            var positionString,
	                positionGroup,
	                assemblies = window.WGST.collection[collectionId].assemblies,
	                assemblyId,
	                positionGroupLat,
	                positionGroupLng;

	            //
	            // Create marker for each position
	            //
	            for (positionString in assemblyIdsGroupedByPosition) {
	            	if (assemblyIdsGroupedByPosition.hasOwnProperty(positionString)) {

		        		//
		        		// Get assembly ids grouped by position
		        		//
		                var assemblyIds = assemblyIdsGroupedByPosition[positionString];

		                //
		                // Get group assemblies
		                //
		                var assembly;
	            		var groupAssemblies = [];

		                assemblyIds.map(function(assemblyId) {
		                	assembly = assemblies[assemblyId];
		                	groupAssemblies.push(assembly);
		                });

		                //
		                // Create group marker
		                //
		                createGroupMarker(collectionId, groupAssemblies);

		                //
		                // Get group latitude and longitude
		                //
		                positionGroupLat = assembly.ASSEMBLY_METADATA.geography.position.latitude;
		                positionGroupLng = assembly.ASSEMBLY_METADATA.geography.position.longitude;

		                //
		                // Extend map bounds to fit group position
		                //
		                assemblyMarkerBounds.extend(new google.maps.LatLng(positionGroupLat, positionGroupLng));
	            	}
	            } // for
	        } // if

	        if (assemblyMarkerBounds.isEmpty()) {
	            window.WGST.geo.map.canvas.setCenter(new google.maps.LatLng(48.6908333333, 9.14055555556));
	            window.WGST.geo.map.canvas.setZoom(5);
	        } else {
	            // Pan to marker bounds
	            window.WGST.geo.map.canvas.panToBounds(assemblyMarkerBounds);
	            // Set the map to fit marker bounds
	            window.WGST.geo.map.canvas.fitBounds(assemblyMarkerBounds);
	        }
	    };

	})();

});