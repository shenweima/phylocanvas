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

                                        //antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-fail" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                    
                                    //
                                    // Assembly is sensitive to this antibiotic (aka success)
                                    //
                                    } else if (assemblyAntibioticResistanceState === 'SENSITIVE') {

		                            	//
		                            	// Resistance: SENSITIVE
		                            	//
	                            		antibioticResistanceData = 'SENSITIVE';

                                        //antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-success" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                    
                                    //
                                    // Resistance is unknown
                                    //
                                    } else {

		                            	//
		                            	// Resistance: UNKNOWN
		                            	//
	                            		antibioticResistanceData = 'UNKNOWN';

                                        //antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                    }

	                            //
	                            // Antibiotic was not found in resistance profile for this assembly
	                            //
                                } else {

	                            	//
	                            	// Resistance: UNKNOWN
	                            	//
                            		antibioticResistanceData = 'UNKNOWN';

                                    //antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                    //console.log('>>> Assembly resistance profile has no antibiotic: ' + antibioticName);
                                }

                            //
                            // Antibiotic group was not found in resistance profile for this assembly
                            //
                            } else {

                            	//
                            	// Resistance: UNKNOWN
                            	//
                        		antibioticResistanceData = 'UNKNOWN';

                                //antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                //console.log('>>> Assembly resistance profile has no antibiotic group: ' + antibioticGroupName);
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

			var //assemblyAlleles = assembly.MLST_RESULT.alleles,
                assemblyAllele,
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

                        //locusDataHtml = locusDataHtml + '<td>' + 'None' + '</td>';
                        //alleleDataHtml = alleleDataHtml + '<td>' + assemblyAlleleName + '</td>';
                    } else {

                    	assemblyAlleleData = {
                    		locusId: assemblyAlleles[assemblyAlleleName].locusId,
                    		alleleId: assemblyAlleles[assemblyAlleleName].alleleId
                    	};

                        //locusDataHtml = locusDataHtml + '<td>' + assemblyAlleles[assemblyAlleleName].locusId + '</td>';
                        //alleleDataHtml = alleleDataHtml + '<td>' + assemblyAlleles[assemblyAlleleName].alleleId + '</td>';
                    }

                    mlstData.push(assemblyAlleleData);

                } // if
            } // for

            return mlstData;
        };

        var getAssemblyNearestRepresentativeData = function(assemblyScores) {

            var //assemblyScores = assembly['FP_COMP'].scores,
                assemblyTopScore = window.WGST.exports.calculateAssemblyTopScore(assemblyScores);

            var nearestRepresentative = assemblyTopScore.referenceId;

            return nearestRepresentative;

            //$('.wgst-panel__assembly .assembly-detail__nearest-representative .assembly-detail-content').text(assemblyTopScore.referenceId);
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

            //assemblyScoresHtml = assemblyScoresHtml.replace('{{assemblyScoresDataHtml}}', assemblyScoresDataHtml);

            //$('.wgst-panel__assembly .assembly-detail__score .assembly-detail-content').html(assemblyScoresHtml);

        };

	    window.WGST.exports.openAssemblyPanel = function(assemblyId) {

	        // ============================================================
	        // Open panel
	        // ============================================================

	        // Show animated loading circle
	        //$('.wgst-panel__assembly .wgst-panel-loading').show();

	        // activatePanel('assembly');
	        // bringPanelToTop('assembly');
	        // startPanelLoadingIndicator('assembly');
	        // showPanel('assembly');

	        // ============================================================
	        // Get assembly data
	        // ============================================================

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

	            // ============================================================
	            // Prepare assembly panel
	            // ============================================================

	            // var assembly = data.assembly,
	            //     assemblyPanel = $('.wgst-panel__assembly');

	            // Set assembly name
	            //assemblyPanel.find('.header-title small').text(assembly.ASSEMBLY_METADATA.userAssemblyId);









	            //
	            // Resistance profile
	            //
	            var antibiotics = data.antibiotics,
	            	assemblyResistanceProfile = assembly.PAARSNP_RESULT.paarResult.resistanceProfile;

	            var assemblyResistanceData = getAssemblyResistanceData(antibiotics, assemblyResistanceProfile);

	            console.debug('assemblyResistanceData:');
	            console.dir(assemblyResistanceData);

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

	            //$('.wgst-panel__assembly .assembly-detail__resistance-profile .assembly-detail-content').html($(assemblyResistanceProfileHtml));

	            // ============================================================
	            // Prepare ST type
	            // ============================================================

	            // if (assembly.MLST_RESULT.stType.length === 0) {
	            //     $('.wgst-panel__assembly .assembly-detail__st-type .assembly-detail-content').html('Not found');
	            // } else {
	            //     $('.wgst-panel__assembly .assembly-detail__st-type .assembly-detail-content').html(assembly.MLST_RESULT.stType);
	            // } 

	            // ============================================================
	            // Prepare MLST
	            // ============================================================

	            // var assemblyAlleles = assembly.MLST_RESULT.alleles,
	            //     assemblyAllele,
	            //     assemblyAlleleName,
	            //     assemblyMlstHtml =
	            //     '<table>'
	            //         + '<tbody>'
	            //             + '<tr>'
	            //                 + '<td class="row-title">Locus Id</td>'
	            //                 + '{{locusIds}}'
	            //             + '</tr>'
	            //             + '<tr>'
	            //                 + '<td class="row-title">Allele Id</td>'
	            //                 + '{{alleleIds}}'
	            //             + '</tr>'
	            //         + '</tbody>'
	            //     + '</table>',
	            //     locusDataHtml = '',
	            //     alleleDataHtml = '';

	            // console.debug('assemblyAlleles:');
	            // console.dir(assemblyAlleles);

	            // for (assemblyAlleleName in assemblyAlleles) {
	            //     if (assemblyAlleles.hasOwnProperty(assemblyAlleleName)) {
	            //         assemblyAllele = assemblyAlleles[assemblyAlleleName];
	            //         if (assemblyAllele === null) {
	            //             locusDataHtml = locusDataHtml + '<td>' + 'None' + '</td>';
	            //             alleleDataHtml = alleleDataHtml + '<td>' + assemblyAlleleName + '</td>';
	            //         } else {
	            //             locusDataHtml = locusDataHtml + '<td>' + assemblyAlleles[assemblyAlleleName].locusId + '</td>';
	            //             alleleDataHtml = alleleDataHtml + '<td>' + assemblyAlleles[assemblyAlleleName].alleleId + '</td>';
	            //         }
	            //     } // if
	            // } // for

	            // assemblyMlstHtml = assemblyMlstHtml.replace('{{locusIds}}', locusDataHtml);
	            // assemblyMlstHtml = assemblyMlstHtml.replace('{{alleleIds}}', alleleDataHtml);

	            // $('.wgst-panel__assembly .assembly-detail__mlst .assembly-detail-content').html($(assemblyMlstHtml));


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

	            console.debug('additionalTemplateContext:');
	            console.dir(additionalTemplateContext);

	            var assemblyPanelId = window.WGST.exports.createAssemblyPanel(assemblyId, additionalTemplateContext);
				
	            //
	            // Bring panel to top
	            //
				window.WGST.exports.bringPanelToTop(assemblyPanelId);
                
                //
                // Show panel
                //
                window.WGST.exports.togglePanel(assemblyPanelId);


	            // // ============================================================
	            // // Prepare nearest representative
	            // // ============================================================

	            // var assemblyScores = assembly['FP_COMP'].scores,
	            //     assemblyTopScore = calculateAssemblyTopScore(assemblyScores);

	            // $('.wgst-panel__assembly .assembly-detail__nearest-representative .assembly-detail-content').text(assemblyTopScore.referenceId);

	            // // ============================================================
	            // // Prepare scores
	            // // ============================================================

	            // var assemblyScoresHtml =
	            //     '<table>'
	            //         + '<thead>'
	            //             + '<tr>'
	            //                 + '<th>Reference Id</th>'
	            //                 + '<th>Score</th>'
	            //             + '</tr>'
	            //         + '</thead>'
	            //         + '<tbody>'
	            //             + '{{assemblyScoresDataHtml}}'
	            //         + '</tbody>'
	            //     + '</table>',
	            //     assemblyScoresDataHtml = '',
	            //     scoreText;

	            // // Sort scores
	            // var sortedAssemblyScores = Object.keys(assemblyScores).sort(function(assemblyScoreReferenceId1, assemblyScoreReferenceId2){
	            //     return assemblyScores[assemblyScoreReferenceId1] - assemblyScores[assemblyScoreReferenceId2];
	            // });

	            // var assemblyScoreCounter = sortedAssemblyScores.length;
	            // for (; assemblyScoreCounter !== 0;) {
	            //     assemblyScoreCounter = assemblyScoreCounter - 1;

	            //         var referenceId = sortedAssemblyScores[assemblyScoreCounter],
	            //             scoreData = assemblyScores[referenceId],
	            //             scoreText = scoreData.score.toFixed(2) + ' = ' + Math.round(scoreData.score * parseInt(assembly['FP_COMP']['fingerprintSize'], 10)) + '/' + assembly['FP_COMP']['fingerprintSize'];

	            //         assemblyScoresDataHtml = assemblyScoresDataHtml 
	            //             + '<tr>' 
	            //                 + '<td>' + scoreData.referenceId + '</td>'
	            //                 + '<td>' + scoreText + '</td>'
	            //             + '</tr>';
	            // } // for

	            // assemblyScoresHtml = assemblyScoresHtml.replace('{{assemblyScoresDataHtml}}', assemblyScoresDataHtml);

	            // $('.wgst-panel__assembly .assembly-detail__score .assembly-detail-content').html(assemblyScoresHtml);

	            // Hide animated loading circle
	            //$('.wgst-panel__assembly .wgst-panel-loading').hide();

	        })
	        .fail(function(jqXHR, textStatus, errorThrown) {
	            console.log('[WGST][Error] Failed to get assembly data');
	            console.error(textStatus);
	            console.error(errorThrown);
	            console.error(jqXHR);

	            showNotification(textStatus);
	        });
	    };

	})();

});