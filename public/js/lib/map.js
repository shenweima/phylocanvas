$(function(){

	(function(){

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

	        // Uncheck All Assemblies On Map checkbox
	        $('.show-all-assemblies-on-map').prop('checked', false);
	    };

	    window.WGST.exports.triggerMapMarkers = function(collectionId, selectedAssemblyIds) {

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

	})();

});