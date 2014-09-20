$(function(){

	(function(){

        window.WGST.exports.createAssemblyPanel = function(assemblyId, additionalTemplateContext) {
            var panelId = 'assembly' + '__' + assemblyId,
                panelType = 'assembly';
                
            var templateContext = {
                panelId: panelId,
                panelType: panelType
            };

		    if (typeof additionalTemplateContext !== 'undefined') {
		        $.extend(templateContext, additionalTemplateContext);
		    }

            window.WGST.exports.createPanel(panelType, templateContext);

            return panelId;
        };

	    window.WGST.exports.calculateAssemblyTopScore = function(assemblyScores) {
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

        var getAssemblySequenceTypeData = function(sequenceTypeData) {
        	var assemblySequenceTypeData = '';

            if (sequenceTypeData.length === 0) {
            	assemblySequenceTypeData = 'Not found';
                //$('.wgst-panel__assembly .assembly-detail__st-type .assembly-detail-content').html('Not found');
            } else {
            	assemblySequenceTypeData = sequenceTypeData;
                //$('.wgst-panel__assembly .assembly-detail__st-type .assembly-detail-content').html(assembly.MLST_RESULT.stType);
            }

            return assemblySequenceTypeData;
        };

        var getAssemblyResistanceData = function(antibiotics, assemblyResistanceProfile) {

            //
            // Get predicted resistance profile
            //

			var groupResistanceData,
				antibioticResistanceData,
				assemblyResistanceData = [];

			var antibioticGroupName,
				antibioticGroup,
				antibioticName;

			var assemblyAntibioticResistanceState;

            //
            // Parse each antibiotic group
            //
            for (antibioticGroupName in antibiotics) {
                if (antibiotics.hasOwnProperty(antibioticGroupName)) {

                    antibioticGroup = antibiotics[antibioticGroupName];
					groupResistanceData = [];

                    //
                    // Parse each antibiotic
                    //
                    for (antibioticName in antibioticGroup) {
                        if (antibioticGroup.hasOwnProperty(antibioticName)) {

                        	antibioticResistanceData = '';

                            //
                            // Antibiotic group found in resistance profile for this assembly
                            //
                            if (typeof assemblyResistanceProfile[antibioticGroupName] !== 'undefined') {
                                
	                            //
	                            // Antibiotic found in resistance profile for this assembly
	                            //
                                if (typeof assemblyResistanceProfile[antibioticGroupName][antibioticName] !== 'undefined') {

                                    assemblyAntibioticResistanceState = assemblyResistanceProfile[antibioticGroupName][antibioticName].resistanceState;

                                    //
                                    // Assembly is resistant to this antibiotic (aka failure)
                                    //
                                    if (assemblyAntibioticResistanceState === 'RESISTANT') {

		                            	//
		                            	// Resistance: RESISTANT
		                            	//
	                            		antibioticResistanceData = 'RESISTANT';
                                    
                                    //
                                    // Assembly is sensitive to this antibiotic (aka success)
                                    //
                                    } else if (assemblyAntibioticResistanceState === 'SENSITIVE') {

		                            	//
		                            	// Resistance: SENSITIVE
		                            	//
	                            		antibioticResistanceData = 'SENSITIVE';
                                    
                                    //
                                    // Resistance is unknown
                                    //
                                    } else {

		                            	//
		                            	// Resistance: UNKNOWN
		                            	//
	                            		antibioticResistanceData = 'UNKNOWN';

                                    }

	                            //
	                            // Antibiotic was not found in resistance profile for this assembly
	                            //
                                } else {

	                            	//
	                            	// Resistance: UNKNOWN
	                            	//
                            		antibioticResistanceData = 'UNKNOWN';

                                }

                            //
                            // Antibiotic group was not found in resistance profile for this assembly
                            //
                            } else {

                            	//
                            	// Resistance: UNKNOWN
                            	//
                        		antibioticResistanceData = 'UNKNOWN';

                            }

                            groupResistanceData.push({
                            	antibioticName: antibioticName,
                            	antibioticResistanceData: antibioticResistanceData
                            });

                        } // if
                    } // for

                	assemblyResistanceData.push({
                		antibioticGroupName: antibioticGroupName,
                		antibioticGroupResistanceData: groupResistanceData
                	});

                } // if
            } // for

            return assemblyResistanceData;
        };

        var getMlstData = function(assemblyAlleles) {

        	var mlstData = [];

			var assemblyAllele,
                assemblyAlleleData,
                assemblyAlleleName;

            for (assemblyAlleleName in assemblyAlleles) {
                if (assemblyAlleles.hasOwnProperty(assemblyAlleleName)) {
                    assemblyAllele = assemblyAlleles[assemblyAlleleName];
                    assemblyAlleleData = {};

                    if (assemblyAllele === null) {

                    	assemblyAlleleData = {
                    		locusId: 'None',
                    		alleleId: assemblyAlleleName
                    	};

                    } else {

                    	assemblyAlleleData = {
                    		locusId: assemblyAlleles[assemblyAlleleName].locusId,
                    		alleleId: assemblyAlleles[assemblyAlleleName].alleleId
                    	};

                    }

                    mlstData.push(assemblyAlleleData);

                } // if
            } // for

            return mlstData;
        };

        var getAssemblyNearestRepresentativeData = function(assemblyScores) {

            var assemblyTopScore = window.WGST.exports.calculateAssemblyTopScore(assemblyScores);

            var nearestRepresentative = assemblyTopScore.referenceId;

            return nearestRepresentative;
        };

        var getAssemblyScoresData = function(fingerprintSize, assemblyScores) {

        	var assemblyScoresData = [];

            // Sort scores
            var sortedAssemblyScores = Object.keys(assemblyScores).sort(function(assemblyScoreReferenceId1, assemblyScoreReferenceId2){
                return assemblyScores[assemblyScoreReferenceId1] - assemblyScores[assemblyScoreReferenceId2];
            });

            var assemblyScoreCounter = sortedAssemblyScores.length;
            for (; assemblyScoreCounter !== 0;) {
                assemblyScoreCounter = assemblyScoreCounter - 1;

                var referenceId = sortedAssemblyScores[assemblyScoreCounter],
                    scoreData = assemblyScores[referenceId],
                    scoreText = scoreData.score.toFixed(2) + ' = ' + Math.round(scoreData.score * parseInt(fingerprintSize, 10)) + '/' + fingerprintSize;

                assemblyScoresData.push({
                	referenceId: scoreData.referenceId,
                	text: scoreText
                });
            } // for

            return assemblyScoresData;
        };

	    window.WGST.exports.getAssembly = function(assemblyId) {

	        // Get assembly data
	        $.ajax({
	            type: 'POST',
	            url: '/api/assembly',
	            // http://stackoverflow.com/a/9155217
	            datatype: 'json',
	            data: {
	                assemblyId: assemblyId
	            }
	        })
	        .done(function(data, textStatus, jqXHR) {
	            console.log('[WGST] Received data for assembly ' + assemblyId);
	            //console.dir(data);

	            var assembly = data.assembly,
	            	assemblyUserId = assembly.ASSEMBLY_METADATA.userAssemblyId;

	            //
	            // Resistance profile
	            //
	            var antibiotics = data.antibiotics,
	            	assemblyResistanceProfile = assembly.PAARSNP_RESULT.paarResult.resistanceProfile;

	            var assemblyResistanceData = getAssemblyResistanceData(antibiotics, assemblyResistanceProfile);

	            //
	            // Sequence type
	            //
	            var assemblySequenceType = assembly.MLST_RESULT.stType;
	            var assemblySequenceTypeData = getAssemblySequenceTypeData(assemblySequenceType);

	            console.debug('assemblySequenceTypeData:');
	            console.log(assemblySequenceTypeData);

	            //
	            // MLST
	            //
	            var assemblyAlleles = assembly.MLST_RESULT.alleles;
	            var assemblyMlstData = getMlstData(assemblyAlleles);

	            console.debug('assemblyMlstData:');
	            console.dir(assemblyMlstData);

	            //
	            // Nearest representative
	            //
	            var assemblyScores = assembly['FP_COMP'].scores;
	            var assemblyNearestRepresentativeData = getAssemblyNearestRepresentativeData(assemblyScores);

	            console.debug('assemblyNearestRepresentativeData:');
	            console.dir(assemblyNearestRepresentativeData);

	            //
	            // Scores
	            //
	            var fingerprintSize = assembly['FP_COMP']['fingerprintSize'];
	            var assemblyScoresData = getAssemblyScoresData(fingerprintSize, assemblyScores);

	            console.debug('assemblyScoresData:');
	            console.dir(assemblyScoresData);

	            //
	            // Create assembly panel
	            //
	            var additionalTemplateContext = {
	            	assemblyUserId: assemblyUserId,
	            	antibioticResistanceData: assemblyResistanceData,
	            	sequenceTypeData: assemblySequenceTypeData,
	            	mlstData: assemblyMlstData,
	            	nearestRepresentativeData: assemblyNearestRepresentativeData,
	            	scoresData: assemblyScoresData
	            };

	            var assemblyPanelId = window.WGST.exports.createAssemblyPanel(assemblyId, additionalTemplateContext);
				
	            //
	            // Bring panel to top
	            //
				window.WGST.exports.bringPanelToFront(assemblyPanelId);
                
                //
                // Show panel
                //
                window.WGST.exports.showPanel(assemblyPanelId);

	        })
	        .fail(function(jqXHR, textStatus, errorThrown) {
	            console.log('[WGST][Error] Failed to get assembly data');
	            console.error(textStatus);
	            console.error(errorThrown);
	            console.error(jqXHR);

	            //showNotification(textStatus);
	        });
	    };

	})();

});