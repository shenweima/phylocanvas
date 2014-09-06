$(function(){

	(function(){

	    window.WGST.exports.populateListOfAntibiotics = function($antibioticSelectElement) {
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

	    //window.WGST.exports.showDroppedAssembly = showDroppedAssembly;
	})();

});