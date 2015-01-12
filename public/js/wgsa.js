$(function(){

	(function(){

        window.WGST.exports.createAssemblyPanel = function(assemblyId, additionalTemplateContext) {
            var panelId = 'assembly' + '__' + assemblyId,
                panelType = 'assembly';
                
            var templateContext = {
                panelId: panelId,
                panelType: panelType,
                assemblyId: assemblyId
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

            var antibioticClassName,
                antibioticClass,
                antibioticName;

            var assemblyAntibioticResistanceState;

            //
            // Parse each antibiotic group
            //
            for (antibioticClassName in antibiotics) {
                if (antibiotics.hasOwnProperty(antibioticClassName)) {

                    antibioticClass = antibiotics[antibioticClassName];
                    groupResistanceData = [];

                    //
                    // Parse each antibiotic
                    //
                    for (antibioticName in antibioticClass) {
                        if (antibioticClass.hasOwnProperty(antibioticName)) {

                            antibioticResistanceData = '';

                            //
                            // Antibiotic group found in resistance profile for this assembly
                            //
                            if (typeof assemblyResistanceProfile[antibioticClassName] !== 'undefined') {
                                
                                //
                                // Antibiotic found in resistance profile for this assembly
                                //
                                if (typeof assemblyResistanceProfile[antibioticClassName][antibioticName] !== 'undefined') {

                                    //assemblyAntibioticResistanceState = assemblyResistanceProfile[antibioticClassName][antibioticName].resistanceState;
                                    assemblyAntibioticResistanceState = assemblyResistanceProfile[antibioticClassName][antibioticName];

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
                        antibioticClassName: antibioticClassName,
                        antibioticClassResistanceData: groupResistanceData
                    });

                } // if
            } // for

            return assemblyResistanceData;
        };

        var __deprecated__getAssemblyResistanceData = function(antibiotics, assemblyResistanceProfile) {

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

        window.WGST.exports.getAssemblyData = function(assemblyId, callback) {

            console.log('[WGST] Getting assembly ' + assemblyId + ' data');

            //
            // Get assembly data
            //
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

                callback({
                    assembly: data.assembly,
                    antibiotics: data.antibiotics
                }, null);
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                callback(null, textStatus);

                // console.error('[WGST][Error] Failed to get assembly data');
                // console.error(textStatus);
                // console.error(errorThrown);
                // console.error(jqXHR);
            });
        };

        window.WGST.exports.prepareAssemblyDataForRendering = function(assembly, antibiotics) {

            console.debug('[WGST] Received assembly object:');
            console.dir(assembly);

            console.log('[WGST] Parsing assembly ' + assembly.assemblyId + ' data');

            var preparedAssemblyData = {
                metadata: {}
            };

            //
            // User assembly id
            //
            var //assembly = data.assembly,
                assemblyUserId = assembly.ASSEMBLY_METADATA.userAssemblyId;

            preparedAssemblyData.assemblyUserId = assemblyUserId;

            //
            // Resistance profile
            //
            //var assemblyResistanceProfile = assembly.PAARSNP_RESULT.paarResult.resistanceProfile;
            var assemblyResistanceProfile = assembly.PAARSNP_RESULT.resistanceProfile;
            var assemblyResistanceData = getAssemblyResistanceData(antibiotics, assemblyResistanceProfile);

            preparedAssemblyData.resistanceProfile = assemblyResistanceData;

            //
            // Sequence type
            //
            var assemblySequenceType = assembly.MLST_RESULT.stType;
            var assemblySequenceTypeData = getAssemblySequenceTypeData(assemblySequenceType);

            preparedAssemblyData.sequenceType = assemblySequenceTypeData;

            console.debug('assemblySequenceTypeData:');
            console.log(assemblySequenceTypeData);

            //
            // MLST
            //
            var assemblyAlleles = assembly.MLST_RESULT.alleles;
            var assemblyMlstData = getMlstData(assemblyAlleles);

            preparedAssemblyData.mlst = assemblyMlstData;

            console.debug('assemblyMlstData:');
            console.dir(assemblyMlstData);

            //
            // Nearest representative
            //
            var assemblyScores = assembly['FP_COMP'].scores;
            var assemblyNearestRepresentativeData = getAssemblyNearestRepresentativeData(assemblyScores);

            preparedAssemblyData.nearestRepresentative = assemblyNearestRepresentativeData;

            console.debug('assemblyNearestRepresentativeData:');
            console.dir(assemblyNearestRepresentativeData);

            //
            // Scores
            //
            var fingerprintSize = assembly['FP_COMP']['fingerprintSize'];
            var assemblyScoresData = getAssemblyScoresData(fingerprintSize, assemblyScores);

            preparedAssemblyData.scores = assemblyScoresData;

            console.debug('assemblyScoresData:');
            console.dir(assemblyScoresData);

            //
            // Top score
            //
            var assemblyTopScore = window.WGST.exports.calculateAssemblyTopScore(assemblyScores);

            preparedAssemblyData.topScore = assemblyTopScore;

            //
            // Top score percentage
            //
            preparedAssemblyData.topScorePercentage = Math.round(assemblyTopScore.score.toFixed(2) * 100);

            //
            // Metadata
            //

            //
            // Geography
            //
            preparedAssemblyData.metadata.latitude = assembly['ASSEMBLY_METADATA'].geography.position.latitude;
            preparedAssemblyData.metadata.longitude = assembly['ASSEMBLY_METADATA'].geography.position.longitude;

            return preparedAssemblyData;
        };

        window.WGST.exports.getAssembly = function(assemblyId) {

            window.WGST.exports.getAssemblyData(assemblyId, function(data, error){

                if (error) {
                    console.error('[WGST][Error] Failed to get assembly data: ' + error);
                    return;
                }

                console.debug('[WGST] Got assembly ' + assemblyId + ' data:');
                console.dir(data);

                var preparedForRenderingAssemblyData = window.WGST.exports.prepareAssemblyDataForRendering(data.assembly, data.antibiotics);

                //
                // Create assembly panel
                //
                var additionalTemplateContext = {
                    assemblyUserId: preparedForRenderingAssemblyData.assemblyUserId,
                    antibioticResistanceData: preparedForRenderingAssemblyData.resistanceProfile,
                    sequenceTypeData: preparedForRenderingAssemblyData.sequenceType,
                    mlstData: preparedForRenderingAssemblyData.mlst,
                    nearestRepresentativeData: preparedForRenderingAssemblyData.nearestRepresentative,
                    scoresData: preparedForRenderingAssemblyData.scores
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
            });
        };

	    window.WGST.exports.__old_remove__getAssembly = function(assemblyId) {

            console.log('[WGST] Getting assembly ' + assemblyId);

            //
	        // Get assembly data
            //
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
	            console.error('[WGST][Error] Failed to get assembly data');
	            console.error(textStatus);
	            console.error(errorThrown);
	            console.error(jqXHR);

	            //showNotification(textStatus);
	        });
	    };

	})();

});
$(function(){

    //
    // Download assembly metadata in JSON format
    //
    $('body').on('click', '[data-wgst-download-assembly-metadata-json]', function(event) {
        console.debug('[WGST] Downloading assembly metadata in JSON format');
    });

    //
    // Download assembly metadata in CSV format
    //
    $('body').on('click', '[data-wgst-download-assembly-metadata-csv]', function() {
        console.debug('[WGST] Downloading assembly metadata in CSV format');
    });

});
$(function(){

	(function(){

		window.WGST.exports.showAssemblyUploadAnalytics = function(assemblyFileId) {
			$('.wgst-panel__assembly-upload-analytics .wgst-upload-assembly__analytics').addClass('wgst--hide-this');
			$('.wgst-panel__assembly-upload-analytics .wgst-upload-assembly__analytics[data-assembly-file-id="' + assemblyFileId + '"]').removeClass('wgst--hide-this');

			//
			// Set file name in panel's header
			//
			$('.wgst-panel__assembly-upload-analytics header').find('small').text(assemblyFileId);
		};

	})();

});
$(function(){

	(function(){

		window.WGST.exports.showAssemblyUploadMetadata = function(assemblyFileId) {
			$('.wgst-panel__assembly-upload-metadata .wgst-upload-assembly__metadata').addClass('wgst--hide-this');
			$('.wgst-panel__assembly-upload-metadata .wgst-upload-assembly__metadata[data-assembly-file-id="' + assemblyFileId + '"]').removeClass('wgst--hide-this');
		
			//
			// Set file name in panel's header
			//
			$('.wgst-panel__assembly-upload-metadata header').find('small').text(assemblyFileId);
		};

	    $('body').on('change', '.wgst-assembly-upload__metadata .assembly-timestamp-input', function(){

	        var $select = $(this),
	        	assemblyFileId = $select.attr('data-assembly-file-id'),
	            //fileId = $select.attr('data-file-id'),
	            //fileName = $select.attr('data-file-name'),
	            selectedYear = $('.assembly-timestamp-input-year[data-assembly-file-id="' + assemblyFileId +'"]').val(),
	            selectedMonth = $('.assembly-timestamp-input-month[data-assembly-file-id="' + assemblyFileId +'"]').val(),
	            $timestampDaySelect = $('.assembly-timestamp-input-day[data-assembly-file-id="' + assemblyFileId +'"]'),
	            selectedDay = $timestampDaySelect.val(),
	            timestampPart = $select.attr('data-timestamp-input');

	        // ----------------------------------------------------
	        // Create list of days
	        // ----------------------------------------------------
	        if (timestampPart === 'year' || timestampPart === 'month') {
	            // If year and month selected then populate days select
	            if (selectedYear !== '-1' && selectedMonth !== '-1') {
	                window.WGST.exports.populateDaySelect($timestampDaySelect, selectedYear, selectedMonth);
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
	            $('.assembly-metadata-timestamp-month[data-assembly-file-id="' + assemblyFileId + '"]').removeClass('wgst--hide-this');
	        } else if (timestampPart === 'month') {
	            $('.assembly-metadata-timestamp-day[data-assembly-file-id="' + assemblyFileId + '"]').removeClass('wgst--hide-this');
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

	            //
	            // Update metadata store
	            //
	            //window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata = window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata || {};
	            //window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.datetime = date;
	            window.WGST.exports.setAssemblyUploadMetadataModel(assemblyFileId, 'datetime', date);

	            //WGST.upload.assembly[fileName].metadata = WGST.upload.assembly[fileName].metadata || {};
	            //WGST.upload.assembly[fileName].metadata.datetime = date; 
	        } // if

	        // ---------------------------------------------------------------
	        // Show next assembly metadata block if at least year is provided
	        // ---------------------------------------------------------------
	        if (selectedYear !== '-1') {

	        	showNextMetadataBlock($select);

	        } // if

	        window.WGST.exports.updateMetadataProgressBar();
	    });

	    window.WGST.exports.updateMetadataProgressBar = function() {
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

	    window.WGST.exports.initAssemblyMetadataLocation = function(assemblyFileId) {

			//
			// Init location metadata input
			//			

			//
            // Get autocomplete input (jQuery) element
            //
            var autocompleteInput = $('.wgst-assembly-upload__metadata li[data-assembly-file-id="' + assemblyFileId + '"] .assembly-sample-location-input')[0];

            //
            // Init Goolge Maps API Places SearchBox
            //
            window.WGST.geo.placeSearchBox[assemblyFileId] = new google.maps.places.SearchBox(autocompleteInput, {
                bounds: window.WGST.geo.map.searchBoxBounds
            });

            //
            //
            // When user selects an address from the dropdown, get geo coordinates
            // https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform
            // TO DO: Remove this event listener after metadata was sent
            // http://rawgit.com/klokan/8408394/raw/5ab795fb36c67ad73c215269f61c7648633ae53e/places-enter-first-item.html
            //
            //
            google.maps.event.addListener(window.WGST.geo.placeSearchBox[assemblyFileId], 'places_changed', function() {
            	window.WGST.exports.handlePlacesChanged(assemblyFileId);
            });
	    };

	    window.WGST.exports.handlePlacesChanged = function(assemblyFileId) {

	    	console.debug('Debug: ' + $('.assembly-sample-location-input[data-assembly-file-id="' + assemblyFileId + '"]').length);

            // Get the place details from the autocomplete object.
            var places = WGST.geo.placeSearchBox[assemblyFileId].getPlaces(),
                place = places[0];

            if (typeof place === 'undefined' || typeof place.geometry === 'undefined') {
            	console.error('[WGST] No place or geometry');
                console.dir(WGST.geo.placeSearchBox[assemblyFileId]);
                return;
            }

            // If the place has a geometry, then present it on a map
            var latitude = place.geometry.location.lat(),
                longitude = place.geometry.location.lng(),
                formattedAddress = place.formatted_address;

            console.log('[WGST] Google Places API first SearchBox place: ' + formattedAddress);

            // ------------------------------------------
            // Update metadata form
            // ------------------------------------------
            var $currentInputElement = $('.assembly-sample-location-input[data-assembly-file-id="' + assemblyFileId + '"]');

            // Show next form block if current input has some value
            if ($currentInputElement.val().length > 0) {

            	showNextMetadataBlock($currentInputElement);

                // Show next metadata form block
                //currentInputElement.closest('.form-block').next('.form-block').fadeIn();

                // Scroll to the next form block
                //currentInputElement.closest('.assembly-metadata').animate({scrollTop: currentInputElement.closest('.assembly-metadata').height()}, 400);
            } // if

            // Increment metadata progress bar
            //window.WGST.exports.updateMetadataProgressBar();
            
            // Replace whatever user typed into this input box with formatted address returned by Google
            $currentInputElement.blur().val(formattedAddress);

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
            // window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata = window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata || {};
            // window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography = {
            //     address: formattedAddress,
            //     position: {
            //         latitude: latitude,
            //         longitude: longitude
            //     },
            //     // https://developers.google.com/maps/documentation/geocoding/#Types
            //     type: place.types[0]
            // };
	        window.WGST.exports.setAssemblyUploadMetadataModel(assemblyFileId, 'geography', {
                address: formattedAddress,
                position: {
                    latitude: latitude,
                    longitude: longitude
                },
                // https://developers.google.com/maps/documentation/geocoding/#Types
                type: place.types[0]
            });

            window.WGST.exports.updateMetadataProgressBar();
	    };

	    //
	    // On change store source metadata
	    //
        $('body').on('change', '.assembly-sample-source-input', function(){

        	var assemblyFileId = $(this).attr('data-assembly-file-id'),
        		$select = $(this);

            //
            // Update metadata store
            //
            // window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata = window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata || {};
            // window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.source = $(this).val();
            window.WGST.exports.setAssemblyUploadMetadataModel(assemblyFileId, 'source', $(this).val());

            window.WGST.exports.updateMetadataProgressBar();

            showNextMetadataBlock($select);

        });

	    $('body').on('click', '[data-wgst-copy-metadata-to-all-empty-assemblies]', function() {
	        //
	        // Copy same metadata to all assemblies with no metadata
	        //
	        var $sourceAssemblyMetadata = $(this).closest('.wgst-upload-assembly__metadata'),
	            $sourceAssemblyMetadataLocation = $sourceAssemblyMetadata.find('.assembly-sample-location-input'),
	            $sourceAssemblyMetadataSource = $sourceAssemblyMetadata.find('.assembly-sample-source-input');

	        var assemblyFileId = $sourceAssemblyMetadata.attr('data-assembly-file-id');

	        window.WGST.exports.copyAssemblyMetadataToAssembliesWithNoMetadata(assemblyFileId);

	        //
	        // Show all metadata input elements
	        //
	        $('.wgst-assembly-metadata-block').show();

	        window.WGST.exports.updateMetadataProgressBar();
	    });

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

		var showNextMetadataBlock = function($currentInputElement) {
            //
            // Show next metadata form block
            //
            $currentInputElement.closest('.wgst-assembly-metadata-block').next('.wgst-assembly-metadata-block').removeClass('wgst--hide-this');
            
            //
            // Scroll to the next form block
			//
			$currentInputElement.closest('.wgst-upload-assembly__metadata .assembly-metadata').animate({
				scrollTop: $currentInputElement.closest('.wgst-assembly-metadata-block').next('.wgst-assembly-metadata-block').offset().top
			}, 'fast');
		};

        window.WGST.exports.setAssemblyUploadMetadataModel = function(assemblyFileId, metadataName, metadataModel) {
        	window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata = window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata || {};
        	window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata[metadataName] = metadataModel;
        };

        window.WGST.exports.getAssemblyUploadMetadataModel = function(assemblyFileId, metadataName) {
        	return window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata[metadataName];
        };

     //    //
     //    //
     //    //
     //    // Datetime
     //    //
     //    //
     //    //

	    // var getTotalNumberOfDaysInMonth = function(year, month) {
	    //     // http://www.dzone.com/snippets/determining-number-days-month
	    //     return 32 - new Date(year, month, 32).getDate();
	    // };

	    // var populateDaySelect = function($selectElement, selectedYear, selectedMonth) {
	    // 	//
	    //     // Remove previous list of days and append a new one
	    //     //
	    //     $selectElement
	    //     	.html('')
	    //         .append($('<option value="-1">Choose day</option>'))
	    //         .append(generateDayHtmlElements(selectedYear, selectedMonth));
	    // };

	    // var generateYearHtmlElements = function(startYear, endYear) {
	    //     var yearCounter = endYear,
	    //         yearElementTemplate = '<option value="{{year}}">{{year}}</option>',
	    //         yearElements = '',
	    //         yearElement;

	    //     for (; yearCounter !== startYear - 1;) {
	    //         yearElement = yearElementTemplate.replace(/{{year}}/g, yearCounter);
	    //         yearElements = yearElements + yearElement;
	    //         yearCounter = yearCounter - 1;
	    //     } // for

	    //     return yearElements;
	    // };

	    // window.WGST.exports.generateYears = function(startYear, endYear) {
	    //     var years = [],
	    //         yearCounter = endYear;

	    //     for (; yearCounter !== startYear - 1;) {
	    //         years.push(yearCounter);
	    //         yearCounter = yearCounter - 1;
	    //     }

	    //     return years;
	    // };

	    // var generateMonthHtmlElements = function() {
	    //     var monthCounter = 0,
	    //         listOfMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	    //         monthElementTemplate = '<option value="{{monthCounter}}">{{month}}</option>',
	    //         monthElements = '',
	    //         monthElement;

	    //     for (; monthCounter < listOfMonths.length;) {
	    //         monthElement = monthElementTemplate.replace(/{{month}}/g, listOfMonths[monthCounter]);
	    //         monthElement = monthElement.replace(/{{monthCounter}}/g, monthCounter);
	    //         monthElements = monthElements + monthElement;
	    //         monthCounter = monthCounter + 1;
	    //     } // for

	    //     return monthElements;
	    // };

	    // window.WGST.exports.generateMonths = function() {
	    //     var listOfMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	    //         monthCounter = 0;

	    //     listOfMonths = listOfMonths.map(function(monthName, index, array){
	    //         return {
	    //             name: monthName,
	    //             number: index
	    //         }
	    //     });

	    //     return listOfMonths;
	    // };

	    // var generateDayHtmlElements = function(year, month) {

	    //     if (typeof year === 'undefined' || typeof month === 'undefined') {
	    //         return '';
	    //     }

	    //     var totalNumberOfDays = getTotalNumberOfDaysInMonth(year, month),
	    //         dayCounter = 0,
	    //         dayElementTemplate = '<option value="{{day}}">{{day}}</option>',
	    //         dayElements = '',
	    //         dayElement;

	    //     while (dayCounter < totalNumberOfDays) {
	    //         dayCounter = dayCounter + 1;
	    //         dayElement = dayElementTemplate.replace(/{{day}}/g, dayCounter);
	    //         dayElements = dayElements + dayElement;
	    //     }

	    //     return dayElements;
	    // };

	    // window.WGST.exports.generateDays = function(year, month) {

	    //     if (typeof year === 'undefined' || typeof month === 'undefined') {
	    //         return '';
	    //     }

	    //     var days = [],
	    //         totalNumberOfDays = getTotalNumberOfDaysInMonth(year, month),
	    //         dayCounter = 0;

	    //     while (dayCounter < totalNumberOfDays) {
	    //         dayCounter = dayCounter + 1;
	    //         days.push(dayCounter);
	    //     }

	    //     return days;
	    // };

	    // var copyAssemblyMetadataTimestamp = function(sourceAssemblyFileId, targetAssemblyFileId) {

	    //     if (sourceAssemblyFileId === targetAssemblyFileId) {
	    //         return;
	    //     }

	    //     var $sourceTimestampYearHtml = $('.assembly-metadata-timestamp-year[data-assembly-file-id="' + sourceAssemblyFileId + '"]'),
	    //         sourceTimestampYearValue = $sourceTimestampYearHtml.find('select option:selected').val(),

	    //         $sourceTimestampMonthHtml = $('.assembly-metadata-timestamp-month[data-assembly-file-id="' + sourceAssemblyFileId + '"]'),
	    //         sourceTimestampMonthValue = $sourceTimestampMonthHtml.find('select option:selected').val(),

	    //         $sourceTimestampDayHtml = $('.assembly-metadata-timestamp-day[data-assembly-file-id="' + sourceAssemblyFileId + '"]'),
	    //         sourceTimestampDayValue = $sourceTimestampDayHtml.find('select option:selected').val(),

	    //         $targetTimestampYearHtml = $('.assembly-metadata-timestamp-year[data-assembly-file-id="' + targetAssemblyFileId + '"]'),
	    //         $targetTimestampMonthHtml = $('.assembly-metadata-timestamp-month[data-assembly-file-id="' + targetAssemblyFileId + '"]'),
	    //         $targetTimestampDayHtml = $('.assembly-metadata-timestamp-day[data-assembly-file-id="' + targetAssemblyFileId + '"]'),
	            
	    //         $targetTimestampDaySelect = $targetTimestampDayHtml.find('select');

	    //     // ---------------------------------------------------------
	    //     // Sync state between source and target input elements
	    //     // ---------------------------------------------------------
	    //     if (sourceTimestampYearValue !== '-1') {
	    //         // Select year option
	    //         $targetTimestampYearHtml.find('option[value="' + sourceTimestampYearValue + '"]').prop('selected', true);
	    //     }
	    //     if (sourceTimestampMonthValue !== '-1') {
	    //         // Select month option
	    //         $targetTimestampMonthHtml.find('option[value="' + sourceTimestampMonthValue + '"]').prop('selected', true);
	    //     }
	    //     if (sourceTimestampDayValue !== '-1') {
	    //         populateDaySelect($targetTimestampDaySelect, sourceTimestampYearValue, sourceTimestampMonthValue);
	    //         // Select day option
	    //         $targetTimestampDaySelect.find('option[value="' + sourceTimestampDayValue + '"]').prop('selected', true);
	    //     }
	    //     // Show timestamp parts
	    //     if ($sourceTimestampYearHtml.is(':visible')) {
	    //         $targetTimestampYearHtml.removeClass('wgst--hide-this');
	    //     }
	    //     if ($sourceTimestampMonthHtml.is(':visible')) {
	    //         $targetTimestampMonthHtml.removeClass('wgst--hide-this');
	    //     }
	    //     if ($sourceTimestampDayHtml.is(':visible')) {
	    //         $targetTimestampDayHtml.removeClass('wgst--hide-this');
	    //     }
	    // };

	})();

});
$(function(){

	(function(){

	    $('body').on('change', '.wgst-dropped-assembly-list', function(){
	    	var selectedAssemblyFileId = $(this).val();
	    	window.WGST.exports.showAssemblyUpload(selectedAssemblyFileId);
	    });

	    $('body').on('click', '[data-wgst-dropped-assembly-list-navigation-button="previous"]', function(){
	    	window.WGST.exports.showPreviousAssemblyUpload();
	    });

	    $('body').on('click', '[data-wgst-dropped-assembly-list-navigation-button="next"]', function(){
	    	window.WGST.exports.showNextAssemblyUpload();
	    });

	    window.WGST.exports.showPreviousAssemblyUpload = function() {
	       	var $previousOption = $('.wgst-dropped-assembly-list option:selected').prev();
	        if ($previousOption.length > 0) {
	        	$previousOption.prop('selected', 'selected').change();
	        }
	    };

	    window.WGST.exports.showNextAssemblyUpload = function() {
	        var $nextOption = $('.wgst-dropped-assembly-list option:selected').next();
	        if ($nextOption.length > 0) {
	        	$nextOption.prop('selected', 'selected').change();
	        }
	    };

	    window.WGST.exports.showAssemblyUpload = function(assemblyFileId) {

	    	if (typeof assemblyFileId === 'undefined') {
	    		return false;
	    	}

	    	console.log('*** assemblyFileId: ' + assemblyFileId);

	    	window.WGST.exports.showAssemblyUploadAnalytics(assemblyFileId);
	    	window.WGST.exports.showAssemblyUploadMetadata(assemblyFileId);



	        // $('.wgst-upload-assembly__analytics').hide();
	        // $('.wgst-upload-assembly__analytics[data-file-uid="' + assemblyFileId + '"]').show();
	        // $('.wgst-upload-assembly__metadata').hide();
	        // $('.wgst-upload-assembly__metadata[data-file-uid="' + assemblyFileId + '"]').show();

	        //
	        // Quite an elegant way of finding object by it's property value in array
	        //
	        // var loadedFile = window.WGST.dragAndDrop.loadedFiles.filter(function(loadedFile) {
	        //     return loadedFile.uid === assemblyFileId; // filter out appropriate one
	        // })[0];

	        // // Set file name in metadata panel title
	        // $('.wgst-panel__assembly-upload-metadata .header-title small').text(loadedFile.file.name);

	        // // Set file name in analytics panel title
	        // $('.wgst-panel__assembly-upload-analytics .header-title small').text(loadedFile.file.name);
	    
	        // // Set file name in navigator
	        // $('.assembly-file-name').text(loadedFile.file.name);
	    };

	})();

});
$(function(){

	(function(){

    	var GET_COLLECTION_ID_TIMER = 2000;

	    $('body').on('click', '.assemblies-upload-ready-button', function() {
	        console.log('[WGST] Getting ready to upload assemblies and metadata');

	        // Reset panels
	        //resetPanelAssemblyUploadMetadata();
	        //resetPanelAssemblyUploadProgress();

	        // Disable upload button
	        //$(this).attr('disabled','disabled');

	        // Remove metadata marker
	        window.WGST.geo.map.markers.metadata.setMap(null);

            //
            // Remove assembly upload panels
            //
	        window.WGST.exports.removePanel('assembly-upload-navigation');
	        window.WGST.exports.removePanel('assembly-upload-metadata');
	        window.WGST.exports.removePanel('assembly-upload-analytics');

            //
            // Remove map fullscreen
            //
            window.WGST.exports.removeFullscreen('collection-map');

            //
            // Remove hidable
            //
            window.WGST.exports.removeHidable('collection-map');

	        //deactivatePanel(['assemblyUploadNavigator', 'assemblyUploadAnalytics', 'assemblyUploadMetadata']);


	        WGST.dragAndDrop.files = [];

	        var userAssemblyId,
	            assembltUploadProgressTemplate,
	            assemblyUploadProgressHtml;

	        var assemblyFileId;

	        // Post each fasta file separately
	        //for (userAssemblyId in fastaFilesAndMetadata) {
	        // for (assemblyFileId in window.WGST.upload.fastaAndMetadata) {
	        //     //if (fastaFilesAndMetadata.hasOwnProperty(userAssemblyId)) {
	        //     if (window.WGST.upload.fastaAndMetadata.hasOwnProperty(assemblyFileId)) {

	        //         assembltUploadProgressTemplate =
	        //         '<tr data-assembly-id="{{userAssemblyId}}">'
	        //             + '<td class="assembly-upload-name">{{userAssemblyId}}</td>'
	        //             + '<td class="assembly-upload-progress">'
	        //                 + '<div class="progress progress-striped active">'
	        //                   + '<div class="progress-bar progress-bar-info"  role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">'
	        //                   + '</div>'
	        //                 + '</div>'
	        //             + '</td>'
	        //             + '<td class="assembly-upload-result assembly-upload-uploaded"><span class="glyphicon glyphicon-record"></span></td>'
	        //             + '<td class="assembly-upload-result assembly-upload-result-mlst"><span class="glyphicon glyphicon-record"></span></td>'
	        //             + '<td class="assembly-upload-result assembly-upload-result-fp-comp"><span class="glyphicon glyphicon-record"></span></td>'
	        //             + '<td class="assembly-upload-result assembly-upload-result-paarsnp"><span class="glyphicon glyphicon-record"></span></td>'
	        //             + '<td class="assembly-upload-result assembly-upload-result-core"><span class="glyphicon glyphicon-record"></span></td>'
	        //         + '</tr>';

	        //         assemblyUploadProgressHtml = assembltUploadProgressTemplate.replace(/{{userAssemblyId}}/g, userAssemblyId);

	        //         // Append assembly upload progress row
	        //         $('.assembly-list-upload-progress tbody').append(assemblyUploadProgressHtml);
	        //     } // if
	        // } // for

            






            //
            // Show uploading background
            //
            window.WGST.exports.showBackground('uploading');









	        // //
	        // // Create panel
	        // //
	        // var totalNumberOfAssembliesUploading = Object.keys(window.WGST.upload.fastaAndMetadata).length;

	        // window.WGST.exports.createPanel('assembly-upload-progress', {
	        // 	panelId: 'assembly-upload-progress',
         //        panelType: 'assembly-upload-progress',
	        // 	assemblyFileIds: Object.keys(window.WGST.upload.fastaAndMetadata),
	        // 	totalNumberOfAssembliesUploading: totalNumberOfAssembliesUploading
	        // });

         //    //
         //    // Show panel
         //    //
         //    window.WGST.exports.showPanel('assembly-upload-progress');







	        var collectionId = '';

            setTimeout(function(){
                // Get collection id
                $.ajax({
                    type: 'POST',
                    url: '/collection/add/',
                    datatype: 'json', // http://stackoverflow.com/a/9155217
                    data: {
                        collectionId: collectionId,
                        userAssemblyIds: Object.keys(window.WGST.upload.fastaAndMetadata)
                    }
                })
                .done(function(collectionIdData, textStatus, jqXHR) {

                    // //
                    // // Create panel
                    // //
                    // var totalNumberOfAssembliesUploading = Object.keys(window.WGST.upload.fastaAndMetadata).length;

                    // window.WGST.exports.createPanel('assembly-upload-progress', {
                    //     panelId: 'assembly-upload-progress',
                    //     panelType: 'assembly-upload-progress',
                    //     assemblyFileIds: Object.keys(window.WGST.upload.fastaAndMetadata),
                    //     totalNumberOfAssembliesUploading: totalNumberOfAssembliesUploading
                    // });

                    // //
                    // // Show panel
                    // //
                    // window.WGST.exports.showPanel('assembly-upload-progress');

                    // //
                    // // Hide uploading background
                    // //
                    // window.WGST.exports.hideBackground('uploading');





                    var collectionId = collectionIdData.collectionId,
                    	mapAssemblyIdToUserAssemblyId = collectionIdData.userAssemblyIdToAssemblyIdMap,
                        //userAssemblyIdToAssemblyIdMap = collectionIdData.userAssemblyIdToAssemblyIdMap,
                        assemblyId;

                    console.debug('mapAssemblyIdToUserAssemblyId:');
                    console.dir(mapAssemblyIdToUserAssemblyId);

                    WGST.upload.collection[collectionId] = {};
                    WGST.upload.collection[collectionId].notifications = {
                        assembly: {},
                        all: {},
                        tree: false
                    };

                    //
                    // Add assembly id
                    //
                    var fastaAndMetadataWithAssemblyId = [];

                    $.each(mapAssemblyIdToUserAssemblyId, function(assemblyId){

                    	var userAssemblyId = mapAssemblyIdToUserAssemblyId[assemblyId];

                        if (typeof window.WGST.upload.fastaAndMetadata[userAssemblyId] !== 'undefined') {
                            //fastaFilesAndMetadataWithUpdatedIds[assemblyId] = fastaFilesAndMetadata[userAssemblyId];

                            fastaAndMetadataWithAssemblyId.push([collectionId, assemblyId, window.WGST.upload.fastaAndMetadata[userAssemblyId]]);
                            
                            //sortedFastaFilesAndMetadataWithUpdatedIds.push([collectionId, assemblyId, fastaFilesAndMetadata[userAssemblyId]]);
                        }


                        console.log('==============================================');
                        console.dir(fastaAndMetadataWithAssemblyId);
                        console.log(assemblyId);

                        // var userAssemblyId = userAssemblyIdToAssemblyIdMap[assemblyId];

                        // if (typeof fastaFilesAndMetadata[userAssemblyId] !== 'undefined') {
                        //     //fastaFilesAndMetadataWithUpdatedIds[assemblyId] = fastaFilesAndMetadata[userAssemblyId];
                        //     sortedFastaFilesAndMetadataWithUpdatedIds.push([collectionId, assemblyId, fastaFilesAndMetadata[userAssemblyId]]);
                        // }
                    });







                    // //
                    // // Add user assembly id
                    // //
                    // var sortedFastaFilesAndMetadataWithUpdatedIds = [];

                    // $.each(userAssemblyIdToAssemblyIdMap, function(assemblyId){
                    //     console.log('==============================================');
                    //     console.dir(userAssemblyIdToAssemblyIdMap);
                    //     console.log(assemblyId);

                    //     var userAssemblyId = userAssemblyIdToAssemblyIdMap[assemblyId];

                    //     if (typeof fastaFilesAndMetadata[userAssemblyId] !== 'undefined') {
                    //         //fastaFilesAndMetadataWithUpdatedIds[assemblyId] = fastaFilesAndMetadata[userAssemblyId];
                    //         sortedFastaFilesAndMetadataWithUpdatedIds.push([collectionId, assemblyId, fastaFilesAndMetadata[userAssemblyId]]);
                    //     }
                    // });


                    // //WGST.upload.collection[collectionId].notifications.all = {};
                    // //WGST.upload.collection[collectionId].notifications.tree = false; // Have you received at least 1 COLLECTION_TREE notification

                    // // Replace user assembly id (fasta file name) with assembly id generated on server side
                    // //var fastaFilesAndMetadataWithUpdatedIds = {};
                    // var sortedFastaFilesAndMetadataWithUpdatedIds = [];
                    // $.each(userAssemblyIdToAssemblyIdMap, function(assemblyId){
                    //     console.log('==============================================');
                    //     console.dir(userAssemblyIdToAssemblyIdMap);
                    //     console.log(assemblyId);

                    //     var userAssemblyId = userAssemblyIdToAssemblyIdMap[assemblyId];

                    //     if (typeof fastaFilesAndMetadata[userAssemblyId] !== 'undefined') {
                    //         //fastaFilesAndMetadataWithUpdatedIds[assemblyId] = fastaFilesAndMetadata[userAssemblyId];
                    //         sortedFastaFilesAndMetadataWithUpdatedIds.push([collectionId, assemblyId, fastaFilesAndMetadata[userAssemblyId]]);
                    //     }
                    // });




                    //
                    // Post each FASTA file separately
                    //
                    fastaAndMetadataWithAssemblyId.forEach(function(assembly) {
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
                            //var autocompleteInput = $('li[data-name="' + userAssemblyId + '"] .assembly-sample-location-input');

                            console.debug('userAssemblyId: ' + userAssemblyId);
                            console.dir(WGST.upload);

                            console.debug('assemblyData: ');
                            console.dir(assemblyData);

                            readyToUploadAssemblyData.collectionId = collectionId;
                            readyToUploadAssemblyData.assemblyId = assemblyId;
                            readyToUploadAssemblyData.userAssemblyId = assemblyData.fasta.name;
                            readyToUploadAssemblyData.sequences = assemblyData.fasta.assembly;
                            readyToUploadAssemblyData.metadata = {
                                datetime: assemblyData.metadata.datetime,
                                geography: {
                                    position: {
                                        latitude: assemblyData.metadata.geography.position.latitude,
                                        longitude: assemblyData.metadata.geography.position.longitude
                                    },
                                    address: assemblyData.metadata.geography.address
                                },
                                source: assemblyData.metadata.source
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
                    console.error('[WGST][Error] Failed to get collection id');
                    console.error(textStatus);
                    console.error(errorThrown);
                    console.error(jqXHR);

                    //showNotification(textStatus);
                });

            }, GET_COLLECTION_ID_TIMER);












	        // //
	        // // Set number of assemblies uploading
	        // //
	        // //$('.wgst-panel__assembly-upload-progress .header-title small').text(totalNumberOfAssembliesUploading);
	        // //$('.wgst-panel__assembly-upload-progress .assemblies-upload-total').text(totalNumberOfAssembliesUploading);

	        // // Open assembly upload progress panel
	        // activatePanel('assemblyUploadProgress', function(){
	        //     showPanel('assemblyUploadProgress');

	        //     // Check if user creates new collection or uploads assemblies to the existing collection
	        //     var collectionId = $('.wgst-panel__assembly-upload-navigator').attr('data-collection-id');

	        //     // Upload to new collection
	        //     //if ($('.wgst-panel__assembly-upload-navigator').attr('data-collection-id').length === 0) {
	                
	        //         console.log('[WGST] Getting collection id');


	        // }); // activatePanel()

	        // if (WGST.speak) {
	        //     var message = new SpeechSynthesisUtterance('Uploading...');
	        //     window.speechSynthesis.speak(message);
	        // }

	    });

	    var numberOfFilesProcessing = 0,
	        PARALLEL_UPLOAD_ASSEMBLY_LIMIT = 5,
	        ASSEMBLY_UPLOAD_TIMER = 2000;

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

	    //
	    // Listen to assembly upload notifications
	    //
	    window.WGST.socket.connection.on('assemblyUploadNotification', function(data) {

            if  (! window.WGST.exports.isContainerExists('assembly-upload-progress')) {

                var totalNumberOfAssembliesUploading = Object.keys(window.WGST.upload.fastaAndMetadata).length;

                // //
                // // Create panel
                // //
                // window.WGST.exports.createPanel('assembly-upload-progress', {
                //     panelId: 'assembly-upload-progress',
                //     panelType: 'assembly-upload-progress',
                //     assemblyFileIds: Object.keys(window.WGST.upload.fastaAndMetadata),
                //     totalNumberOfAssembliesUploading: totalNumberOfAssembliesUploading
                // });

                // //
                // // Show panel
                // //
                // window.WGST.exports.showPanel('assembly-upload-progress');

                //
                // Create fullscreen
                //
                window.WGST.exports.createFullscreen('assembly-upload-progress', {
                    fullscreenId: 'assembly-upload-progress',
                    fullscreenType: 'assembly-upload-progress',
                    assemblyFileIds: Object.keys(window.WGST.upload.fastaAndMetadata),
                    totalNumberOfAssembliesUploading: totalNumberOfAssembliesUploading
                });

                //
                // Show fullscreen
                //
                window.WGST.exports.showFullscreen('assembly-upload-progress');

                //
                // Hide uploading background
                //
                window.WGST.exports.hideBackground('uploading');
            }

	        var collectionId = data.collectionId,
	            assemblyId = data.assemblyId,
	            userAssemblyId = data.userAssemblyId,
	            result = data.result,
	            resultKey = collectionId + '__' + assemblyId + '__' + result,
	            assemblies = Object.keys(window.WGST.upload.fastaAndMetadata),
	            numberOfAnalysisResultsPerAssembly = Object.keys(window.WGST.assembly.analysis).length,
	            numberOfAnalysisResultsPerAllAssemblies = numberOfAnalysisResultsPerAssembly * assemblies.length,
	            numberOfAnalysisResultsPerCollection = Object.keys(window.WGST.collection.analysis).length,
	            totalNumberOfAnalysisResults = numberOfAnalysisResultsPerAllAssemblies + numberOfAnalysisResultsPerCollection;

	        console.log('[WGST][Socket.io] Received assembly upload notification:');
	        console.log('[WGST][Socket.io] Assembly id: ' + assemblyId);
	        console.log('[WGST][Socket.io] Result: ' + result);

	        // If a new result received (not a duplicate one), then process it
	        if (Object.keys(window.WGST.upload.collection[collectionId].notifications.all).indexOf(resultKey) === -1) {
	            // Track received results
	            window.WGST.upload.collection[collectionId].notifications.all[resultKey] = 'OK';

	            console.debug('[WGST] » Received ' + Object.keys(window.WGST.upload.collection[collectionId].notifications.all).length + ' out of ' + totalNumberOfAnalysisResults + ' assembly results' );

	            // Update assembly upload bar ui only if analysis result relates to assembly, not collection
	            if (Object.keys(window.WGST.assembly.analysis).indexOf(result) !== -1) {
	                updateAssemblyUploadProgressUI(assemblyId, userAssemblyId, numberOfAnalysisResultsPerAssembly, result);
	            }

	            //
	            // Update collection upload bar ui
	            //
	            updateCollectionUploadProgressUI(collectionId, userAssemblyId, assemblyId, totalNumberOfAnalysisResults, result);
	            
	            //
	            // When all results were processed - get collection
	            //
	            if (totalNumberOfAnalysisResults === Object.keys(window.WGST.upload.collection[collectionId].notifications.all).length) {
	                console.log('[WGST] ✔ Finished uploading and processing new collection ' + collectionId);

	                //
	                // Wait for 1 second
	                //
	                setTimeout(function(){

                        //
                        // Remove container
                        //
                        window.WGST.exports.removeContainer('assembly-upload-progress');

	                	// //
	                	// // Remove panel
	                	// //
	                	// window.WGST.exports.removePanel('assembly-upload-progress');

	                	//
	                	// Remove upload assembly data model
	                	//
	                    resetAssemlyUpload();

	                    //
	                    // Get collection
	                    //
	                    window.WGST.exports.getCollection(collectionId);

	                }, 1000);

	            } // if
	        } // if
	    });

	    var updateAssemblyUploadProgressUI = function(assemblyId, userAssemblyId, numberOfAnalysisResultsPerAssembly, result) {
	        // ------------------------------------------
	        // Create result element
	        // ------------------------------------------
	        var $assemblyRow = $('.assembly-list-upload-progress tr[data-assembly-file-id="' + userAssemblyId + '"] '),
	            $assemblyRowProgressBar = $assemblyRow.find('.progress-bar'),
	            statusCompleteHtml = '<span class="glyphicon glyphicon-ok"></span>',
	            currentProgressBarPercentageValue = parseFloat($assemblyRow.find('.progress-bar').attr('aria-valuenow')),
	            progressStepSize = 100 / numberOfAnalysisResultsPerAssembly,
	            newProgressBarPercentageValue = currentProgressBarPercentageValue + progressStepSize;

	        if (result === window.WGST.assembly.analysis.UPLOAD_OK) {
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

	    var resetAssemlyUpload = function() {
	    	
	    	//
	        // Empty list of selected FASTA files and metadata
	        //
	        window.WGST.upload.fastaAndMetadata = {};

	        //numberOfDroppedFastaFiles = 0,
	        //numberOfParsedFastaFiles = 0;

	        //resetPanelAssemblyUploadNavigator();
	        //resetPanelAssemblyUploadAnalytics();
	        //resetPanelAssemblyUploadMetadata();
	    };

	})();

});
$(function(){

	(function(){

        window.WGST.exports.showBackground = function(backgroundId) {
            $('[data-wgst-background-id="' + backgroundId + '"]').removeClass('wgst--hide-this');

            // $('[data-wgst-background-id="' + backgroundId + '"]').fadeIn('slow', function(){
            //     $(this).removeClass('wgst--hide-this');
            // });
        };

        window.WGST.exports.hideBackground = function(backgroundId) {
            $('[data-wgst-background-id="' + backgroundId + '"]').addClass('wgst--hide-this');

            // $('[data-wgst-background-id="' + backgroundId + '"]').fadeOut('slow', function(){
            //     $(this).addClass('wgst--hide-this');
            // });
        };

	})();

});
$(function(){

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
        var assemblies = window.WGST.collection[collectionId].assemblies,
            sortedAssemblies = [],
            sortedAssemblyIds = [];

        var treeName = "CORE_TREE_RESULT",
        	tree = window.WGST.collection[collectionId].tree[treeName];

        //
        // Sort assemblies in order in which they are displayed on a tree
        //
        $.each(tree.leavesOrder, function(leafCounter, leaf){
            sortedAssemblies.push(assemblies[leaf.id]);
            sortedAssemblyIds.push(leaf.id);
        });

        window.WGST.collection[collectionId].sortedAssemblyIds = sortedAssemblyIds;
    };

    window.WGST.exports.getCollection = function(collectionId) {
        console.log('[WGST] Getting collection ' + collectionId);

        if (window.WGST.speak) {
            var message = new SpeechSynthesisUtterance('Loading collection');
            window.speechSynthesis.speak(message);
        }

        //
        // Show background
        //
        window.WGST.exports.showBackground('get-collection');

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
                // Create collection map fullscreen
                // 
        		window.WGST.exports.createFullscreen('collection-map', {
        			fullscreenId: 'collection-map',
        			fullscreenType: 'collection-map'
        		});

			    //
			    // Show fullscreen
			    //
			    window.WGST.exports.showFullscreen('collection-map');

          //       //
          //       // Create collection map fullscreen
          //       // 
        		// window.WGST.exports.createFullscreen('collection-tree', {
        		// 	fullscreenId: 'collection-tree',
        		// 	fullscreenType: 'collection-tree'
        		// });

        		//
			    // Init map
			    //
			    window.WGST.geo.map.init();

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
                //$('.wgst-navigation__collection-panels').toggleClass('wgst--hide-this');

		        //
		        // Hide background
		        //
		        window.WGST.exports.hideBackground('get-collection');

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
        $('.wgst-navigation__collection-panels').toggleClass('wgst--hide-this');
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
            //resistanceProfileGroups = assembly.PAARSNP_RESULT.paarResult.resistanceProfile;
            resistanceProfileGroups = assembly.PAARSNP_RESULT.resistanceProfile;
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

        var assemblies = window.WGST.collection[collectionId].assemblies,
            sortedAssemblyIds = window.WGST.collection[collectionId].sortedAssemblyIds;

        var assembly,
        	//assemblyTemplateContext,
        	preparedForRenderingAssemblyData;

        var preparedAssembliesData = sortedAssemblyIds.map(function(assemblyId) {
        		assembly = assemblies[assemblyId];
        		preparedForRenderingAssemblyData = window.WGST.exports.prepareAssemblyDataForRendering(assembly, window.WGST.antibiotics);
	            
        		//
        		// Set assembly top score
        		//
        		window.WGST.collection[collectionId].assemblies[assemblyId].FP_COMP.topScore = preparedForRenderingAssemblyData.topScore;

	            return {
	            	assemblyId: assemblyId,
	                assemblyUserId: preparedForRenderingAssemblyData.assemblyUserId,
	                antibioticResistanceData: preparedForRenderingAssemblyData.resistanceProfile,
	                sequenceTypeData: preparedForRenderingAssemblyData.sequenceType,
	                mlstData: preparedForRenderingAssemblyData.mlst,
	                nearestRepresentativeData: preparedForRenderingAssemblyData.nearestRepresentative,
	                scoresData: preparedForRenderingAssemblyData.scores,
	                topScore: preparedForRenderingAssemblyData.topScore,
	                topScorePercentage: preparedForRenderingAssemblyData.topScorePercentage,
	                metadata: {
	                	latitude: preparedForRenderingAssemblyData.metadata.latitude,
	                	longitude: preparedForRenderingAssemblyData.metadata.longitude
	                }
	            };
        	});

        var templateContext = {
        	collectionId: collectionId,
        	assemblies: preparedAssembliesData
        };

        console.log('>>> !!! templateContext:');
        console.dir(templateContext);

    	//
    	// Render
    	//
        var //templateId = window.WGST.exports.mapPanelTypeToTemplateId[panelType],
            templateSource = $('.wgst-template[data-template-id="panel-body__collection-data__assemblies"]').html(),
            template = Handlebars.compile(templateSource);

        //
        // Register partials
        //
        var partialTemplateSource = $('.wgst-template[data-template-id="panel-body__collection-data__assemblies__assembly"]').html();
        Handlebars.registerPartial('assembly', partialTemplateSource);

        //
        // Prepend to DOM
        //
        var collectionDataHtml = template(templateContext);

        var $collectionDataPanel = $('.wgst-panel[data-panel-id="' + panelId + '"]'),
        	$collectionDataPanelBodyContainer = $collectionDataPanel.find('.wgst-panel-body-container');

        $collectionDataPanelBodyContainer.prepend(collectionDataHtml);

        //
        // Check checkboxes
        //
        //$('.show-on-map-checkbox input[type="checkbox"]').prop('checked', true).change();
        $('.wgst-assembly-show-on-map').prop('checked', true).change();
    };

    window.WGST.exports.__old_remove__renderAssemblyAnalysisList = function(collectionId, panelId, antibiotics) {
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

    window.WGST.exports.__old_remove__createAssemblyResistanceProfilePreviewHtml = function(assemblyResistanceProfile, antibiotics) {
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

        window.WGST.exports.maximizePanel('collection-data__' + collectionId);

        // //
        // // Bring fullscreen into panel
        // //
        // var fullscreenId = $('.wgst-fullscreen').attr('data-fullscreen-id');
        // var panelId = fullscreenId;
        // var originalFullscreenId = fullscreenId;
        
        // console.debug('fullscreenId: ' + fullscreenId);
        // console.debug('panelId: ' + panelId);

        // window.WGST.exports.bringFullscreenToPanel(fullscreenId);

        // //
        // // Bring panel into fullscreen
        // //
        // var panelId = 'collection-data__' + collectionId,
        // 	fullscreenId = 'collection-data';

        // window.WGST.exports.bringPanelToFullscreen(panelId);

        // // Destroy all Twitter Bootstrap Tooltips
        // //$('[data-toggle="tooltip"]').tooltip('destroy');

        // // bringPanelToFullscreen('collection_' + collectionId, function(){
        // //     // Trigger Twitter Bootstrap tooltip
        // //     $('[data-toggle="tooltip"]').tooltip();
        // //     // Open Map panel
        // //     window.WGST.openPanel('map');
        // // });


        // google.maps.event.trigger(window.WGST.geo.map.canvas, 'resize');
    };

});
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

                //
                // Check all
                //
                $showOnMapCheckboxes.prop('checked', true).trigger('change');

            } else {

                //
                // Uncheck all
                //
                $showOnMapCheckboxes.prop('checked', false).trigger('change');
            }
        });

        //
        // Download assembly metadata
        //
        $('body').on('click', '[data-wgst-download-metadata]', function() {

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
$(function(){

	(function(){

	    $('.tree-controls-show-labels').on('click', function(){
	        // Get collection id
	        var collectionId = $(this).closest('[data-collection-tree-content]').attr('data-collection-id');

	        WGST.collection[collectionId].tree['CORE_TREE_RESULT'].canvas.displayLabels();
	    });

	    $('.tree-controls-hide-labels').on('click', function(){
	        // Get collection id
	        var collectionId = $(this).closest('[data-collection-tree-content]').attr('data-collection-id');

	        WGST.collection[collectionId].tree['CORE_TREE_RESULT'].canvas.hideLabels();
	    });

	    $('body').on('change', '.wgst-tree-control__change-node-label', function(){
	        var selectedOption = $(this),
	            collectionId = selectedOption.closest('[data-collection-tree-content]').attr('data-collection-id'),
	            collectionTreeType = selectedOption.closest('[data-collection-tree-content]').attr('data-collection-tree-type');

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
	                        treeCanvas.branches[assemblyId].label = window.WGST.collection[collectionId].assemblies[assemblyId]['FP_COMP'].topScore.referenceId;              
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

	                    assemblyResistanceProfile = assemblies[assemblyId].PAARSNP_RESULT.resistanceProfile,
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
	            collectionId = selectedOption.closest('[data-collection-tree-content]').attr('data-collection-id'),
	            collectionTreeType = selectedOption.closest('[data-collection-tree-content]').attr('data-collection-tree-type');

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
	                            if (antibioticResistance === 'RESISTANT') {
	                                // Red
	                                tree.setNodeColourAndShape(assemblyId, '#ff0000');                 
	                            } else if (antibioticResistance === 'SENSITIVE') {
	                                // Green
	                                tree.setNodeColourAndShape(assemblyId, '#4dbd33');                 
	                            } else if (antibioticResistance === 'UNKNOWN') {
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
	            collectionId = selectedOption.closest('[data-collection-tree-content]').attr('data-collection-id'),
	            collectionTreeType = selectedOption.closest('[data-collection-tree-content]').attr('data-collection-tree-type'),
	            tree;

	        // if ($(this).closest('.wgst-panel').attr('data-panel-name') === 'mergedCollectionTree') {
	        //     tree = WGST.mergedCollectionTree[collectionId].tree.canvas;
	        // } else {
	        //     tree = WGST.collection[collectionId].tree.canvas;
	        // }

	        tree = window.WGST.collection[collectionId].tree[collectionTreeType].canvas;
	        tree.setTreeType(selectedOption.val());
	    });

	    $('body').on('click', '.wgst-tree-control__show-newick', function(){
	        var collectionId = $(this).closest('[data-collection-tree-content]').attr('data-collection-id'),
	            collectionTreeType = $(this).closest('[data-collection-tree-content]').attr('data-collection-tree-type'),
	            newickStringWithLabels,
	            newWindow;

	        newickStringWithLabels = WGST.collection[collectionId].tree[collectionTreeType].newickStringWithLabels;

	        newWindow = window.open();
	        newWindow.document.write(newickStringWithLabels);
	    });

	    $('body').on('click', '.wgst-tree-control__decrease-label-font-size', function(){
	        var collectionId = $(this).closest('[data-collection-tree-content]').attr('data-collection-id'),
	            collectionTreeType = $(this).closest('[data-collection-tree-content]').attr('data-collection-tree-type'),
	            currentNodeTextSize,
	            tree;

	        tree = WGST.collection[collectionId].tree[collectionTreeType].canvas;
	        currentNodeTextSize = tree.textSize;
	        tree.setTextSize(currentNodeTextSize - 3);
	    });

	    $('body').on('click', '.wgst-tree-control__increase-label-font-size', function(){
	        var collectionId = $(this).closest('[data-collection-tree-content]').attr('data-collection-id'),
	            collectionTreeType = $(this).closest('[data-collection-tree-content]').attr('data-collection-tree-type'),
	            currentNodeTextSize,
	            tree;

	        tree = WGST.collection[collectionId].tree[collectionTreeType].canvas;
	        currentNodeTextSize = tree.textSize;
	        tree.setTextSize(currentNodeTextSize + 3);
	    });

	    $('body').on('click', '.wgst-tree-control__decrease-node-size', function(){
	        var collectionId = $(this).closest('[data-collection-tree-content]').attr('data-collection-id'),
	            collectionTreeType = $(this).closest('[data-collection-tree-content]').attr('data-collection-tree-type'),
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
	        var collectionId = $(this).closest('[data-collection-tree-content]').attr('data-collection-id'),
	            collectionTreeType = $(this).closest('[data-collection-tree-content]').attr('data-collection-tree-type'),
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
	        var collectionId = $(this).closest('[data-collection-tree-content]').attr('data-collection-id'),
	            collectionTreeType = $(this).closest('[data-collection-tree-content]').attr('data-collection-tree-type'),
	            tree;
	        
	        tree = WGST.collection[collectionId].tree[collectionTreeType].canvas;
	        tree.toggleLabels();
	    });

	    window.WGST.socket.connection.on('collectionTreeMergeNotification', function(mergedCollectionTreeData) {
	        console.log('[WGST] Received merged tree notification');

	        if (WGST.speak) {
	            var message = new SpeechSynthesisUtterance('Merged collections');
	            window.speechSynthesis.speak(message);
	        }

	        // console.debug('mergedCollectionTreeData:');
	        // console.dir(mergedCollectionTreeData);

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

                //
                // Set collection data
                //
                window.WGST.exports.setCollectionData(collectionId, assemblies, collectionTree);

	            //window.WGST.exports.initCollectionDataStructure(collectionId, assemblies, collectionTree);
	            window.WGST.exports.renderCollectionTrees(collectionId, {
	                // Show buttons
	                matchAssemblyListButton: true,
	                mergeWithButton: true,
	                panelLabel: 'Merge Tree'
	            });

	            // ------------------------------------------
	            // Prepare nearest representative
	            // ------------------------------------------
	            var assemblyId,
	                assembly,
	                assemblyScores;

	            for (assemblyId in window.WGST.collection[collectionId].assemblies) {
	                if (WGST.collection[collectionId].assemblies.hasOwnProperty(assemblyId)) {
	                    assembly = window.WGST.collection[collectionId].assemblies[assemblyId];
	                    assemblyScores = assembly['FP_COMP'].scores;
	                    // Set top score
	                    window.WGST.collection[collectionId].assemblies[assemblyId]['FP_COMP'].topScore = window.WGST.exports.calculateAssemblyTopScore(assemblyScores);
	                } // if
	            } // for

	            //window.WGST.exports.addResistanceProfileToCollection(collectionId);
	            window.WGST.exports.addResistanceProfileDataToCollection(collectionId);
	            window.WGST.exports.populateListOfAntibiotics($('#select-tree-node-antibiotic-merged'));

	            // ------------------------------------------
	            // Enable Merge Collections button
	            // ------------------------------------------
	            (function() {
	                var mergeCollectionTreesButton = $('.wgst-tree-control__merge-collection-trees');
	                mergeCollectionTreesButton.find('.wgst-spinner').addClass('wgst--hide-this');
	                mergeCollectionTreesButton.find('.wgst-spinner-label').removeClass('wgst--hide-this');
	                mergeCollectionTreesButton.attr('disabled', false);
	            }());





	            //
	            // Show tree panel
	            //
	            var collectionTreeType = 'MERGED',
	                collectionTreePanelId = 'collection-tree' + '__' + collectionId + '__' + collectionTreeType;

	            window.WGST.exports.showPanel(collectionTreePanelId);
	            
	            //
	            // Bring to front
	            //
	            window.WGST.exports.bringPanelToFront(collectionTreePanelId);

	        })
	        .fail(function(jqXHR, textStatus, errorThrown) {
	            console.error('[WGST][Error] ✗ Failed to get assemblies');
	            console.error(textStatus);
	            console.error(errorThrown);
	            console.error(jqXHR);

	        });
	    });

	    $('body').on('click', '.wgst-tree-control__merge-collection-trees', function(){

	        var mergeButton = $(this);

	        mergeButton.attr('disabled', true);
	        mergeButton.find('.wgst-spinner-label').addClass('wgst--hide-this');
	        mergeButton.find('.wgst-spinner').removeClass('wgst--hide-this');

	        //-----------------------------
	        // Remove after demo
	        //
	        // var mapCollectionIdToMergeTreeId = {
	        //     '5324c298-4cd0-4329-848b-30d7fe28a560': 'ab66c759-2242-42c2-a245-d364fcbc7c4f',
	        //     'c0ca8c57-11b9-4e27-93a5-6ffe841e7768': '2b3ad477-323c-4c54-b6f2-abc420ba0399'
	        // };
	        // var collectionId = $(this).closest('[data-collection-tree-content]').attr('data-collection-id');
	        // if (mapCollectionIdToMergeTreeId.hasOwnProperty(collectionId)) {
	        //     demoMergeCollectionTrees(mapCollectionIdToMergeTreeId[collectionId]);
	        //     return;
	        // }
	        //-----------------------------

	        var requestData = {
	            collectionId: mergeButton.closest('[data-collection-tree-content]').attr('data-collection-id'),
	            mergeWithCollectionId: window.WGST.settings.referenceCollectionId,
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

	    // var demoMergeCollectionTrees = function(mergeTreeId) {
	    //     var mergeButton = $(this);

	    //     mergeButton.attr('disabled', true);
	    //     mergeButton.find('.wgst-spinner-label').addClass('wgst--hide-this');
	    //     mergeButton.find('.wgst-spinner').removeClass('wgst--hide-this');

	    //     var requestData = {
	    //         mergeTreeId: mergeTreeId,
	    //         //collectionId: mergeButton.closest('.wgst-panel').attr('data-collection-id'),
	    //         //mergeWithCollectionId: 'b8d3aab1-625f-49aa-9857-a5e97f5d6be5', //'78cb7009-64ac-4f04-8428-d4089aae2a13',//'851054d9-86c2-452e-b9af-8cac1d8f0ef6',
	    //         //collectionTreeType: mergeButton.attr('data-collection-tree-type'),
	    //         socketRoomId: WGST.socket.roomId
	    //     };

	    //     console.log('[WGST] Requesting merge tree');

	    //     // Merge collection trees
	    //     $.ajax({
	    //         type: 'POST',
	    //         url: '/api/collection/merged',
	    //         datatype: 'json', // http://stackoverflow.com/a/9155217
	    //         data: requestData
	    //     })
	    //     .done(function(mergeRequestSent, textStatus, jqXHR) {
	    //         console.log('[WGST] Requested merge tree');
	    //     });
	    // };

	    //
	    // To do: refactor
	    //
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
	                                antibioticResistanceState = assemblyResistanceProfile[antibioticGroupName][antibioticName];
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

	})();
});
$(function(){

	(function(){

		window.WGST.exports.isContainerExists = function(containerId) {
			//
			// Figure out container's type
			//

			//
			// Panel
			//
			if (window.WGST.exports.isPanelExists(containerId)) {
				return true;

			//
			// Fullscreen
			//
			} else if (window.WGST.exports.isFullscreenExists(containerId)) {
				return true;
			}

			return false;
		};

		//
		// Get container type
		//
		window.WGST.exports.getContainerType = function(containerId) {
		    //
		    // Panel or fullscreen?
		    //

		    //
		    // Panel
		    //
		    if (window.WGST.exports.isPanelExists(containerId)) {

		    	return 'panel';

		    //
		    // Fullscreen
		    //
		    } else if (window.WGST.exports.isFullscreenExists(containerId)) {

		    	return 'fullscreen';

		   	//
		   	// Unknown
		   	//
		    } else {

		    	return 'unknown';
		    }
		};

		//
		// Bring container to front
		//
		window.WGST.exports.bringContainerToFront = function(containerType, containerId) {

		    //
		    // Calculate the highest z index
		    //
		    var zIndexHighest = 0,
		        zIndexCurrent;

		    //
		    // Find the highest z index
		    //
		    $('.wgst-panel, .wgst-fullscreen').each(function(){

		    	var $currentContainer = $(this);

		    	//
		    	// Get element's current z index
		    	//
		        zIndexCurrent = parseInt($currentContainer.css('z-index'), 10);

		        //
		        // Check if current z index is higher or equal to highest z index
		        //
		        if (zIndexCurrent >= zIndexHighest) {

		        	//
		        	// Set highest z index
		        	//
		            zIndexHighest = zIndexCurrent;

		            // //
		            // // Decrement current element's z index by one
		            // //
		            // $currentContainer.css('z-index', zIndexHighest - 1);
		        }
		    });

		    //
		    // Panel
		    //
		    if (containerType === 'panel') {

		    	//
		    	// Set container's z index to be the highest
		    	//
		        $('[data-panel-id="' + containerId + '"]').css('z-index', zIndexHighest + 1);

		    //
		    // Fullscreen
		    //
		    } else if (containerType === 'fullscreen') {

		    	//
		    	// Set container's z index to be the highest
		    	//
		        $('[data-fullscreen-id="' + containerId + '"]').css('z-index', zIndexHighest + 1);
		    }
		};

		window.WGST.exports.removeContainer = function(containerId) {
			//
			// Figure out container's type
			//

			//
			// Panel
			//
			if (window.WGST.exports.getContainerType(containerId) === 'panel') {
				window.WGST.exports.removePanel(containerId);

			//
			// Fullscreen
			//
			} else if (window.WGST.exports.getContainerType(containerId) === 'fullscreen') {
				window.WGST.exports.removeFullscreen(containerId);
			}
		};

        window.WGST.exports.extendContainerOptions = function(containerOptions, additionalContainerOptions) {
            $.extend(containerOptions, {
                additional: additionalContainerOptions
            });

            return containerOptions;
        };

	    window.WGST.exports.getContainerLabel = function(options) {
	    	console.log('getContainerLabel():');
	    	console.dir(options);

            //
            //
	    	//
	    	// Options:
	    	//
	    	// containerName: "panel" or "fullscreen"
	    	// containerType: panelType or fullscreenType
	    	// containerId: panelId or fullscreenId
            // additional: additional container options (specific to each container)
	    	//
	    	//
	    	//

        	var containerLabel = 'Anonymous';

        	//
        	// Prepare container's label
        	//
        	if (options.containerType === 'collection-data') {

        		containerLabel = 'Data';

        	} else if (options.containerType === 'collection-map') {

        		containerLabel = 'Map';

        	} else if (options.containerType === 'collection-tree') {

                containerLabel = 'Tree';

        		// var treeType = options.containerId.split('__')[2];
        		// containerLabel = treeType.replace(/[_]/g, ' ').toLowerCase().capitalize();

        	} else if (options.containerType === 'assembly') {

        		containerLabel = options.additional.assemblyUserId; // 'Assembly';

        	} else if (options.containerType === 'assembly-upload-progress') {

                containerLabel = 'Upload Progress';

            } else if (options.containerType === 'assembly-upload-metadata') {

                containerLabel = 'Assembly Metadata';

            } else if (options.containerType === 'assembly-upload-analytics') {

                containerLabel = 'Assembly Analytics';

            } else if (options.containerType === 'assembly-upload-navigation') {

                containerLabel = 'Collection Navigation';

            }

        	return containerLabel;
	    };

	})();

});
$(function(){

	(function(){

	    window.WGST.exports.extractContigsFromFastaFileString = function(fastaFileString) {
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

	    window.WGST.exports.splitContigIntoParts = function(contig) {
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

	    window.WGST.exports.extractDnaStringIdFromContig = function(contig) {
	        var contigParts = window.WGST.exports.splitContigIntoParts(contig);

	        // Parse DNA string id
	        var dnaStringId = contigParts[0].trim().replace('>','');

	        return dnaStringId;
	    };

	    window.WGST.regex = WGST.regex || {};
	    window.WGST.regex.DNA_SEQUENCE = /^[CTAGNUX]+$/i;

	    window.WGST.exports.extractDnaStringFromContig = function(contig) {
	        var contigParts = window.WGST.exports.splitContigIntoParts(contig);
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

	    window.WGST.exports.extractDnaStringsFromContigs = function(contigs) {
	        var dnaStrings = [],
	            dnaString;
	        contigs.forEach(function(contig) {
	            dnaString = window.WGST.exports.extractDnaStringFromContig(contig);
	            dnaStrings.push(dnaString);
	        });
	        return dnaStrings;
	    };

	    window.WGST.exports.isValidDnaString = function(dnaString) {
	        return WGST.regex.DNA_SEQUENCE.test(dnaString);
	    };

	    window.WGST.exports.isValidContig = function(contig) {
	        var contigParts = window.WGST.exports.splitContigIntoParts(contig);
	        var dnaString = window.WGST.exports.extractDnaStringFromContig(contig);

	        return (contigParts.length > 1 && window.WGST.exports.isValidDnaString(dnaString));
	    };

	    window.WGST.exports.calculateN50 = function(dnaSequenceStrings) {
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

	    window.WGST.exports.calculateTotalNumberOfNucleotidesInDnaStrings = function(dnaStrings) {
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

	    window.WGST.exports.calculateAverageNumberOfNucleotidesInDnaStrings = function(dnaStrings) {
	        var totalNumberOfNucleotidesInDnaStrings = window.WGST.exports.calculateTotalNumberOfNucleotidesInDnaStrings(dnaStrings);
	        var numberOfDnaStrings = dnaStrings.length;
	        var averageNumberOfNucleotidesInDnaStrings = Math.floor(totalNumberOfNucleotidesInDnaStrings / numberOfDnaStrings);
	        return averageNumberOfNucleotidesInDnaStrings;
	    };

	    window.WGST.exports.calculateSmallestNumberOfNucleotidesInDnaStrings = function(dnaStrings) {
	        var numberOfNucleotidesInDnaStrings = dnaStrings.map(function(dnaString){
	            return dnaString.length;
	        });
	        var smallestNumberOfNucleotidesInDnaStrings = numberOfNucleotidesInDnaStrings.reduce(function(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString, index, array){
	            return Math.min(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString);
	        });
	        return smallestNumberOfNucleotidesInDnaStrings;
	    };

	    window.WGST.exports.calculateBiggestNumberOfNucleotidesInDnaStrings = function(dnaStrings) {
	        var numberOfNucleotidesInDnaStrings = dnaStrings.map(function(dnaString){
	            return dnaString.length;
	        });
	        var biggestNumberOfNucleotidesInDnaStrings = numberOfNucleotidesInDnaStrings.reduce(function(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString, index, array){
	            return Math.max(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString);
	        });
	        return biggestNumberOfNucleotidesInDnaStrings;
	    };

	    window.WGST.exports.calculateSumsOfNucleotidesInDnaStrings = function(dnaStrings) {
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

	    window.WGST.exports.validateContigs = function(contigs) {

	        var validatedContigs = {
	            valid: [],
	            invalid: []
	        };

	        //
	        // Validate each contig
	        //
	        contigs.forEach(function(contig, index, contigs) {

	            var contigParts = window.WGST.exports.splitContigIntoParts(contig);
	            var dnaString = window.WGST.exports.extractDnaStringFromContig(contig);
	            var dnaStringId = window.WGST.exports.extractDnaStringIdFromContig(contig);

	            // Valid contig
	            if (window.WGST.exports.isValidContig(contig)) {
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

	    window.WGST.exports.drawN50Chart = function(chartData, assemblyN50, appendToClass) {

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
	        var svg = d3.select(appendToClass)
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

	})();

});
$(function(){

	(function(){

        //
        // Feedback form
        //
        $('body').on('submit', '[data-form="feedback"]', function(event){
            console.log('[WGST] Submitting feedback form...');

            event.preventDefault();

            var $button = $(this).find('[type="submit"]');

            $button.prop('disabled', true);
            $button.find('span').addClass('wgst--hide-this');
            $button.find('.wgst-spinner').removeClass('wgst--hide-this');

            var $form = $('[data-form="feedback"]');

            var name = $form.find('[data-input="name"]').val(),
                email = $form.find('[data-input="email"]').val(),
                feedback = $form.find('[data-input="feedback"]').val();

            var result = {
                name: name,
                email: email,
                feedback: feedback
            };

            console.dir(result);

            window.WGST.exports.mixpanel.submitFeedback();

            // Get collection data
            $.ajax({
                type: 'POST',
                url: '/feedback/',
                // http://stackoverflow.com/a/9155217
                datatype: 'json',
                data: result
            })
            .done(function(data, textStatus, jqXHR) {
                console.log('[WGST] Sent feedback');

                $button.addClass('wgst--hide-this');

                $('.wgst-send-feedback-success-message').removeClass('wgst--hide-this');

            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log('[WGST][Error] Failed to send feedback');
                console.error(textStatus);
                console.error(errorThrown);
                console.error(jqXHR);
            });
        });

	})();

});
$(function(){

	(function(){

        window.WGST.exports.mapFullscreenTypeToTemplateId = {
            'collection-map': 'collection-map-fullscreen',
            'collection-data': 'collection-data-fullscreen',
            'collection-tree': 'collection-tree-fullscreen',
            'assembly-upload-progress': 'assembly-upload-progress-fullscreen',
            'assembly': 'assembly-fullscreen'
        };

        window.WGST.exports.mapFullscreenIdToPanelType = {
            'collection-map': 'collection-map',
            'collection-data': 'collection-data',
            'collection-tree': 'collection-tree'
        };

        window.WGST.exports.createFullscreen = function(fullscreenId, templateContext) {
            console.log('createFullscreen():');
            console.log(fullscreenId);
            console.dir(templateContext);

            //
            // Check if fullscreen already exists
            //
            if ($('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').length > 0) {
                return;
            }

            //
            // Check if template context was passed
            //
            if (typeof templateContext === 'undefined') {
                console.error('[WGST][Error] No template context were provided.');
                return;
            }

            //
            // Get container's label
            //
            var containerOptions = {
                containerName: 'fullscreen',
                containerType: templateContext.fullscreenType,
                containerId: fullscreenId 
            };

            if (containerOptions.containerType === 'assembly') {

                var additionalContainerOptions = {
                    assemblyUserId: 'AAA'
                };

                containerOptions = window.WGST.exports.extendContainerOptions(containerOptions, additionalContainerOptions);
            }

            templateContext.fullscreenLabel = window.WGST.exports.getContainerLabel(containerOptions);

            console.debug('templateContext.fullscreenType: ' + templateContext.fullscreenType);

            //
            // Render
            //
            var fullscreenTemplateId = window.WGST.exports.mapFullscreenTypeToTemplateId[templateContext.fullscreenType];

            console.debug('fullscreenTemplateId: ' + fullscreenTemplateId);
            console.log($('.wgst-template[data-template-id="' + fullscreenTemplateId + '"]').html());

            var fullscreenTemplateSource = $('.wgst-template[data-template-id="' + fullscreenTemplateId + '"]').html(),
                fullscreenTemplate = Handlebars.compile(fullscreenTemplateSource),
                fullscreenHtml = fullscreenTemplate(templateContext);

            $('.wgst-workspace').prepend(fullscreenHtml);

            //
            // Notify hidable
            //
            window.WGST.exports.happenedCreateFullscreen({
                fullscreenId: fullscreenId,
                fullscreenLabel: templateContext.fullscreenLabel
            });
        };

        window.WGST.exports.removeFullscreen = function(fullscreenId) {
            $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').remove();

            //
            // Update hidable state
            //
            window.WGST.exports.happenedRemoveFullscreen(fullscreenId);

            if (fullscreenId === 'collection-map') {

                //
                // Remove map
                //
                window.WGST.geo.map.remove();
            }
        };

        window.WGST.exports.showFullscreen = function(fullscreenId) {
            $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').removeClass('wgst--hide-this wgst--invisible-this');
        
            //
            // Update hidable state
            //
            window.WGST.exports.happenedShowFullscreen(fullscreenId);
        };

        window.WGST.exports.hideFullscreen = function(fullscreenId) {
            $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').addClass('wgst--hide-this wgst--invisible-this');
        
            //
            // Update hidable state
            //
            window.WGST.exports.happenedHideFullscreen(fullscreenId);
        };

        window.WGST.exports.isFullscreenExists = function(fullscreenId) {
            if ($('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').length > 0) {
                return true;
            } else {
                return false;
            }
        };

        window.WGST.exports.toggleFullscreen = function(fullscreenId) {

            var $fullscreen = $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]');

            //
            // Toggle fullscreen
            //
            if ($fullscreen.is('.wgst--hide-this, .wgst--invisible-this')) {

                //
                // Show fullscreen
                //
                window.WGST.exports.showFullscreen(fullscreenId);

            } else {

                //
                // Hide fullscreen
                //
                window.WGST.exports.hideFullscreen(fullscreenId);
            }
        };

        window.WGST.exports.bringFullscreenToFront = function(fullscreenId) {
            window.WGST.exports.bringContainerToFront('fullscreen', fullscreenId);
        };

        window.WGST.exports.bringFullscreenToBack = function(fullscreenId) {
            $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').css('z-index', 'auto');
        };

        window.WGST.exports.bringFullscreenToPanel = function(fullscreenId, panelWasCreated) {
            //
            // Check if fullscreen exists
            //
            if ($('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').length === 0) {
                return;
            }

            //
            // Create panel
            //
            var panelType = fullscreenId.split('__')[0],
                panelId = fullscreenId,
                collectionId = fullscreenId.split('__')[1],
                fullscreenType = panelType;

            // console.debug('[WGST][Debug] bringFullscreenToPanel | fullscreenType: ' + fullscreenType);
            // console.debug('[WGST][Debug] bringFullscreenToPanel | fullscreenId: ' + fullscreenId);
            // console.debug('[WGST][Debug] bringFullscreenToPanel | panelId: ' + panelId);
            // console.debug('[WGST][Debug] bringFullscreenToPanel | panelType: ' + panelType);
            // console.debug('[WGST][Debug] bringFullscreenToPanel | collectionID: ' + collectionId);

            // var panelContext = {
            //     panelId: panelId,
            //     panelType: panelType,
            //     collectionId: collectionId
            // };

            // if (fullscreenType === 'collection-tree') {
            //     panelContext
            // }

            var collectionId = $('[data-collection-tree-content]').attr('data-collection-id'),
                collectionTreeType = $('[data-collection-tree-content]').attr('data-collection-tree-type');


            window.WGST.exports.createPanel(panelType, {
                panelId: panelId,
                panelType: panelType,
                collectionId: collectionId
            });

            //
            // Allow to move content from fullscreen to panel before you remove fullscreen
            //
            if (typeof panelWasCreated !== 'undefined') {
                panelWasCreated();
            }

            //
            // Copy panel specific content
            //

            //
            // Data
            //
            if (fullscreenType === 'collection-data') {

                var $fullscreenContent = $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]').find('.wgst-panel-body');
                var $panel = $('.wgst-panel[data-panel-id="' + panelId + '"]');

                $panel.find('.wgst-panel-body').replaceWith($fullscreenContent.clone(true));

                $panel.find('.wgst-collection-controls').removeClass('wgst--hide-this');

            //
            // Map
            //
            } else if (fullscreenType === 'collection-map') {

                //
                // Copy map content to panel
                //
                $('.wgst-panel[data-panel-id="' + panelId + '"]')
                    .find('.wgst-panel-body-container')
                    .append(window.WGST.geo.map.canvas.getDiv());

            //
            // Tree
            //
            } else if (fullscreenType === 'collection-tree') {

                // var collectionId = $('[data-collection-tree-content]').attr('data-collection-id'),
                //     collectionTreeType = $('[data-collection-tree-content]').attr('data-collection-tree-type');

                //
                // Copy tree content to panel
                //
                var $collectionTreeContent = $('[data-fullscreen-type="collection-tree"]').find('[data-collection-tree-content]');

                $('.wgst-panel[data-panel-id="' + fullscreenId + '"]')
                    .find('.wgst-panel-body-container')
                    .html('')
                    .append($collectionTreeContent);

            //
            // Assembly
            //
            } else if (fullscreenType === 'assembly') {

                var $fullscreenContent = $('[data-fullscreen-type="assembly"]');

                $('.wgst-panel[data-panel-id="' + fullscreenId + '"]')
                    .find('.wgst-panel-body-container')
                    .html('')
                    .append($fullscreenContent.html());

            //
            // Assembly upload progress
            //
            } else if (fullscreenType === 'assembly-upload-progress') {

                var $fullscreenContent = $('[data-fullscreen-type="assembly-upload-progress"]');

                $('.wgst-panel[data-panel-id="' + fullscreenId + '"]')
                    .find('.wgst-panel-body-container')
                    .html('')
                    .append($fullscreenContent.html());
            }

            //
            // Remove fullscreen
            //
            window.WGST.exports.removeFullscreen(fullscreenId);

            //
            // Show panel
            //
            window.WGST.exports.showPanel(panelId);
            
            //
            // Resize map
            //
            if (fullscreenType === 'collection-map') {

                google.maps.event.trigger(window.WGST.geo.map.canvas, 'resize');

            //
            // Resize tree
            //
            } else if (panelType === 'collection-tree') {

                //
                // Resize tree
                //
                window.WGST.collection[collectionId].tree[collectionTreeType].canvas.resizeToContainer();
                window.WGST.collection[collectionId].tree[collectionTreeType].canvas.draw();
            }

            //
            // Bring panel to front
            //
            window.WGST.exports.bringPanelToFront(panelId);

            //
            // Notify hidable
            //
            window.WGST.exports.happenedFullscreenToPanel(fullscreenId);
        };

        window.WGST.exports.bringPanelToFullscreen = function(panelId) {
            
            var fullscreenType = panelId.split('__')[0];
            var fullscreenId = panelId;

            // console.debug('[WGST][Debug] bringPanelToFullscreen | fullscreenType: ' + fullscreenType);
            // console.debug('[WGST][Debug] bringPanelToFullscreen | fullscreenId: ' + fullscreenId);
            // console.debug('[WGST][Debug] bringPanelToFullscreen | panelId: ' + panelId);

            //
            // Check if fullscreen exists
            //
            if (window.WGST.exports.isFullscreenExists(fullscreenId)) {
                return;
            }

            //
            // Create fullscreen
            //
            window.WGST.exports.createFullscreen(fullscreenId, {
                fullscreenType: fullscreenType,
                fullscreenId: fullscreenId
            });

            //
            // Copy panel specific content
            //
            var panelType = $('.wgst-panel[data-panel-id="' + panelId + '"]').attr('data-panel-type'),
                $fullscreen = $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]');

            //
            // Collection data
            //
            if (panelType === 'collection-data') {
                var $collectionDataContent = $('.wgst-panel[data-panel-id="' + panelId + '"]').find('.wgst-panel-body');
                //$fullscreen.append($collectionDataContent.clone(true));

                $collectionDataContent.clone(true).appendTo($fullscreen);

                //
                // Hide controls
                //
                $fullscreen.find('.wgst-collection-controls').addClass('wgst--hide-this');

            //
            // Collection map
            //
            } else if (panelType === 'collection-map') {

                //
                // Copy map content to fullscreen
                //
                $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                    .find('.wgst-map')
                    .replaceWith(window.WGST.geo.map.canvas.getDiv());

            //
            // Collection tree
            //
            } else if (panelType === 'collection-tree') {

                //
                // Copy tree content to fullscreen
                //

                var $collectionTreeContent = $('[data-panel-type="collection-tree"]').find('[data-collection-tree-content]');

                $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                    .html('')
                    .append($collectionTreeContent);

            //
            // Assembly
            //
            } else if (panelType === 'assembly') {

                var $assemblyContent = $('[data-panel-type="assembly"]').find('.wgst-panel-body-container');

                $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                    .html('')
                    .append($assemblyContent.html());

            //
            // Assembly upload progress
            //
            } else if (panelType === 'assembly-upload-progress') {

                var $panelContent = $('[data-panel-type="assembly-upload-progress"]').find('.wgst-panel-body-container');

                $('.wgst-fullscreen[data-fullscreen-id="' + fullscreenId + '"]')
                    .html('')
                    .append($panelContent.html());
            }

            //
            // Show fullscreen
            //
            window.WGST.exports.showFullscreen(fullscreenId);

            //
            // Resize map
            //
            if (panelType === 'collection-map') {

                google.maps.event.trigger(window.WGST.geo.map.canvas, 'resize');

            //
            // Resize tree
            //
            } else if (panelType === 'collection-tree') {

                //
                // Figure out how much space canvas tree should take
                //
                var $fullscreenElement = $('[data-fullscreen-type="collection-tree"]'),
                    fullscreenDimensions = {
                        width: $fullscreenElement.outerWidth(),
                        height: $fullscreenElement.outerHeight()
                    };

                console.log('fullscreenDimensions:');
                console.dir(fullscreenDimensions);

                //
                // Figure out tree controls size
                //
                var $treeControlsElement = $fullscreenElement.find('.wgst-tree-controls'),
                    treeControlsDimensions = {
                        width: $treeControlsElement.outerWidth(),
                        height: $treeControlsElement.outerHeight()
                    };

                console.log('treeControlsDimensions:');
                console.dir(treeControlsDimensions);

                //
                // Calculate tree canvas dimensions
                //
                var canvasDimensions = {
                    width: fullscreenDimensions.width,
                    height: fullscreenDimensions.height - treeControlsDimensions.height
                };

                console.log('canvasDimensions:');
                console.dir(canvasDimensions);

                $('[data-fullscreen-type="collection-tree"]').find('.wgst-tree-content').width(canvasDimensions.width);
                $('[data-fullscreen-type="collection-tree"]').find('.wgst-tree-content').height(canvasDimensions.height);

                //
                // Resize tree
                //
                var collectionId = $('[data-collection-tree-content]').attr('data-collection-id'),
                    collectionTreeType = $('[data-collection-tree-content]').attr('data-collection-tree-type');

                window.WGST.collection[collectionId].tree[collectionTreeType].canvas.resizeToContainer();
                window.WGST.collection[collectionId].tree[collectionTreeType].canvas.draw();
            }

            //
            // Remove panel
            //
            window.WGST.exports.removePanel(panelId);

            //
            // Notify hidable
            //
            window.WGST.exports.happenedPanelToFullscreen(panelId);
        };

	})();

});
$(function(){

	(function(){

        window.WGST.exports.createHidable = function(hidableId, hidableLabel, options) {
            //
            //
            // Options:
            //
            // noFullscreen: true - hides fullscreen control
            // noPanel: true - hides panel control
            //
            //

            //
            // Check if hidable already exists
            //
            if ($('.wgst-hidable[data-hidable-id="' + hidableId + '"]').length > 0) {

                //
                // Do nothing
                //
                return;
            }

            // //
            // // Make this hidable active
            // //
            // $('.wgst-hidable[data-hidable-id="' + hidableId + '"]')
            //     .addClass('wgst-hidable--active');

            var templateContext = {
                    hidableId: hidableId,
                    hidableLabel: hidableLabel
                };

            //
            // Extend template context if needed, for example: turn on/off controls
            //
            if (typeof options !== 'undefined') {
                $.extend(templateContext, options);
            }

            //
            // Set/overwrite options
            //
            //

            //
            // Filter out trees
            //
            if (window.WGST.exports.isHidableTree(hidableId)) {
                //templateContext.noFullscreen = true;
            
            //
            // Filter out assembly
            //
            } else if (typeof hidableId.split('__')[0] !== 'undefined' && hidableId.split('__')[0] === 'assembly') {
                //templateContext.noFullscreen = true;
                templateContext.close = true;
            
            //
            // Filter out assembly upload panels
            //
            } else if (hidableId === 'assembly-upload-navigation'
                    || hidableId === 'assembly-upload-analytics'
                    || hidableId === 'assembly-upload-metadata') {

                templateContext.noFullscreen = true;
                templateContext.close = false;
            }

            //
            // Panel or fullscreen?
            //

            //
            // Panel
            //
            if (window.WGST.exports.getContainerType(hidableId) === 'panel') {
                templateContext.isPanel = true;

            //
            // Fullscreen
            //
            } else if (window.WGST.exports.getContainerType(hidableId) === 'fullscreen') {
                templateContext.isFullscreen = true;
            }

            //
            // Render
            //
            var templateId = 'hidable',
                hidableTemplateSource = $('.wgst-template[data-template-id="' + templateId + '"]').html(),
                hidableTemplate = Handlebars.compile(hidableTemplateSource),
                hidableHtml = hidableTemplate(templateContext);

            $('.wgst-hidables').prepend(hidableHtml);

            //
            // Trees are hidden by default
            //
            if (window.WGST.exports.isHidableTree(hidableId)) {
                window.WGST.exports.happenedHidePanel(hidableId);
            }

            //
            // Show sidebar
            //
            window.WGST.exports.showSidebar();

        };

        window.WGST.exports.isHidableTree = function(hidableId) {
            if (typeof hidableId.split('__')[2] !== 'undefined') {
                return true;
            }

            return false;
        };

        window.WGST.exports.removeHidable = function(hidableId) {
            //
            // Check if container does not exist
            //
            if (! window.WGST.exports.isContainerExists(hidableId)) {
                //
                // Remove element
                //
                $('.wgst-hidable[data-hidable-id="' + hidableId + '"]').remove();

                //
                // Hide sidebar if all hidables were removed
                //
                if ($('.wgst-hidable').length === 0) {
                    window.WGST.exports.hideSidebar();
                }
            }
        };

        //
        //
        //
        // Handle events
        //
        //
        //

        $('body').on('mouseenter', '.wgst-hidable', function() {

            var $hidableControls = $(this).find('.wgst-hidable-controls');

            $hidableControls.toggleClass('wgst--hide-this');

        });

        // $('body').on('mouseenter', '.wgst-hidable', function() {

        //     var hidableId = $(this).attr('data-hidable-id');

        //     //
        //     // Panel or fullscreen?
        //     //

        //     //
        //     // Panel
        //     //
        //     if ($('.wgst-panel[data-panel-id="' + hidableId + '"]').length > 0) {

        //         //
        //         // Show panel
        //         //
        //         //window.WGST.exports.showPanel(hidableId);

        //         //
        //         // Bring panel to front
        //         //
        //         window.WGST.exports.bringPanelToFront(hidableId);

        //     //
        //     // Fullscreen
        //     //
        //     } else if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

        //         //
        //         // Bring fullscreen to front
        //         //
        //         window.WGST.exports.bringFullscreenToFront(hidableId);

        //     }





        //     // //
        //     // //
        //     // //
        //     // // Panel or fullscreen?
        //     // //
        //     // //
        //     // //
        //     // var $activeControl = $(this).find('.wgst-hidable-controls .wgst-hidable--active');
        //     // var containerType = $activeControl.closest('a').attr('class');

        //     // //
        //     // // If panel
        //     // //
        //     // if (containerType === 'wgst-hidable-panel') {

        //     //     //
        //     //     // Bring panel to front
        //     //     //
        //     //     window.WGST.exports.bringPanelToFront(hidableId);

        //     // //
        //     // // If fullscreen
        //     // //
        //     // } else {

        //     //     //
        //     //     // Bring fullscreen to front
        //     //     //
        //     //     window.WGST.exports.bringFullscreenToFront(hidableId);

        //     // }


        // });

        $('body').on('mouseleave', '.wgst-hidable', function() {

            //
            // Hide submenu
            //
            $(this).find('.wgst-hidable-controls').addClass('wgst--hide-this');


            // var hidableId = $(this).attr('data-hidable-id');

            // //
            // // Show hidable label
            // //
            // //$(this).find('.wgst-hidable-controls').addClass('wgst--hide-this');
            // //$(this).find('.wgst-hidable-toggle').removeClass('wgst--hide-this');

            // //
            // //
            // //
            // // Panel or fullscreen?
            // //
            // //
            // //
            // var $activeControl = $(this).find('.wgst-hidable-controls .wgst-hidable--active');
            // var containerType = $activeControl.closest('a').attr('class');

            // //
            // // If fullscreen
            // //
            // if (containerType === 'wgst-hidable-fullscreen') {

            //     window.WGST.exports.bringFullscreenToBack(hidableId);

            // }

        });


        //
        //
        //
        //
        // Handle hidable control events
        //
        //
        //
        //

        $('body').on('click', '[data-wgst-hidable-button="fullscreen"]', function(event){

            event.stopPropagation();

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            console.log('A1');

            //
            // Check if panel exists
            //
            if ($('.wgst-panel[data-panel-id="' + hidableId + '"]').length > 0) {

            console.log('A2');


                //
                // Maximize panel
                //
                window.WGST.exports.maximizePanel(hidableId);

                // //
                // // Make this hidable active
                // //
                // $('.wgst-hidable[data-hidable-id="' + hidableId + '"]')
                //     .addClass('wgst-hidable--active');

                $(this).closest('[data-wgst-hidable-controls]').find('[data-wgst-hidable="fullscreen"]').addClass('wgst--hide-this');
                $(this).closest('[data-wgst-hidable-controls]').find('[data-wgst-hidable="panel"]').removeClass('wgst--hide-this');
            }

            event.preventDefault();
        });

        $('body').on('click', '[data-wgst-hidable-button="panel"]', function(event){

            event.stopPropagation();

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            //
            // Check if fullscreen exists
            //
            if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

                //
                // Bring fullscreen to panel
                //
                window.WGST.exports.bringFullscreenToPanel(hidableId);

                //
                // Show panel
                //
                window.WGST.exports.showPanel(hidableId);

                $(this).closest('[data-wgst-hidable-controls]').find('[data-wgst-hidable="fullscreen"]').removeClass('wgst--hide-this');
                $(this).closest('[data-wgst-hidable-controls]').find('[data-wgst-hidable="panel"]').addClass('wgst--hide-this');
            }

            event.preventDefault();
        });

        // $('body').on('click', '[data-wgst-hidable-button="toggle"]', function(event){

        //     event.stopPropagation();

        //     var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

        //     //
        //     // Check if panel exists
        //     //
        //     if ($('.wgst-panel[data-panel-id="' + hidableId + '"]').length > 0) {

        //         //
        //         // Toggle panel
        //         //
        //         window.WGST.exports.togglePanel(hidableId);

        //         //
        //         // Bring panel to front
        //         //
        //         window.WGST.exports.bringPanelToFront(hidableId);

        //     //
        //     // Check if fullscreen exists
        //     //
        //     } else if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

        //         //
        //         // Toggle fullscreen
        //         //
        //         window.WGST.exports.toggleFullscreen(hidableId);
        //     }

        //     event.preventDefault();
        // });

        $('body').on('click', '[data-wgst-hidable-button="show"]', function(event){

            event.stopPropagation();

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            //
            // Check if panel exists
            //
            if ($('.wgst-panel[data-panel-id="' + hidableId + '"]').length > 0) {

                //
                // Show panel
                //
                window.WGST.exports.showPanel(hidableId);

                //
                // Bring panel to front
                //
                window.WGST.exports.bringPanelToFront(hidableId);

            //
            // Check if fullscreen exists
            //
            } else if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

                //
                // Show fullscreen
                //
                window.WGST.exports.showFullscreen(hidableId);
            }

            event.preventDefault();
        });

        $('body').on('click', '[data-wgst-hidable-button="hide"]', function(event){

            event.stopPropagation();

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            //
            // Check if panel exists
            //
            if ($('.wgst-panel[data-panel-id="' + hidableId + '"]').length > 0) {

                //
                // Show panel
                //
                window.WGST.exports.hidePanel(hidableId);

                //
                // Bring panel to front
                //
                //window.WGST.exports.bringPanelToFront(hidableId);

            //
            // Check if fullscreen exists
            //
            } else if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

                //
                // Hide fullscreen
                //
                window.WGST.exports.hideFullscreen(hidableId);
            }

            event.preventDefault();
        });

        $('body').on('click', '[data-wgst-hidable-button="close"]', function(event){

            event.stopPropagation();

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            //
            // Check if container exists
            //
            if (window.WGST.exports.isContainerExists(hidableId)) {

                //
                // Remove container
                //
                window.WGST.exports.removeContainer(hidableId);

            }

            //
            // Remove hidable
            //
            window.WGST.exports.removeHidable(hidableId);

            event.preventDefault();
        });

        $('body').on('click', '[data-wgst-hidable-button="focus"]', function(event){

            event.stopPropagation();

            var hidableId = $(this).closest('.wgst-hidable').attr('data-hidable-id');

            var $panel = $('.wgst-panel[data-panel-id="' + hidableId + '"]');

            //
            // Check if panel exists
            //
            if ($panel.length > 0) {

                //
                // Hide all other panels
                //
                var panelId;

                $('.wgst-panel').each(function(){
                    panelId = $(this).attr('data-panel-id');

                    if (panelId !== hidableId) {
                        window.WGST.exports.hidePanel(panelId);
                    }
                });

                //
                // Check if panel hidden
                //
                if ($panel.hasClass('wgst--hide-this') || $panel.hasClass('wgst--invisible-this')) {

                    //
                    // Show panel
                    //
                    window.WGST.exports.showPanel(hidableId);
                }

            //
            // Check if fullscreen exists
            //
            } else if ($('.wgst-fullscreen[data-fullscreen-id="' + hidableId + '"]').length > 0) {

                //
                // Hide all panels
                //
                $('.wgst-panel').each(function(){
                    panelId = $(this).attr('data-panel-id');

                    window.WGST.exports.hidePanel(panelId);
                });

                //
                // Show fullscreen
                //
                window.WGST.exports.showFullscreen(hidableId);
            }

            event.preventDefault();
        });

        //
        //
        //
        //
        // Update hidables state
        //
        //
        //
        //

        window.WGST.exports.happenedPanelToFullscreen = function(panelId) {

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="panel"]').removeClass('wgst--hide-this');

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="fullscreen"]').addClass('wgst--hide-this');
        };

        window.WGST.exports.happenedFullscreenToPanel = function(fullscreenId) {

            $('.wgst-hidable[data-hidable-id="' + fullscreenId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="panel"]').addClass('wgst--hide-this');

            $('.wgst-hidable[data-hidable-id="' + fullscreenId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="fullscreen"]').removeClass('wgst--hide-this');
        };

        window.WGST.exports.happenedCreatePanel = function(options) {
            //
            // Create hidable
            //
            window.WGST.exports.createHidable(options.panelId, options.panelLabel);
        };

        window.WGST.exports.happenedHidePanel = function(panelId) {

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="show"]').removeClass('wgst--hide-this');

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="hide"]').addClass('wgst--hide-this');
        };

        window.WGST.exports.happenedShowPanel = function(panelId) {

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="hide"]').removeClass('wgst--hide-this');

            $('.wgst-hidable[data-hidable-id="' + panelId + '"]')
                .find('.wgst-hidable-controls')
                .find('[data-wgst-hidable-button="show"]').addClass('wgst--hide-this');
        };

        window.WGST.exports.happenedRemovePanel = function(panelId) {
            //
            // Remove hidable
            //
            window.WGST.exports.removeHidable(panelId);
        };

        window.WGST.exports.happenedCreateFullscreen = function(options) {
            //
            // Create hidable
            //
            window.WGST.exports.createHidable(options.fullscreenId, options.fullscreenLabel);
        };

        window.WGST.exports.happenedHideFullscreen = function(fullscreenId) {
            window.WGST.exports.happenedHidePanel(fullscreenId);
        };

        window.WGST.exports.happenedShowFullscreen = function(fullscreenId) {
            window.WGST.exports.happenedShowPanel(fullscreenId);
        };

        window.WGST.exports.happenedRemoveFullscreen = function(fullscreenId) {
            //
            // Remove hidable
            //
            window.WGST.exports.removeHidable(fullscreenId);
        };

	})();

});
window.WGST = window.WGST || {};

$(function() {

	if (! window.chrome) {
		//$('.wgst-landing-buttons').hide();
		$('.wgst-chrome-only').removeClass('wgst--hide-this');
	}

});
$(function(){

	(function(){

		var openedInfoWindow,
			clickedMarkerAssemblyIds = [];

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

	    var createGroupInfoWindow = function(collectionId, groupAssemblies) {

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

			var groupAssemblyIds = groupAssemblies.map(function(assembly){
				return assembly.ASSEMBLY_METADATA.assemblyId;
			});

			//
			// Handle closeclick event
			//
			google.maps.event.addListener(infoWindow, "closeclick", function() {
				//
				// Reset highlighted tree nodes
				//
				if (typeof clickedMarkerAssemblyIds.length !== 0) {
					window.WGST.collection[collectionId].tree['COLLECTION_TREE'].canvas.setNodeColourAndShape(groupAssemblyIds, null, 'o', null, null);
				}
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
	        var groupInfoWindow = createGroupInfoWindow(collectionId, groupAssemblies);

	        //
	        // Handle marker click - open info window
	        //
			google.maps.event.addListener(window.WGST.geo.map.markers.group[groupPositionString].marker, 'click', function() {
				//
				// Close previously opened info window
				//
				if (typeof openedInfoWindow !== 'undefined') {
					openedInfoWindow.close();
					google.maps.event.trigger(openedInfoWindow, 'closeclick');
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
				//window.WGST.collection[collectionId].tree['COLLECTION_TREE'].canvas.selectNodes(groupAssemblyIds);
				window.WGST.collection[collectionId].tree['COLLECTION_TREE'].canvas.setNodeColourAndShape(groupAssemblyIds, null, 't', null, null); // '#00ffff'
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
$(function(){

	$('[data-navigation-id="feedback"]').on('click', function(event){

		window.WGST.exports.createOverlay('feedback');

		event.preventDefault();
	});















	// $('.wgst-navigation__collection-panels').on('click', function(event) {
	// 	event.preventDefault();
	// });

	// //
	// // Data
	// //

	// $('.wgst-navigation__collection-data').on('click', function(event) {
	// 	console.debug('wgst-navigation-item__collection-data');

	// 	window.WGST.openPanel('collection');
	// 	event.preventDefault();
	// });

	// //
	// // Close data
	// // 

	// $('.wgst-navigation__close-collection-data').on('click', function(event){
	// 	console.debug('wgst-navigation__close-collection-data');

	// 	$('[data-panel-name="collection"] .wgst-panel-control-button__close').trigger('click');
	// 	event.preventDefault();
	// });

	// //
	// // Tree
	// //

	// $('.wgst-navigation__collection-tree').on('click', function(event) {
	// 	console.debug('wgst-navigation-item__collection-tree');
	// 	console.debug('Opened collection id: ' + WGST.collection.opened);

	// 	window.WGST.openPanel('collectionTree__' + WGST.collection.opened + '__CORE_TREE_RESULT');
	// 	event.preventDefault();
	// });

	// //
	// // Close tree
	// //

	// $('.wgst-navigation__close-collection-tree').on('click', function(event){
	// 	console.debug('wgst-navigation__close-collection-tree');

	// 	$('[data-panel-id="' + 'collectionTree__' + WGST.collection.opened + '__CORE_TREE_RESULT' + '"] .wgst-panel-control-button__close').trigger('click');
	// 	event.preventDefault();
	// });

	// //
	// // Map
	// //

	// $('.wgst-navigation__collection-map').on('click', function(event) {
	// 	console.debug('wgst-navigation-item__collection-map');

	// 	window.WGST.openPanel('map');
	// 	event.preventDefault();
	// });

	// //
	// // Close map
	// // 

	// $('.wgst-navigation__close-collection-map').on('click', function(event){
	// 	console.debug('wgst-navigation__close-collection-map');

	// 	$('[data-panel-name="map"] .wgst-panel-control-button__close').trigger('click');
	// 	event.preventDefault();
	// });






 //    window.WGST.exports.isNavItemEnabled = function(navItemName) {
 //        var navItem = $('.wgst-navigation-item__' + navItemName);

 //        if (navItem.hasClass('wgst-navigation-item--active')) {
 //            return true;
 //        } else {
 //            return false;
 //        }
 //    };

 //    window.WGST.exports.disableNavItem = function(navItemName) {
 //        var navItem = $('.wgst-navigation-item__' + navItemName);

 //        if (window.WGST.exports.isNavItemEnabled(navItemName)) {
 //            navItem.removeClass('wgst-navigation-item--active');
 //        }
 //    };

 //    window.WGST.exports.enableNavItem = function(navItemName) {
 //        var navItem = $('.wgst-navigation-item__' + navItemName);

 //        if (! window.WGST.exports.isNavItemEnabled(navItemName)) {
 //            navItem.addClass('wgst-navigation-item--active');
 //        }
 //    };

});
$(function(){

	(function(){

        window.WGST.exports.mapOverlayTypeToTemplateId = {
        	'feedback': 'feedback-overlay'
        };

        window.WGST.exports.createOverlay = function(overlayType, templateContext) {

        	//
        	// Check if overlay already exists
        	//
        	if ($('.wgst-overlay[data-overlay-id="' + overlayType + '"]').length > 0) {
        		return;
        	}

        	//
        	// Check if template context was passed
        	//
        	if (typeof templateContext === 'undefined') {
        		templateContext = {};
        	}

            var templateId = window.WGST.exports.mapOverlayTypeToTemplateId[overlayType],
                overlayTemplateSource = $('.wgst-template[data-template-id="' + templateId + '"]').html(),
                overlayTemplate = Handlebars.compile(overlayTemplateSource),
                overlayHtml = overlayTemplate(templateContext);

            $('.wgst-page__app').prepend(overlayHtml);
        };

        window.WGST.exports.removeOverlay = function(overlayId) {
        	$('.wgst-overlay[data-overlay-id="' + overlayId + '"]').remove();
        };

        $('body').on('click', '.wgst-close-overlay', function(event){
        	var overlayId = $(this).closest('.wgst-overlay').attr('data-overlay-id');

        	window.WGST.exports.removeOverlay(overlayId);

        	event.preventDefault();
        });

	})();

});
$(function(){

	(function(){

        window.WGST.exports.mapPanelTypeToPanelHeaderTemplateId = {
            'assembly': 'panel-header__assembly',
            'collection-data': 'panel-header__collection-data',
            'collection-tree': 'panel-header__collection-tree',
            'collection-map': 'panel-header__collection-map',
            'assembly-upload-metadata': 'panel-header__assembly-upload-metadata',
            'assembly-upload-navigation': 'panel-header__assembly-upload-navigation',
            'assembly-upload-analytics': 'panel-header__assembly-upload-analytics',
            'assembly-upload-progress': 'panel-header__assembly-upload-progress'
        };

        window.WGST.exports.mapPanelTypeToPanelBodyTemplateId = {
            'assembly': 'panel-body__assembly',
            'collection-data': 'panel-body__collection-data',
            'collection-tree': 'panel-body__collection-tree',
            'collection-map': 'panel-body__collection-map',
            'assembly-upload-metadata': 'panel-body__assembly-upload-metadata',
            'assembly-upload-navigation': 'panel-body__assembly-upload-navigation',
            'assembly-upload-analytics': 'panel-body__assembly-upload-analytics',
            'assembly-upload-progress': 'panel-body__assembly-upload-progress'
        };

        window.WGST.exports.mapPanelTypeToPanelButtonRules = {
            'assembly': {
                //noFullscreenButton: true
            },
            'collection-data': {
                noCloseButton: true
            },
            'collection-tree': {
                //noFullscreenButton: true,
                noCloseButton: true
            },
            'collection-map': {
                noCloseButton: true
            },
            'assembly-upload-metadata': {
                noFullscreenButton: true,
                noCloseButton: true
            },
            'assembly-upload-navigation': {
                noFullscreenButton: true,
                noCloseButton: true
            },
            'assembly-upload-analytics': {
                noFullscreenButton: true,
                noCloseButton: true
            },
            'assembly-upload-progress': {
                noCloseButton: true
            }
        };

        window.WGST.exports.createPanel = function(panelType, templateContext) {
            console.log('createPanel()');
            console.log('panelType:' + panelType);
            console.dir(templateContext);

        	//
        	// Check if panel already exists
        	//
        	if ($('.wgst-panel[data-panel-id="' + templateContext.panelId + '"]').length > 0) {

        		//
        		// Show panel
        		//
        		window.WGST.exports.showPanel(templateContext.panelId);

                //
                // And do nothing else
                //
        		return;
        	}

            //
            // Extend template context with panel button rules
            //
            $.extend(templateContext, window.WGST.exports.mapPanelTypeToPanelButtonRules[panelType]);

            //
            // Get container's label
            //
            if (typeof templateContext.panelLabel === 'undefined') {

                //templateContext.panelLabel = templateContext.assemblyUserId;
                templateContext.panelLabel = window.WGST.exports.getContainerLabel({
                    containerName: 'panel', 
                    containerType: panelType,
                    containerId: templateContext.panelId,
                    additional: templateContext
                    //containerContext: templateContext
                });
            }

        	//
        	// Render
        	//
            var //templateId = window.WGST.exports.mapPanelTypeToTemplateId[panelType],
                panelTemplateSource = $('.wgst-template[data-template-id="panel"]').html(),
                panelTemplate = Handlebars.compile(panelTemplateSource);


            //
            // Panel's header
            //
            var panelHeaderTemplateId = window.WGST.exports.mapPanelTypeToPanelHeaderTemplateId[panelType];
            Handlebars.registerPartial('header', $('.wgst-template[data-template-id="' + panelHeaderTemplateId + '"]').html());

            //
            // Panel's body
            //
            var panelBodyTemplateId = window.WGST.exports.mapPanelTypeToPanelBodyTemplateId[panelType];
            Handlebars.registerPartial('body', $('.wgst-template[data-template-id="' + panelBodyTemplateId + '"]').html());

            //
            // Html
            //
            var panelHtml = panelTemplate(templateContext);
            $('.wgst-workspace').prepend(panelHtml);

        	//
        	// Init jQuery UI draggable interaction
        	//
            var $panel = $('.wgst-panel[data-panel-id="' + templateContext.panelId + '"]');

	        $panel.draggable({
	            handle: $panel.find('.wgst-draggable-handle'),
	            appendTo: ".wgst-page__app",
	            scroll: false//,
	            //stop: function(event, ui) {
	                // // Store current panel position
	                // var panelName = ui.helper.attr('data-panel-name');
	                // WGST.panels[panelName].top = ui.position.top;
	                // WGST.panels[panelName].left = ui.position.left;
	            //}
	        });

            //
            // Notify hidable
            //
            window.WGST.exports.happenedCreatePanel({
                panelId: templateContext.panelId,
                panelLabel: templateContext.panelLabel
            });
        };

        window.WGST.exports.removePanel = function(panelId) {
        	$('.wgst-panel[data-panel-id="' + panelId + '"]').remove();

            //
            // Notify hidable
            //
            window.WGST.exports.happenedRemovePanel(panelId);

            if (panelId === 'collection-map') {

                //
                // Remove map
                //
                window.WGST.geo.map.remove();
            }
        };

        window.WGST.exports.showPanel = function(panelId) {
        	$('.wgst-panel[data-panel-id="' + panelId + '"]').removeClass('wgst--hide-this wgst--invisible-this');

            // if (panelId === 'collection-map') {
            //     google.maps.event.trigger(window.WGST.geo.map.canvas, 'resize');
            // }

        	//
        	// Update hidable state
        	//
            window.WGST.exports.happenedShowPanel(panelId);
        };

        window.WGST.exports.hidePanel = function(panelId) {
        	//$('.wgst-panel[data-panel-id="' + panelId + '"]').addClass('wgst--hide-this wgst--invisible-this');
            $('.wgst-panel[data-panel-id="' + panelId + '"]').addClass('wgst--invisible-this');

        	//
        	// Update hidable state
        	//
        	window.WGST.exports.happenedHidePanel(panelId);
        };

        window.WGST.exports.isPanelExists = function(panelId) {
            if ($('.wgst-panel[data-panel-id="' + panelId + '"]').length > 0) {
                return true;
            } else {
                return false;
            }
        };

        window.WGST.exports.togglePanel = function(panelId) {
        	var $panel = $('.wgst-panel[data-panel-id="' + panelId + '"]');

    		//
    		// Toggle panel
    		//
    		if ($panel.is('.wgst--hide-this, .wgst--invisible-this')) {

        		//
        		// Show panel
        		//
        		window.WGST.exports.showPanel(panelId);

    		} else {

        		//
        		// Hide panel
        		//
        		window.WGST.exports.hidePanel(panelId);

    		}
        };

	    window.WGST.exports.bringPanelToFront = function(panelId) {
            window.WGST.exports.bringContainerToFront('panel', panelId);
	    };

	    window.WGST.exports.maximizePanel = function(panelId) {

	        var fullscreenId = $('.wgst-fullscreen').attr('data-fullscreen-id');

            console.log('Test');

	        //
	        // Bring fullscreen into panel
	        //
	        window.WGST.exports.bringFullscreenToPanel(fullscreenId);

            //
            // Hide panel
            //
            window.WGST.exports.hidePanel(fullscreenId);

	        //
	        // Bring panel into fullscreen
	        //
	        window.WGST.exports.bringPanelToFullscreen(panelId);

            google.maps.event.trigger(window.WGST.geo.map.canvas, 'resize');

	    };

        $('body').on('click', '[data-panel-header-control-button="fullscreen"]', function(){
            var $panel = $(this).closest('.wgst-panel'),
                panelId = $panel.attr('data-panel-id');

                console.log('X');
                console.log('panelId: ' + panelId);

            $('[data-hidable-id="' + panelId + '"]').find('[data-wgst-hidable-button="fullscreen"]').trigger('click');

        });

		$('body').on('click', '[data-panel-header-control-button="close"]', function(){
			var $panel = $(this).closest('.wgst-panel'),
				panelId = $panel.attr('data-panel-id');

            $('[data-hidable-id="' + panelId + '"]').find('[data-wgst-hidable-button="close"]').trigger('click');

		});

        $('body').on('click', '[data-panel-header-control-button="hide"]', function(){
            var $panel = $(this).closest('.wgst-panel'),
                panelId = $panel.attr('data-panel-id');

            $('[data-hidable-id="' + panelId + '"]').find('[data-wgst-hidable-button="hide"]').trigger('click');

        });

		//
	    // Bring to front selected panel
	    //
	    $('body').on('mousedown', '.wgst-panel', function(){
	        window.WGST.exports.bringPanelToFront($(this).attr('data-panel-id'));
	    });

	})();

});
$(function(){

	(function(){

		window.WGST.exports.showSidebar = function() {
			//$('.wgst-sidebar').removeClass('wgst--hide-this');
			$('[data-wgst-sidebar]').removeClass('wgst--hide-this');
		};

		window.WGST.exports.hideSidebar = function() {
			//$('.wgst-sidebar').addClass('wgst--hide-this');
			$('[data-wgst-sidebar]').addClass('wgst--hide-this');
		};

	})();

});
$(function(){

	(function(){

        //
        // Subscribe form
        //
        $('body').on('submit', '[data-form="subscribe"]', function(event){
            console.log('[WGST] Submitting subscribe form...');

            event.preventDefault();

            var $form = $('[data-form="subscribe"]'),
                email = $form.find('[data-input="email"]').val();

            //
            // Validate
            //
            if (typeof email === 'undefined' || email === '') {
                console.error('[WGST][Validation][Error] ✗ No email');
                return;
            }

            var $button = $(this).find('[type="submit"]');

            $button.prop('disabled', true);
            $button.find('span').addClass('wgst--hide-this');
            $button.find('.wgst-spinner').removeClass('wgst--hide-this');


            var result = {
                email: email
            };

            console.dir(result);

            //
            // Submit subsription
            //
            $.ajax({
                type: 'POST',
                url: '/subscribe/',
                // http://stackoverflow.com/a/9155217
                datatype: 'json',
                data: result
            })
            .done(function(data, textStatus, jqXHR) {
                console.log('[WGST] Subscribed');

                $button.addClass('wgst--hide-this');

                $('.wgst-subscribe-success-message').removeClass('wgst--hide-this');

            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log('[WGST][Error] Failed to subscribe');
                console.error(textStatus);
                console.error(errorThrown);
                console.error(jqXHR);
            });
        });

	})();

});
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
//
// http://stackoverflow.com/a/7592235
//
String.prototype.capitalize = function() {
	return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

//
// Email regex
//
window.WGST.regex = window.WGST.regex || {};
window.WGST.regex.EMAIL = /^(([^<>()[]\.,;:s@"]+(.[^<>()[]\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;
$(function(){

	window.WGST = window.WGST || {};
	window.WGST.exports = window.WGST.exports || {};
	window.WGST.exports.mixpanel = window.WGST.exports.mixpanel || {};

	//
	// Landing page
	//

	$('[data-mixpanel-open-collection="Reference"]').on('click', function(){
		mixpanel.track("Landing > Open reference collection");
	});

	$('[data-mixpanel-open-collection="ST239"]').on('click', function(){
		mixpanel.track("Landing > Open ST239 collection");
	});

	$('[data-mixpanel-open-collection="EMRSA15"]').on('click', function(){
		mixpanel.track("Landing > Open EMRSA15 collection");
	});

	$('[data-mixpanel-button="subscribe"]').on('click', function(){
		mixpanel.track("Landing > Open EMRSA15 collection");
	});

	//
	// App page
	//

	$('body').on('click', '[data-mixpanel-navigation="feedback"]', function(){
		mixpanel.track("App > Open feedback");
	});

	$('body').on('click', '[data-mixpanel-navigation="landing"]', function(){
		mixpanel.track("App > Go to landing page");
	});

	$('body').on('click', '[data-mixpanel-show-tree-button="CORE_TREE_RESULT"]', function(){
		mixpanel.track("App | Collection Data Panel > Open CORE_TREE_RESULT tree");
	});

	$('body').on('click', '[data-mixpanel-open-assembly-panel]', function(){
		if ($(this).is('[title]')) {
			var userAssemblyId = $(this).attr('title');
			mixpanel.track("App | Collection Data Panel > Open assembly");
			mixpanel.track("App | Collection Data Panel > Open assembly " + userAssemblyId);
		}
	});

	window.WGST.exports.mixpanel.submitFeedback = function() {
		mixpanel.track("App > Submit feedback");
	}

	//
	// 404 page
	//
	
	$('[data-mixpanel-not-found-navigation="homepage"]').on('click', function(){
		mixpanel.track("404 > Go to landing page");
	});

});
$(function(){

	(function(){

		//
		// Store data that is ready for upload
		//
		window.WGST.upload = {
		    collection: {},
		    assembly: {},
		    fastaAndMetadata: {},
		    stats: {
		        totalNumberOfContigs: 0
		    }
		};

		//
		// Store data that was dragged and dropped
		//
	    window.WGST.dragAndDrop = {
	    	//
	    	// Deprecate files: []
	    	//
	    	files: [],
	    	droppedFiles: [],
	    	droppedValidFiles: [],
	    	loadedFiles: [],
	    	fastaFileNameRegex: /^.+(.fa|.fas|.fna|.ffn|.faa|.frn|.fasta|.contig)$/i,
	    	csvFileTypeRegex: /^.+(.csv)$/i
	    };

	    window.WGST.exports.initFastaAndMetadata = function(assemblyFileId) {
	    	//
	    	// Only create data structure if it doesn't exist
	    	//
	    	if (typeof window.WGST.upload.fastaAndMetadata[assemblyFileId] !== 'undefined') {
	    		return;
	    	}

	    	//
	    	// Init data structure
	    	//
	    	window.WGST.upload.fastaAndMetadata[assemblyFileId] = {
	    		fasta: {
	    			name: assemblyFileId,
	    			assembly: ''
	    		},
	    		metadata: {}
	    	};
	    };

	    // window.WGST.dragAndDrop.files = [];
	    // window.WGST.dragAndDrop.loadedFiles = [];
	    // window.WGST.dragAndDrop.fastaFileNameRegex = /^.+(.fa|.fas|.fna|.ffn|.faa|.frn|.fasta|.contig)$/i;
	    // window.WGST.dragAndDrop.csvFileTypeRegex = /csv/;

	    var numberOfDroppedFastaFiles = 0,
	        numberOfParsedFastaFiles = 0;

		var handleDragEnter = function(event) {
			var $dragAndDropBackground = $('[data-wgst-background-id="drag-and-drop"]');

		    $dragAndDropBackground.find('.wgst-drag-and-drop-content').addClass('wgst-drag-over');
		    $dragAndDropBackground.find('.wgst-drag-and-drop-content').find('.fa').addClass('animated bounce');
		};

		var handleDragOver = function(event) {
		    if (event.preventDefault) {
		    	event.preventDefault();
		    }

		    //
		    // Explicitly show this is a copy
		    //
		    event.dataTransfer.dropEffect = 'copy';

		    return false;
		};

		var handleDragLeave = function(event) {
			var $dragAndDropBackground = $('[data-wgst-background-id="drag-and-drop"]');

		    $dragAndDropBackground.find('.wgst-drag-and-drop-content').removeClass('wgst-drag-over');
		    $dragAndDropBackground.find('.wgst-drag-and-drop-content').find('.fa').removeClass('animated bounce');
		};

        var extractCsvFileContent = function(file) {
            var csvString = file.content;

            var results = Papa.parse(csvString, {
                header: true,
                dynamicTyping: true
            });

            return results.data;
        };

        var __validateAssemblyMetadata = function(assemblyMetadata) {

            var validatedAssemblyMetadata = {
                valid: {},
                invalid: {}
            };

            for (metadata in assemblyMetadata) {
                if (assemblyMetadata.hasOwnProperty(metadata)) {

                    if (metadata === 'filename') {

                    }

                }
            }

            //
            // Assembly metadata must have an assembly file id
            //
            if (typeof assemblyMetadata.filename === 'undefined') {
                return;
            }

            return validatedAssemblyMetadata;
        };

        var setAssemblyMetadataFormDate = function(assemblyFileId, assemblyMetadataDate) {

            var assemblyDate = moment(assemblyMetadataDate);

            //
            // Validate date
            //
            if (! assemblyDate.isValid()) {
                console.error('[WGST] Invalid assembly metadata date: ' + assemblyMetadataDate);
                return;
            }

            //
            // Set year form value
            //
            var year = assemblyDate.year();

            $('.wgst-upload-assembly__metadata[data-assembly-file-id="' + assemblyFileId + '"]')
                .find('[data-timestamp-input="year"]')
                .val(year)
                .change();

            //
            // Set month form value
            //
            var month = assemblyDate.month();

            $('.wgst-upload-assembly__metadata[data-assembly-file-id="' + assemblyFileId + '"]')
                .find('[data-timestamp-input="month"]')
                .val(month)
                .change();

            //
            // Set date form value
            //
            var date = assemblyDate.date();

            $('.wgst-upload-assembly__metadata[data-assembly-file-id="' + assemblyFileId + '"]')
                //
                // To do: rename "day" to "date"
                //
                .find('[data-timestamp-input="day"]')
                .val(date)
                .change();
        };

        var setAssemblyMetadataFormLocation = function(assemblyFileId, assemblyMetadataAddress) {

            var address = assemblyMetadataAddress;

            var geocoder = new google.maps.Geocoder();

            geocoder.geocode({'address': address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    var result = results[0];

                    console.debug('Geocoder results:');
                    console.dir(result);

                    var formattedAddress = result.formatted_address,
                        latitude = result.geometry.location.lat(),
                        longitude = result.geometry.location.lng();

                    // console.log('Assembly metadata form:');
                    // console.dir({
                    //     formattedAddress: formattedAddress,
                    //     latitude: latitude,
                    //     longitude: longitude
                    // });

                    $('.wgst-upload-assembly__metadata[data-assembly-file-id="' + assemblyFileId + '"]')
                        .find('.assembly-sample-location-input')
                        .val(formattedAddress)
                        .change();

                    //
                    // Set model
                    //
                    window.WGST.exports.setAssemblyUploadMetadataModel(assemblyFileId, 'geography', {
                        address: formattedAddress,
                        position: {
                            latitude: latitude,
                            longitude: longitude
                        },
                        // https://developers.google.com/maps/documentation/geocoding/#Types
                        type: 'Unknown'
                    });

                    window.WGST.exports.updateMetadataProgressBar();

                } else {
                    console.error('[WGST] Could not geocode address: ' + assemblyMetadataAddress);
                }
            });
        };

        var setAssemblyMetadataFormSource = function(assemblyFileId, assemblyMetadataSource) {

            var source = assemblyMetadataSource;

            $('.wgst-upload-assembly__metadata[data-assembly-file-id="' + assemblyFileId + '"]')
                .find('.assembly-sample-source-input')
                .val(source)
                .change();
        };

        var addAssemblyToNavigation = function(assemblyFileId) {
            //
            // Only add if it doesn't exist
            //
            if ($('.wgst-dropped-assembly-list').find('option[value="' + assemblyFileId + '"]').length === 0) {
                //
                // Add assembly to the drop down select of dropeed assemblies
                //
                $('.wgst-dropped-assembly-list').append(
                    '<option value="' + assemblyFileId + '">' + assemblyFileId + '</option>'
                );
            }
        };

        var showAllAssemblyMetadataBlocks = function() {
            //
            // Show all metadata input elements
            //
            $('.wgst-assembly-metadata-block').removeClass('wgst--hide-this');
        };

		var parseCsvFile = function(file) {
	        console.log('[WGST] Parsing CSV file: ' + file.name);
	        console.dir(file);

            var metadata = extractCsvFileContent(file);

            console.log('CSV data result:');
            console.dir(metadata);

            //
            // Iterate and parse each row of metadata
            //
            metadata.map(function(assemblyMetadata) {

                //
                //
                //
                // Validate assembly metadata
                //
                //
                //

                //
                // Assembly metadata must have an assembly file id
                //
                if (typeof assemblyMetadata.filename === 'undefined') {
                    console.error('[WGST] Invalid assembly filename in metadata file ' + file.name);
                    return;
                }

                var assemblyFileId = assemblyMetadata.filename;

                //
                // Prepare data structure
                //
                window.WGST.exports.initFastaAndMetadata(assemblyFileId);

                //
                // Metadata
                //
                window.WGST.exports.renderAssemblyMetadataForm(assemblyFileId);
                window.WGST.exports.initAssemblyMetadataLocation(assemblyFileId);

                //
                // Date
                //
                if (typeof assemblyMetadata.date !== 'undefined') {
                    setAssemblyMetadataFormDate(assemblyFileId, assemblyMetadata.date);
                }

                //
                // Location
                //
                if (typeof assemblyMetadata.location !== 'undefined') {
                    setAssemblyMetadataFormLocation(assemblyFileId, assemblyMetadata.location);
                }

                //
                // Source
                //
                if (typeof assemblyMetadata.source !== 'undefined') {
                    setAssemblyMetadataFormSource(assemblyFileId, assemblyMetadata.source);
                }

                showAllAssemblyMetadataBlocks();

                //
                // Navigation
                //
                addAssemblyToNavigation(assemblyFileId);
            });
		};

		var __handleCsvDrop = function(file) {
	        console.log('[WGST] Dropped CSV file: ' + file.name);
	        console.dir(file);

	        var fileReader = new FileReader();

            // fileReader.addEventListener('load', function(event){
            //     console.log('[WGST] Loaded csv file ' + event.target);
            //     console.dir(fileReader);

            // });

            fileReader.onload = function(event){
                console.log('[WGST] Loaded CSV file: ' + file.name);
                console.dir(fileReader.result);

                var csvString = fileReader.result;

                var results = Papa.parse(csvString, {
                	header: true,
                	dynamicTyping: true
                });

                var metadata = results.data;

                console.log('CSV data result:');
                console.dir(results.data);

                //
                // Iterate and parse each row of metadata
                //
                metadata.map(function(assemblyMetadata) {

                	//
                	// Assembly metadata must have an assembly file id
                	//
                	if (typeof assemblyMetadata.filename === 'undefined') {
                		return;
                	}

                	var assemblyFileId = assemblyMetadata.filename;

                	//
                	// Validate mandatory metadata: date, location
                	//

                	//
                	// Validate date
                	//
                	if (typeof assemblyMetadata.date !== 'undefined') {
                		//
                		// Update model
                		//
                		window.WGST.exports.setAssemblyMetadataValue({
                			assemblyFileId: assemblyFileId,
                			assemblyMetadataKey: 'date',
                			assemblyMetadataValue: assemblyMetadata.date
                		});

                		return;

                		//
                		// Render date form
                		//
                		window.WGST.exports.renderAssemblyMetadataDateForm(assemblyFileId);
                	}

                	//
                	// Validate location
                	//
                	if (typeof assemblyMetadata.location !== 'undefined') {
                		
                	}



                	//
                	// Create view
                	//
	        		window.WGST.exports.renderAssemblyMetadataForm(assemblyFileId);

	        		//
	        		// Set metadata value on UI element
	        		//



                	//
                	// Parse date
                	//
                	// if (typeof assemblyMetadata.date !== 'undefined') {
                	// 	assemblyMetadata.date
                	// }

                	console.log('assemblyMetadata:');
                	console.dir(assemblyMetadata);
                });

            };

            fileReader.readAsText(file);
		};

		var __sortLoadedFilesByName = function() {
	        //
	        // Sort loaded files by name
	        //
	        window.WGST.dragAndDrop.loadedFiles.sort(function(a, b){
	            if (a.assemblyFileId > b.assemblyFileId) {
	                return 1;
	            } else if (a.assemblyFileId < b.assemblyFileId) {
	                return -1;
	            } else {
	                return 0;
	            }
	        });
		};

		var sortLoadedDroppedFilesByName = function(loadedDroppedFiles) {
	        //
	        // Sort loaded dropped files by name
	        //
	        loadedDroppedFiles.sort(function(a, b){
	            if (a.name > b.name) {
	                return 1;
	            } else if (a.name < b.name) {
	                return -1;
	            } else {
	                return 0;
	            }
	        });

	        return loadedDroppedFiles;
		};

		var parseFastaFile = function(file) {
	        console.log('[WGST] Parsing FASTA file: ' + file.name);
	        console.dir(file);

        	var assemblyFileId = file.name,
        		fastaFileString = file.content;

        	//
        	// Prepare data structure
        	//
        	window.WGST.exports.initFastaAndMetadata(assemblyFileId);

            //
            // Set fasta string
            //
        	window.WGST.upload.fastaAndMetadata[assemblyFileId].fasta.assembly = fastaFileString;

            //
            // Analytics
            //
            var fastaAnalysis = analyseFasta(assemblyFileId, fastaFileString);
	        window.WGST.exports.renderAssemblyAnalytics(assemblyFileId, fastaAnalysis);
	        //
	        // Draw N50 chart
	        //
	        window.WGST.exports.drawN50Chart(fastaAnalysis.sumsOfNucleotidesInDnaStrings, fastaAnalysis.assemblyN50Data, '.sequence-length-distribution-chart[data-assembly-file-id="' + assemblyFileId + '"]');

	        //
	        // Metadata
	        //
	        window.WGST.exports.renderAssemblyMetadataForm(assemblyFileId);
			window.WGST.exports.initAssemblyMetadataLocation(assemblyFileId);

            //
            // Navigation
            //
            addAssemblyToNavigation(assemblyFileId);
		};

		var __handleFastaDrop = function(file) {
	        console.log('[WGST] Dropped FASTA file: ' + file.name);
	        //console.dir(file);

	        var fileReader = new FileReader();

            fileReader.onload = function(event) {
                console.log('[WGST] Loaded FASTA file: ' + file.name);
                //console.dir(fileReader.result);

				//
                // Store loaded file
                //
                window.WGST.dragAndDrop.loadedFiles.push({
                	assemblyFileId: file.name,
                	fastaFileString: event.target.result
                });

				//
                // Wait until all files were loaded
                //
                if (window.WGST.dragAndDrop.loadedFiles.length === window.WGST.dragAndDrop.droppedValidFiles.length) {
                    
					console.log('[WGST] Loaded all ' + window.WGST.dragAndDrop.loadedFiles.length + ' FASTA files');

                    //
                    // Sort loaded files by name
                    //
                	sortLoadedFilesByName();

                    // WGST.dragAndDrop.loadedFiles.sort(function(a, b){
                    //     if (a.file.name > b.file.name) {
                    //         return 1;
                    //     } else if (a.file.name < b.file.name) {
                    //         return -1;
                    //     } else {
                    //         return 0;
                    //     }
                    // });

                    //
                    // Show sidebar
                    //
                    window.WGST.exports.showSidebar();

                    //
                    //
                    // Create assembly upload panels
                    //
                    //

                    //
                    // Create assembly upload navigation panel
                    //
                    window.WGST.exports.createPanel('assembly-upload-navigation', {
                    	panelType: 'assembly-upload-navigation',
                    	panelId: 'assembly-upload-navigation'
                    });
	                //
	                // Show panel
	                //
	                window.WGST.exports.showPanel('assembly-upload-navigation');

                    //
                    // Create assembly upload metadata panel
                    //
                    window.WGST.exports.createPanel('assembly-upload-metadata', {
                    	panelType: 'assembly-upload-metadata',
                    	panelId: 'assembly-upload-metadata'
                    });
	                //
	                // Show panel
	                //
	                window.WGST.exports.showPanel('assembly-upload-metadata');

                    //
                    // Create assembly upload analytics panel
                    //
                    window.WGST.exports.createPanel('assembly-upload-analytics', {
                    	panelType: 'assembly-upload-analytics',
                    	panelId: 'assembly-upload-analytics'
                    });
	                //
	                // Show panel
	                //
	                window.WGST.exports.showPanel('assembly-upload-analytics');

			        //
			        // Create map fullscreen
			        //
			        var fullscreenType = 'collection-map',
			            fullscreenId = fullscreenType;

			        window.WGST.exports.createFullscreen(fullscreenId, {
			            fullscreenType: fullscreenType,
			            fullscreenId: fullscreenId
			        });

			        //
			        // Show fullscreen
			        //
			        window.WGST.exports.showFullscreen(fullscreenId);

                    //
				    // Initialise map
				    //
			    	window.WGST.geo.map.init();

			        //
			        // Was map loaded?
			        //
				    //if (! window.WGST.geo.map.initilised) {

                        //
					    // Initialise map
					    //
				    	//window.WGST.geo.map.init();
				    //}

                    //
                    // Parse loaded files
                    //
                    window.WGST.dragAndDrop.loadedFiles.forEach(function(loadedFile){

                    	var assemblyFileId = loadedFile.assemblyFileId,
                    		fastaFileString = loadedFile.fastaFileString;

                    	window.WGST.exports.initFastaAndMetadata(assemblyFileId);
                    	
                    	window.WGST.upload.fastaAndMetadata[assemblyFileId].fasta.assembly = fastaFileString;

                        var fastaAnalysis = analyseFasta(assemblyFileId, fastaFileString);

				        window.WGST.exports.renderAssemblyAnalytics(assemblyFileId, fastaAnalysis);
				        window.WGST.exports.renderAssemblyMetadataForm(assemblyFileId);

				        //
				        // Draw N50 chart
				        //
				        window.WGST.exports.drawN50Chart(fastaAnalysis.sumsOfNucleotidesInDnaStrings, fastaAnalysis.assemblyN50Data, '.sequence-length-distribution-chart[data-assembly-file-id="' + assemblyFileId + '"]');

						window.WGST.exports.initAssemblyMetadataLocation(assemblyFileId);

                        // Add assembly to the drop down select of dropeed assemblies
                        $('.wgst-dropped-assembly-list').append(
                            '<option value="' + loadedFile.assemblyFileId + '">' + loadedFile.assemblyFileId + '</option>'
                        );
                    });

                    //
                    // Show first assembly
                    //
                    window.WGST.exports.showAssemblyUpload(WGST.dragAndDrop.loadedFiles[0].assemblyFileId);

                    //window.WGST.exports.showDroppedAssembly(WGST.dragAndDrop.loadedFiles[0].uid);
	                //window.WGST.exports.showAssemblyUploadAnalytics(WGST.dragAndDrop.loadedFiles[0].file.name);
	                //window.WGST.exports.showAssemblyUploadMetadata(WGST.dragAndDrop.loadedFiles[0].file.name);
                
		            //
		            // Hide drag and drop background
		            //
		            $('[data-wgst-background-id="drag-and-drop"]').addClass('wgst--hide-this');

		            //
		            // Reset files
		            //
					window.WGST.dragAndDrop.loadedFiles = [];
					window.WGST.dragAndDrop.droppedValidFiles = [];
                }

            };

            fileReader.readAsText(file);
		};

		var isFastaFile = function(file) {
			return file.name.match(window.WGST.dragAndDrop.fastaFileNameRegex);
		};

		var isCsvFile = function(file) {
			return file.name.match(window.WGST.dragAndDrop.csvFileTypeRegex);
		};

		var isValidFile = function(file) {
			if (isFastaFile(file) || isCsvFile(file)) {
				return true;
			}
			return false;
		};

		var validateDroppedFiles = function(droppedFiles) {
			var results = {
				validFiles: [],
				invalidFiles: []
			};

            //
            // Validate dropped file types
            //
            var fileCounter = droppedFiles.length,
            	file;

            for (; fileCounter !== 0;) {
            	fileCounter = fileCounter - 1;

            	file = droppedFiles[fileCounter];

            	if (isValidFile(file)) {
            		results.validFiles.push(file);
            	} else {
            		results.invalidFiles.push(file);
            	}
            }

            return results;
		};

		var loadDroppedFile = function(file, callback) {
	        console.log('[WGST] Loading dropped file: ' + file.name);
	        //console.dir(file);

	        var fileReader = new FileReader();

            fileReader.onload = function(event) {
                console.log('[WGST] Loaded dropped file: ' + file.name);
                //console.dir(fileReader.result);

                callback(null, event.target.result);

            };

            fileReader.readAsText(file);
		};

		var loadDroppedFiles = function(droppedFiles, callback) {

			var loadedDroppedFiles = [];

            droppedFiles.map(function(file){

            	loadDroppedFile(file, function(error, fileContent){
            		
            		if (error) {
            			console.error('[WGST] Failed to load dropped file: ' + error);
            			return;
            		}

            		//
            		// Store loaded file's content
            		//
            		loadedDroppedFiles.push({
	    				name: file.name,
	    				content: fileContent
            		});

            		//
            		// All files have been loaded
            		//
            		if (loadedDroppedFiles.length === droppedFiles.length) {
            			callback(null, loadedDroppedFiles);
            		}
            	});

            });
		};

        var getNameOfTheFirstFile = function(sortedLoadedDroppedFiles) {

            var firstFile = sortedLoadedDroppedFiles[0],
                firstFileName = 'Unknown';

            //
            // Csv
            //
            if (isCsvFile(firstFile)) {

                var metadata = extractCsvFileContent(firstFile);

                //
                // Get file name from the first metadata row
                //
                firstFileName = metadata[0].filename;

            //
            // Fasta
            //
            } else if (isFastaFile(firstFile)) {

                firstFileName = sortedLoadedDroppedFiles[0].name;

            }

            return firstFileName;
        };

		var parseLoadedDroppedFiles = function(loadedDroppedFiles) {

			var sortedLoadedDroppedFiles = sortLoadedDroppedFilesByName(loadedDroppedFiles);

			console.log('sortedLoadedDroppedFiles:');
			console.dir(sortedLoadedDroppedFiles);

			//
			// Update UI
			//

            //
            // Show sidebar
            //
            window.WGST.exports.showSidebar();

            //
            //
            // Create assembly upload panels
            //
            //

            //
            // Create assembly upload navigation panel
            //
            window.WGST.exports.createPanel('assembly-upload-navigation', {
            	panelType: 'assembly-upload-navigation',
            	panelId: 'assembly-upload-navigation'
            });
            //
            // Show panel
            //
            window.WGST.exports.showPanel('assembly-upload-navigation');

            //
            // Create assembly upload metadata panel
            //
            window.WGST.exports.createPanel('assembly-upload-metadata', {
            	panelType: 'assembly-upload-metadata',
            	panelId: 'assembly-upload-metadata'
            });
            //
            // Show panel
            //
            window.WGST.exports.showPanel('assembly-upload-metadata');

            //
            // Create assembly upload analytics panel
            //
            window.WGST.exports.createPanel('assembly-upload-analytics', {
            	panelType: 'assembly-upload-analytics',
            	panelId: 'assembly-upload-analytics'
            });

            //
            // Show panel
            //
            window.WGST.exports.showPanel('assembly-upload-analytics');

	        //
	        // Create map fullscreen
	        //
	        var fullscreenType = 'collection-map',
	            fullscreenId = fullscreenType;

	        window.WGST.exports.createFullscreen(fullscreenId, {
	            fullscreenType: fullscreenType,
	            fullscreenId: fullscreenId
	        });

	        //
	        // Show fullscreen
	        //
	        window.WGST.exports.showFullscreen(fullscreenId);

            //
		    // Initialise map
		    //
	    	window.WGST.geo.map.init();

			//
			// Parse each file
			//
			sortedLoadedDroppedFiles.map(function(file){

	        	//
	        	// Csv
	        	//
	            if (isCsvFile(file)) {

	                parseCsvFile(file);

	            //
	            // Fasta
	            //
	            } else if (isFastaFile(file)) {

	            	parseFastaFile(file);

	            //
	            // Unknown file type
	            //
	            } else {

	            	console.error('[WGST] Unsupported file type.');
	            }
			});

            //
            // Show first assembly
            //
            //window.WGST.exports.showAssemblyUpload(sortedLoadedDroppedFiles[0].name);
            window.WGST.exports.showAssemblyUpload(getNameOfTheFirstFile(sortedLoadedDroppedFiles));

            //
            // Hide drag and drop background
            //
            $('[data-wgst-background-id="drag-and-drop"]').addClass('wgst--hide-this');
		};

	    var handleDrop = function(event) {

	    	//
	        // Check if file upload is allowed
	        //
	        if (! window.WGST.config.allowUpload) {
	            return;
	        }

	        //
	        // Update animation
	        //
	        var $dragAndDropBackground = $('[data-wgst-background-id="drag-and-drop"]');
			$dragAndDropBackground.find('.wgst-drag-and-drop-content').find('.fa').removeClass('animated bounce');
	        $dragAndDropBackground.find('.wgst-drag-and-drop-content').find('.fa').addClass('animated pulse');

	        //
	        // Update status
	        //
	        $('[data-wgst-drag-and-drop-ready]').addClass('wgst--hide-this');
	        $('[data-wgst-drag-and-drop-analysing-data]').removeClass('wgst--hide-this');

	        //
	        // Only handle file drops
	        //
	        if (event.dataTransfer.files.length > 0) {
	            event.stopPropagation();
	            event.preventDefault();

	            //
	            // Validate dropped files
	            //
	            var droppedFiles = event.dataTransfer.files;
	            var validatedDroppedFiles = validateDroppedFiles(droppedFiles);

	            //window.WGST.dragAndDrop.droppedValidFiles = validatedDroppedFiles.validFiles;

	            // //
	            // // Speak
	            // //
	            // if (window.WGST.speak) {
	            //     var messageText = '',
	            //         message;

	            //     if (collectionId.length > 0) {
	            //         messageText = 'You have dropped ' +  event.dataTransfer.files.length + ' files to the existing collection.';
	            //     } else {
	            //         messageText = 'You have dropped ' +  event.dataTransfer.files.length + ' files';
	            //     }

	            //     message = new SpeechSynthesisUtterance(messageText);
	            //     window.speechSynthesis.speak(message);
	            // }

	            //
	            //
	            // Allow dropping files in multiple batches.
	            //
	            // FileList object
	            // https://developer.mozilla.org/en-US/docs/Web/API/FileList
	            //
	            //
	            // var newlyDroppedFiles = event.dataTransfer.files;
	            // var previouslyDroppedFiles = window.WGST.dragAndDrop.files;

	            // console.debug('window.WGST.dragAndDrop.files:');
	            // console.dir(window.WGST.dragAndDrop.files);

	            // console.debug('event.dataTransfer.files:');
	            // console.dir(event.dataTransfer.files);

	            //
	            // Merge newly dropped files with previously dropped files.
	            //
	            //window.WGST.dragAndDrop.files = $.merge(previouslyDroppedFiles, newlyDroppedFiles);
	            //window.WGST.dragAndDrop.files = $.merge([], newlyDroppedFiles);

	            loadDroppedFiles(validatedDroppedFiles.validFiles, function(error, loadedDroppedFiles){

	            	console.log('loadedDroppedFiles:');
	            	console.dir(loadedDroppedFiles);

	            	parseLoadedDroppedFiles(loadedDroppedFiles);

	            });

	            return;

	            //
	            // Handle each file based on it's type
	            //
	            window.WGST.dragAndDrop.droppedValidFiles.map(function(file){

	            	//
	            	// Load files
	            	//
	            	loadFiles();

	            	//
	            	// Csv
	            	//
	                if (isCsvFile(file)) {

	                    handleCsvDrop(file);

	                //
	                // Fasta
	                //
	                } else if (isFastaFile(file)) {

	                	handleFastaDrop(file);

	                    // if ($('.wgst-panel__assembly-upload-analytics .assembly-item[data-name="' + file.name + '"]').length === 0) {
	                    // 	handleFastaDrop(file);
	                    // }

	                //
	                // Unknown file type
	                //
	                } else {
	                	console.error('[WGST] Unsupported file type.');
	                }

	            });

	            // var allDroppedFiles = WGST.dragAndDrop.files;
	            //     // A single file from FileList object
	            //     //file = allDroppedFiles[0],
	            //     // File name is used for initial user assembly id
	            //     //fileName = file.name;
	            //     // Count files
	            //     //fileCounter = 0,
	            //     // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
	            //     //fileReader = new FileReader();

	            // numberOfDroppedFastaFiles = Object.keys(allDroppedFiles).length;

	            // $.each(allDroppedFiles, function(fileCounter, file){
	            //     // https://developer.mozilla.org/en-US/docs/Web/API/FileList#item()

	            //     if (file.type.match(window.WGST.dragAndDrop.csvFileTypeRegex)) {

	            //         handleCsvDrop(file);

	            //     } else if (file.name.match(WGST.dragAndDrop.fastaFileNameRegex)) {

	            //         if ($('.wgst-panel__assembly-upload-analytics .assembly-item[data-name="' + file.name + '"]').length === 0) {

	            //         	handleFastaDrop(file);

	            //         } // if

	            //     } else {
	            //         // // ============================================================
	            //         // // React component
	            //         // // ============================================================
	            //         // React.renderComponent(
	            //         //     WorkflowQuestion({
	            //         //         title: 'What type of data have you dropped?',
	            //         //         buttons: [
	            //         //         {
	            //         //             label: 'Assemblies in FASTA format',
	            //         //             value: 'fasta'
	            //         //         },
	            //         //         {
	            //         //             label: 'Metadata in CSV format',
	            //         //             value: 'csv'
	            //         //         }]
	            //         //     }),
	            //         //     document.querySelectorAll(".wgst-react-component__workflow-question")[0]
	            //         // );
	            //     } // if

	            // });

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
	            //$('.assembly-upload-total-number').text(allDroppedFiles.length);
	            // Update lable for total number of assemblies to upload
	            //$('.assembly-upload-total-number-label').html((allDroppedFiles.length === 1 ? 'assembly': 'assemblies'));
	        }
	    };

	    //
	    // Analyse FASTA
	    //
	    var analyseFasta = function(assemblyFileId, fastaFileString) {

	        //
	        // Analyse
	        //

	        var contigs = window.WGST.exports.extractContigsFromFastaFileString(fastaFileString);
	        var totalNumberOfContigs = contigs.length;
	        var dnaStrings = window.WGST.exports.extractDnaStringsFromContigs(contigs);
	        var assemblyN50Data = window.WGST.exports.calculateN50(dnaStrings);
	        var contigN50 = assemblyN50Data['sequenceLength'];
	        var sumsOfNucleotidesInDnaStrings = window.WGST.exports.calculateSumsOfNucleotidesInDnaStrings(dnaStrings);
	        var totalNumberOfNucleotidesInDnaStrings = window.WGST.exports.calculateTotalNumberOfNucleotidesInDnaStrings(dnaStrings);
	        var averageNumberOfNucleotidesInDnaStrings = window.WGST.exports.calculateAverageNumberOfNucleotidesInDnaStrings(dnaStrings);
	        var smallestNumberOfNucleotidesInDnaStrings = window.WGST.exports.calculateSmallestNumberOfNucleotidesInDnaStrings(dnaStrings);
	        var biggestNumberOfNucleotidesInDnaStrings = window.WGST.exports.calculateBiggestNumberOfNucleotidesInDnaStrings(dnaStrings);

	        window.WGST.exports.validateContigs(contigs);

	        console.log('[WGST] * dev * dnaStrings:');
	        console.dir(dnaStrings);
	        console.log('[WGST] * dev * totalNumberOfNucleotidesInDnaStrings: ' + totalNumberOfNucleotidesInDnaStrings);
	        console.log('[WGST] * dev * averageNumberOfNucleotidesInDnaStrings: ' + averageNumberOfNucleotidesInDnaStrings);
	        console.log('[WGST] * dev * smallestNumberOfNucleotidesInDnaStrings: ' + smallestNumberOfNucleotidesInDnaStrings);
	        console.log('[WGST] * dev * biggestNumberOfNucleotidesInDnaStrings: ' + biggestNumberOfNucleotidesInDnaStrings);

	        window.WGST.upload.stats.totalNumberOfContigs = window.WGST.upload.stats.totalNumberOfContigs + contigs.length;

	        return {
	        	totalNumberOfContigs: totalNumberOfContigs,
	        	dnaStrings: dnaStrings,
				assemblyN50Data: assemblyN50Data,
	        	contigN50: contigN50,
	        	sumsOfNucleotidesInDnaStrings: sumsOfNucleotidesInDnaStrings,

	        	totalNumberOfNucleotidesInDnaStrings: totalNumberOfNucleotidesInDnaStrings,
	        	averageNumberOfNucleotidesInDnaStrings: averageNumberOfNucleotidesInDnaStrings,
	        	smallestNumberOfNucleotidesInDnaStrings: smallestNumberOfNucleotidesInDnaStrings,
	        	biggestNumberOfNucleotidesInDnaStrings: biggestNumberOfNucleotidesInDnaStrings,
	        };
	    };

	    //
	    // Parse fasta file
	    //
	    var __parseFastaFile = function(event, fileCounter, file, droppedFiles, collectionId) {

	    	//
	    	// Init data structure
	    	//

	    	var assemblyFileId = file.name,
	    		fastaFileContent = event.target.result;

	    	window.WGST.upload.fastaAndMetadata[assemblyFileId] = {
	    		fasta: {
	    			name: assemblyFileId,
	    			assembly: fastaFileContent
	    		},
	    		metadata: {}
	    	};

	    	// ???

	        // // Store fasta file and metadata
	        // fastaFilesAndMetadata[file.name] = {
	        //     // Cut FASTA file extension from the file name
	        //     //name: file.name.substr(0, file.name.lastIndexOf('.')),
	        //     name: file.name,
	        //     assembly: event.target.result,
	        //     metadata: {}
	        // };

	        // // Init assembly upload metadata
	        // WGST.upload.assembly[assemblyFileId] = {
	        //     metadata: {}
	        // };

	        // ???



	        //
	        // Parse
	        //

	        var fastaFileString = event.target.result;
	        var contigs = window.WGST.exports.extractContigsFromFastaFileString(fastaFileString);
	        var totalNumberOfContigs = contigs.length;

	        window.WGST.exports.validateContigs(contigs);

	        var dnaStrings = window.WGST.exports.extractDnaStringsFromContigs(contigs);
	        var assemblyN50Data = window.WGST.exports.calculateN50(dnaStrings);
	        var contigN50 = assemblyN50Data['sequenceLength'];
	        var dnaStrings = window.WGST.exports.extractDnaStringsFromContigs(contigs);
	        var totalNumberOfNucleotidesInDnaStrings = window.WGST.exports.calculateTotalNumberOfNucleotidesInDnaStrings(dnaStrings);
	        var averageNumberOfNucleotidesInDnaStrings = window.WGST.exports.calculateAverageNumberOfNucleotidesInDnaStrings(dnaStrings);
	        var smallestNumberOfNucleotidesInDnaStrings = window.WGST.exports.calculateSmallestNumberOfNucleotidesInDnaStrings(dnaStrings);
	        var biggestNumberOfNucleotidesInDnaStrings = window.WGST.exports.calculateBiggestNumberOfNucleotidesInDnaStrings(dnaStrings);

	        console.log('[WGST] * dev * dnaStrings:');
	        console.dir(dnaStrings);
	        console.log('[WGST] * dev * totalNumberOfNucleotidesInDnaStrings: ' + totalNumberOfNucleotidesInDnaStrings);
	        console.log('[WGST] * dev * averageNumberOfNucleotidesInDnaStrings: ' + averageNumberOfNucleotidesInDnaStrings);
	        console.log('[WGST] * dev * smallestNumberOfNucleotidesInDnaStrings: ' + smallestNumberOfNucleotidesInDnaStrings);
	        console.log('[WGST] * dev * biggestNumberOfNucleotidesInDnaStrings: ' + biggestNumberOfNucleotidesInDnaStrings);

	        window.WGST.upload.stats.totalNumberOfContigs = window.WGST.upload.stats.totalNumberOfContigs + contigs.length;

	        window.WGST.exports.renderAssemblyAnalytics(assemblyFileId, {
	        	totalNumberOfNucleotidesInDnaStrings: totalNumberOfNucleotidesInDnaStrings,
	        	totalNumberOfContigs: totalNumberOfContigs,
	        	smallestNumberOfNucleotidesInDnaStrings: smallestNumberOfNucleotidesInDnaStrings,
	        	averageNumberOfNucleotidesInDnaStrings: averageNumberOfNucleotidesInDnaStrings,
	        	biggestNumberOfNucleotidesInDnaStrings: biggestNumberOfNucleotidesInDnaStrings,
	        	contigN50: contigN50
	        });

	        window.WGST.exports.renderAssemblyMetadataForm(assemblyFileId);

	        // Draw N50 chart
	        var sumsOfNucleotidesInDnaStrings = window.WGST.exports.calculateSumsOfNucleotidesInDnaStrings(dnaStrings);

	        window.WGST.exports.drawN50Chart(sumsOfNucleotidesInDnaStrings, assemblyN50Data, '.sequence-length-distribution-chart[data-assembly-file-id="' + assemblyFileId + '"]');

			window.WGST.exports.initAssemblyUploadMetadataLocation(assemblyFileId);
	    
	    };

		//
		// Listen to drag and drop events
		//
		var dropZone = $('[data-wgst-drag-and-drop-zone]')[0];
		dropZone.addEventListener('dragenter', handleDragEnter, false);
		dropZone.addEventListener('dragover', handleDragOver, false);
		dropZone.addEventListener('dragleave', handleDragLeave, false);
		dropZone.addEventListener('drop', handleDrop, false);
	})();

});
$(function(){

	(function(){

	    window.WGST.exports.isAssemblyAnalyticsExists = function(assemblyFileId) {
	    	if ($('.wgst-upload-assembly__analytics[data-assembly-file-id="' + assemblyFileId + '"]').length === 0) {
	    		return false;
	    	} else {
	    		return true;
	    	}
	    };	    

	    window.WGST.exports.renderAssemblyAnalytics = function(assemblyFileId, analytics) {
	    	//
	    	// Do not render assembly analytics if it's already rendered
	    	//
	    	if (window.WGST.exports.isAssemblyAnalyticsExists(assemblyFileId)) {
	    		return;
	    	}

	    	var totalNumberOfNucleotidesInDnaStrings = analytics.totalNumberOfNucleotidesInDnaStrings,
	    		totalNumberOfContigs = analytics.totalNumberOfContigs,
	    		smallestNumberOfNucleotidesInDnaStrings = analytics.smallestNumberOfNucleotidesInDnaStrings,
	    		averageNumberOfNucleotidesInDnaStrings = analytics.averageNumberOfNucleotidesInDnaStrings,
	    		biggestNumberOfNucleotidesInDnaStrings = analytics.biggestNumberOfNucleotidesInDnaStrings,
	    		contigN50 = analytics.contigN50;

	        //
	        // 
	        // Render dropped assembly analytics
	        //
	        //
	        var droppedAssemblyAnalyticsContext = {
	            assemblyFileId: assemblyFileId,
	            // Print a number with commas as thousands separators
	            // http://stackoverflow.com/a/2901298
	            totalNumberOfNucleotidesInDnaStrings: totalNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            totalNumberOfContigs: totalNumberOfContigs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            smallestNumberOfNucleotidesInDnaStrings: smallestNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            averageNumberOfNucleotidesInDnaStrings: averageNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            biggestNumberOfNucleotidesInDnaStrings: biggestNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            contigN50: contigN50.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	        };

	        var droppedAssemblyAnalyticsTemplateHtml = $('.wgst-template[data-template-id="droppedAssemblyAnalytics"]').html();
	        var droppedAssemblyAnalyticsTemplate = Handlebars.compile(droppedAssemblyAnalyticsTemplateHtml);
	        var droppedAssemblyAnalyticsHtml = droppedAssemblyAnalyticsTemplate(droppedAssemblyAnalyticsContext);

	        $('.wgst-assembly-upload__analytics ul').append($(droppedAssemblyAnalyticsHtml));
	    };

	})();

});
$(function(){

	(function(){

		//
		//
		//
		// Model
		//
		//
		//

		window.WGST.exports.setAssemblyMetadataValue = function(options) {

			var assemblyFileId = options.assemblyFileId,
				assemblyMetadataKey = options.assemblyMetadataKey,
				assemblyMetadataValue = options.assemblyMetadataValue;

			if (assemblyMetadataKey === 'datetime') {

                //
                // Set datetime
                //
				window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.datetime = assemblyMetadataValue;

			} else if (assemblyMetadataKey === 'geography') {

                //
                // Set geography
                //
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography = {
                    address: '',
                    position: {
                        latitude: '',
                        longitude: ''
                    },
                    type: ''
                };
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.address = assemblyMetadataValue.address;
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.position.latitude = assemblyMetadataValue.position.latitude;
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.position.longitude = assemblyMetadataValue.position.longitude;
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.type = assemblyMetadataValue.type;

			} else if (assemblyMetadataKey === 'source') {

                //
                // Copy source
                //
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.source = assemblyMetadataValue;

	        }

			//
			// Notify view
			//
			window.WGST.exports.happenedSetAssemblyMetadata(options);
		};

		window.WGST.exports.copyAssemblyMetadata = function(sourceAssemblyFileId, targetAssemblyFileId) {

			//
			// For performance improvements and maintenance - store assembly metadata in a variable
			//
			var sourceAssemblyMetadata = window.WGST.upload.fastaAndMetadata[sourceAssemblyFileId].metadata;

			//
			// Copy each metadata object property
			//
			Object.keys(sourceAssemblyMetadata).map(function(metadataKey) {
				//
				// Set assembly metadata's value
				//
				window.WGST.exports.setAssemblyMetadataValue({
					assemblyFileId: targetAssemblyFileId,
					assemblyMetadataKey: metadataKey,
					assemblyMetadataValue: sourceAssemblyMetadata[metadataKey]
				});
			});
		};

		window.WGST.exports.copyAssemblyMetadataToAssembliesWithNoMetadata = function(sourceAssemblyFileId) {

			var fastaAndMetadata = window.WGST.upload.fastaAndMetadata;

			//
			// Iterate over each assembly metadata
			//
			Object.keys(fastaAndMetadata).map(function(targetAssemblyFileId) {

				var targetAssemblyMetadata = fastaAndMetadata[targetAssemblyFileId].metadata;

	        	//
	            // Only copy metadata to assemblies with no metadata
	            //
				if (Object.keys(targetAssemblyMetadata).length === 0) {
					//
					// Copy assembly metadata
					//

					//
					// Copy model
					//
					window.WGST.exports.copyAssemblyMetadata(sourceAssemblyFileId, targetAssemblyFileId);

					//
					// Copy view
					//
					window.WGST.exports.copyAssemblyMetadataView(sourceAssemblyFileId, targetAssemblyFileId);
				}
			});
		};

		//
		//
		//
		// View
		//
		//
		//

		window.WGST.exports.happenedSetAssemblyMetadata = function(options) {

			return;

			var assemblyFileId = options.assemblyFileId,
				assemblyMetadataKey = options.assemblyMetadataKey,
				assemblyMetadataValue = options.assemblyMetadataValue;

			if (assemblyMetadataKey === 'datetime') {

                //
                // Update date input
                //
                window.WGST.exports.setAssemblyMetadataTimestamp(source.assemblyFileId, targetAssemblyFileId);

			} else if (assemblyMetadataKey === 'geography') {

                //
                // Set geography
                //
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography = {
                    address: '',
                    position: {
                        latitude: '',
                        longitude: ''
                    },
                    type: ''
                };
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.address = assemblyMetadataValue.address;
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.position.latitude = assemblyMetadataValue.position.latitude;
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.position.longitude = assemblyMetadataValue.position.longitude;
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.geography.type = assemblyMetadataValue.type;

			} else if (assemblyMetadataKey === 'source') {

                //
                // Copy source
                //
                window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata.source = assemblyMetadataValue;

	        }
		};

	})();

});
$(function(){

	(function(){

	    window.WGST.exports.isAssemblyMetadataFormExists = function(assemblyFileId) {
	    	if ($('.wgst-upload-assembly__metadata[data-assembly-file-id="' + assemblyFileId + '"]').length === 0) {
	    		return false;
	    	} else {
	    		return true;
	    	}
	    };	    

	    window.WGST.exports.renderAssemblyMetadataForm = function(assemblyFileId) {
	    	//
	    	// Do not render assembly metadata form if it's already rendered
	    	//
	    	if (window.WGST.exports.isAssemblyMetadataFormExists(assemblyFileId)) {
	    		return;
	    	}

	        //
	        // 
	        // Render date
	        //
	        //
	        var droppedAssemblyMetadataFormContext = {
	            assemblyFileId: assemblyFileId,
	            listOfYears: window.WGST.exports.generateYears(1940, 2014),
	            listOfMonths: window.WGST.exports.generateMonths(),
	            listOfDays: window.WGST.exports.generateDays()
	        };

	        //console.debug('droppedAssemblyMetadataFormContext:');
	        //console.dir(droppedAssemblyMetadataFormContext);

	        var droppedAssemblyMetadataFormTemplateHtml = $('.wgst-template[data-template-id="droppedAssemblyMetadataForm"]').html();
	        var droppedAssemblyMetadataFormTemplate = Handlebars.compile(droppedAssemblyMetadataFormTemplateHtml);
	        var droppedAssemblyMetadataFormHtml = droppedAssemblyMetadataFormTemplate(droppedAssemblyMetadataFormContext);

	        $('.wgst-assembly-upload__metadata ul').append($(droppedAssemblyMetadataFormHtml));
	    };

	    window.WGST.exports.renderAssemblyMetadataDateForm = function(assemblyFileId) {
	    	//
	    	// Do not render assembly metadata form if it's already rendered
	    	//
	    	if (window.WGST.exports.isAssemblyMetadataFormExists(assemblyFileId)) {
	    		return;
	    	}

	        //
	        // 
	        // Render date
	        //
	        //
	        var droppedAssemblyMetadataFormContext = {
	            assemblyFileId: assemblyFileId,
	            listOfYears: window.WGST.exports.generateYears(1940, 2014),
	            listOfMonths: window.WGST.exports.generateMonths(),
	            listOfDays: window.WGST.exports.generateDays()
	        };

	        //console.debug('droppedAssemblyMetadataFormContext:');
	        //console.dir(droppedAssemblyMetadataFormContext);

	        var droppedAssemblyMetadataFormTemplateHtml = $('.wgst-template[data-template-id="droppedAssemblyMetadataForm"]').html();
	        var droppedAssemblyMetadataFormTemplate = Handlebars.compile(droppedAssemblyMetadataFormTemplateHtml);
	        var droppedAssemblyMetadataFormHtml = droppedAssemblyMetadataFormTemplate(droppedAssemblyMetadataFormContext);

	        $('.wgst-assembly-upload__metadata ul').append($(droppedAssemblyMetadataFormHtml));
	    };

		window.WGST.exports.copyAssemblyMetadataView = function(sourceAssemblyFileId, targetAssemblyFileId) {
	        //
	        //
	        // Update UI
	        //
	        //
	        var $assemblyUploadMetadataPanel = $('.wgst-panel__assembly-upload-metadata');
	        var $targetAssemblyMetadata = $assemblyUploadMetadataPanel.find('.wgst-upload-assembly__metadata[data-assembly-file-id="' + targetAssemblyFileId + '"]');

	        //
	        // Update date input
	        //
	        window.WGST.exports.copyAssemblyMetadataTimestamp(sourceAssemblyFileId, targetAssemblyFileId);

	        //
	        // Copy same metadata to all assemblies with no metadata
	        //
	        var $sourceAssemblyMetadata = $assemblyUploadMetadataPanel.find('.wgst-upload-assembly__metadata[data-assembly-file-id="' + sourceAssemblyFileId + '"]');
	            $sourceAssemblyMetadataLocation = $sourceAssemblyMetadata.find('.assembly-sample-location-input'),
	            $sourceAssemblyMetadataSource = $sourceAssemblyMetadata.find('.assembly-sample-source-input');

	        //
	        // Update location input
	        //
	        $targetAssemblyMetadata.find('.assembly-sample-location-input').val($sourceAssemblyMetadataLocation.val());
	        
	        //
	        // Update source input
	        //
	        $targetAssemblyMetadata.find('.assembly-sample-source-input').val($sourceAssemblyMetadataSource.val());
	        
	        //
	        // Show all metadata blocks
	        //
	        $('.wgst-upload-assembly__metadata[data-assembly-file-id="' + targetAssemblyFileId + '"] .wgst-assembly-metadata-block').removeClass('wgst--hide-this');
		};

	})();

});
$(function(){

	(function(){

        //
        //
        //
        // Date
        //
        //
        //

	    var getTotalNumberOfDaysInMonth = function(year, month) {
	        // http://www.dzone.com/snippets/determining-number-days-month
	        return 32 - new Date(year, month, 32).getDate();
	    };

	    window.WGST.exports.populateDaySelect = function($selectElement, selectedYear, selectedMonth) {
	    	//
	        // Remove previous list of days and append a new one
	        //
	        $selectElement
	        	.html('')
	            .append($('<option value="-1">Choose day</option>'))
	            .append(generateDayHtmlElements(selectedYear, selectedMonth));
	    };

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

	    window.WGST.exports.generateYears = function(startYear, endYear) {
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

	    window.WGST.exports.generateMonths = function() {
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

	    window.WGST.exports.generateDays = function(year, month) {

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

		window.WGST.exports.isValidDateString = function(dateString) {
			return moment(dateString).isValid();
		};

	    window.WGST.exports.setAssemblyMetadataDateView = function(assemblyFileId, date) {

	    	//
	    	// Parse date string - break it into parts
	    	//

	    	//
	    	// Check if date string is valid
	    	//
	    	if (! window.WGST.exports.isValidDateString(date)) {
	    		console.log('[WGST][Error] Date string is invalid.');
	    		return;
	    	}

	    	//
	    	// Get year
	    	//
	    	var year = moment(dateString).year();

	    	//
	    	// Get month
	    	//
	    	var month = moment(dateString).month();

	    	//
	    	// Get date
	    	//
	    	var date = moment(dateString).date();

	    	console.log('year: ' + year);
	    	console.log('month: ' + month);
	    	console.log('date: ' + date);

	    };

	    window.WGST.exports.copyAssemblyMetadataTimestamp = function(sourceAssemblyFileId, targetAssemblyFileId) {

	        if (sourceAssemblyFileId === targetAssemblyFileId) {
	            return;
	        }

	        var $sourceTimestampYearHtml = $('.assembly-metadata-timestamp-year[data-assembly-file-id="' + sourceAssemblyFileId + '"]'),
	            sourceTimestampYearValue = $sourceTimestampYearHtml.find('select option:selected').val(),

	            $sourceTimestampMonthHtml = $('.assembly-metadata-timestamp-month[data-assembly-file-id="' + sourceAssemblyFileId + '"]'),
	            sourceTimestampMonthValue = $sourceTimestampMonthHtml.find('select option:selected').val(),

	            $sourceTimestampDayHtml = $('.assembly-metadata-timestamp-day[data-assembly-file-id="' + sourceAssemblyFileId + '"]'),
	            sourceTimestampDayValue = $sourceTimestampDayHtml.find('select option:selected').val(),

	            $targetTimestampYearHtml = $('.assembly-metadata-timestamp-year[data-assembly-file-id="' + targetAssemblyFileId + '"]'),
	            $targetTimestampMonthHtml = $('.assembly-metadata-timestamp-month[data-assembly-file-id="' + targetAssemblyFileId + '"]'),
	            $targetTimestampDayHtml = $('.assembly-metadata-timestamp-day[data-assembly-file-id="' + targetAssemblyFileId + '"]'),
	            
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
	            window.WGST.exports.populateDaySelect($targetTimestampDaySelect, sourceTimestampYearValue, sourceTimestampMonthValue);
	            // Select day option
	            $targetTimestampDaySelect.find('option[value="' + sourceTimestampDayValue + '"]').prop('selected', true);
	        }
	        // Show timestamp parts
	        if ($sourceTimestampYearHtml.is(':visible')) {
	            $targetTimestampYearHtml.removeClass('wgst--hide-this');
	        }
	        if ($sourceTimestampMonthHtml.is(':visible')) {
	            $targetTimestampMonthHtml.removeClass('wgst--hide-this');
	        }
	        if ($sourceTimestampDayHtml.is(':visible')) {
	            $targetTimestampDayHtml.removeClass('wgst--hide-this');
	        }
	    };

	})();

});
//
// App version
//
window.WGST.version = window.WGST.config.version;

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

    // /**
    //  * Description
    //  * @method getRepresentativeCollectionTreeMetadata
    //  * @param {} callback
    //  * @return 
    //  */
    // var getRepresentativeCollectionTreeMetadata = function(callback) {
    //     console.log('[WGST] Getting representative collection tree metadata');
    //     // Get representative collection metadata
    //     $.ajax({
    //         type: 'GET',
    //         url: '/api/collection/representative/metadata',
    //         datatype: 'json' // http://stackoverflow.com/a/9155217
    //     })
    //     .done(function(representativeCollectionMetadata, textStatus, jqXHR) {
    //         console.log('[WGST] Got representative collection tree metadata');
    //         console.dir(representativeCollectionMetadata);

    //         callback(null, representativeCollectionMetadata);
    //     })
    //     .fail(function(jqXHR, textStatus, errorThrown) {
    //         console.error('[WGST][Error] ✗ Failed to get representative collection tree metadata');
    //         console.error(textStatus);
    //         console.error(errorThrown);
    //         console.error(jqXHR);

    //         callback(textStatus, null);
    //     });
    // };

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

    //
    // If user provided collection id in url then load requested collection
    //
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
    }

    // /**
    //  * Description
    //  * @method deselectAllTreeNodes
    //  * @param {} collectionId
    //  * @return 
    //  */
    // var deselectAllTreeNodes = function(collectionId) {
    //     var tree = WGST.collection[collectionId].tree['CORE_TREE_RESULT'].canvas;

    //     // Workaround
    //     // TO DO: Refactor using official API
    //     tree.selectNodes('');
    // };

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

    // /**
    //  * Description
    //  * @method showCollectionMetadataOnMap
    //  * @param {} collectionId
    //  * @param {} assemblyIds
    //  * @return 
    //  */
    // var showCollectionMetadataOnMap = function(collectionId, assemblyIds) {

    //     WGST.collection[collectionId].geo = WGST.collection[collectionId].geo || {};

    //     var collectionTree = WGST.collection[collectionId].tree.canvas,
    //         existingMarkers = WGST.collection[collectionId].geo.markers,
    //         existingMarkerCounter = existingMarkers.length;

    //     // Remove existing markers
    //     for (; existingMarkerCounter !== 0;) {
    //         existingMarkerCounter = existingMarkerCounter - 1;
    //         // Remove marker
    //         existingMarkers[existingMarkerCounter].setMap(null);
    //     }
    //     WGST.collection[collectionId].geo.markers = [];

    //     // Reset marker bounds
    //     WGST.geo.map.markerBounds = new google.maps.LatLngBounds();

    //     // Create new markers
    //     if (assemblyIds.length > 0) {
    //         var assemblyCounter = assemblyIds.length,
    //             assemblyId = '',
    //             assemblyMetadata = {},
    //             latitude = {},
    //             longitude = {};

    //         // For each assembly create marker
    //         for (; assemblyCounter !== 0;) {
    //             assemblyCounter = assemblyCounter - 1;

    //             assemblyId = assemblyIds[assemblyCounter];
    //             assemblyMetadata = WGST.collection[collectionId].assemblies[assemblyId]['ASSEMBLY_METADATA'];
    //             latitude = assemblyMetadata.geography.position.latitude;
    //             longitude = assemblyMetadata.geography.position.longitude;

    //             //Check if both latitude and longitude provided
    //             if (latitude && longitude) {
    //                 console.log("[WGST] Marker's latitude: " + latitude);
    //                 console.log("[WGST] Marker's longitude: " + longitude);

    //                 var marker = new google.maps.Marker({
    //                     position: new google.maps.LatLng(latitude, longitude),
    //                     map: WGST.geo.map.canvas,
    //                     icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    //                     // This must be optimized, otherwise white rectangles will be displayed when map is manipulated
    //                     // However, there is a known case when this should be false: http://www.gutensite.com/Google-Maps-Custom-Markers-Cut-Off-By-Canvas-Tiles
    //                     optimized: true
    //                 });

    //                 // Set marker
    //                 WGST.collection[collectionId].assemblies[assemblyId].geo = WGST.collection[collectionId].assemblies[assemblyId].geo || {};
    //                 WGST.collection[collectionId].assemblies[assemblyId].geo.marker = marker;

    //                 // Store list of assembly ids with markers
    //                 WGST.collection[collectionId].geo.markers.push(assemblyIds);
                    
    //                 // Extend markerBounds with each metadata marker
    //                 WGST.geo.map.markerBounds.extend(marker.getPosition());
    //             } // if
    //         } // for
    //     } else { // No assemblies were selected
    //         // Show Europe
    //         WGST.geo.map.canvas.panTo(new google.maps.LatLng(48.6908333333, 9.14055555556));
    //         WGST.geo.map.canvas.setZoom(5);
    //     }
    // };

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


















    //     // Array of objects that store content of FASTA file and user-provided metadata
    // var fastaFilesAndMetadata = {},
    //     // Stores file name of displayed FASTA file
    //     selectedFastaFileName = '',
    //     // Element on which user can drag and drop files
        
    //     // Store individual assembly objects used for displaying data
    //     assemblies = [],
    //     // DNA sequence regex
    //     dnaSequenceRegex = /^[CTAGNUX]+$/i,
    //     // Count total number of contigs in all selected assemblies
    //     totalContigsSum = 0,
    //     totalNumberOfContigsDropped = 0;







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



    // /**
    //  * Description
    //  * @method updateSelectedFilesSummary
    //  * @return 
    //  */
    // var updateSelectedFilesSummary = function() {
    //     // Calculate average number of selected contigs
    //     var contigsTotalNumber = 0;
    //     // Count all contigs
    //     $.each($('.assembly-item'), function(key, value){
    //         contigsTotalNumber = contigsTotalNumber + parseInt($(value).find('.assembly-stats-number-contigs').text(), 10);
    //     });
    //     $('.assembly-sequences-average').text(Math.floor(contigsTotalNumber / Object.keys(fastaFilesAndMetadata).length));

    //     // Set total number of selected assemblies/files
    //     $('.assembly-upload-total-number').text(Object.keys(fastaFilesAndMetadata).length);
    // };

    // //
    // // Updates
    // //
    // var getIndexOfDroppedAssemblyCurrentlyDisplayed = function() {
    //     var fileUidOfVisibleMetadata = $('.wgst-upload-assembly__metadata:visible').attr('data-file-uid');

    //     var indexOfDroppedAssemblyCurrentlyDisplayed = 0;

    //     WGST.dragAndDrop.loadedFiles.forEach(function(loadedFile, index, array) {
    //         if (loadedFile.uid === fileUidOfVisibleMetadata) {
    //             indexOfDroppedAssemblyCurrentlyDisplayed = index;
    //         }
    //     });

    //     return indexOfDroppedAssemblyCurrentlyDisplayed;
    // };

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

    // // Show next form block when user fills in an input
    // // To do: Refactor
    // $('.wgst-assembly-upload__metadata').on('change', '.assembly-sample-source-input', function(){
    //     var $input = $(this);

    //     // Show next form block if user selected non default option
    //     if ($input.val() !== 0) {
    //         // Show next metadata form block
    //         $input.closest('.form-block').next('.form-block').fadeIn();
    //         // Scroll to the next form block
    //         $input.closest('.assembly-metadata').animate({scrollTop: $input.closest('.assembly-metadata').height()}, 400);
    //     } // if

    //     // Increment metadata progress bar
    //     updateMetadataProgressBar();
    //     // Hide progress hint
    //     $('.adding-metadata-progress-container .progress-hint').fadeOut();
    // });











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

    // *
    //  * $('.wgst-panel__collection-panel .assemblies-summary-table').on('click', 'tr', function(event) {
    //  * if (event.target.type !== 'radio' && event.target.type !== 'checkbox') {
    //  * $(':checkbox', this).trigger('click');
    //  * }
    //  * });
    //  * @method isFullscreenActive
    //  * @param {} fullscreenName
    //  * @return 
     
    // var isFullscreenActive = function(fullscreenName) {
    //     var fullscreenElement = $('[data-fullscreen-name="' + fullscreenName + '"]');

    //     if (fullscreenElement.hasClass('wgst-fullscreen--active')) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // };

    // /**
    //  * Description
    //  * @method isFullscreenVisible
    //  * @param {} fullscreenName
    //  * @return 
    //  */
    // var isFullscreenVisible = function(fullscreenName) {
    //     var fullscreenElement = $('[data-fullscreen-name="' + fullscreenName + '"]');

    //     if (fullscreenElement.hasClass('wgst-fullscreen--visible')) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // };



    // /**
    //  * Description
    //  * @method getAssembliesWithIdenticalPosition
    //  * @param {} markerPositionLatLng
    //  * @return assembliesWithIdenticalPosition
    //  */
    // var getAssembliesWithIdenticalPosition = function(markerPositionLatLng) {
    //     //------------------------------------------------------
    //     // Figure out which marker to create
    //     //------------------------------------------------------
    //     var newMarkerLatitude = $(this).attr('data-latitude'),
    //         newMarkerLongitude = $(this).attr('data-longitude'),
    //         newMarkerPosition = new google.maps.LatLng(newMarkerLatitude, newMarkerLongitude);

    //     // Count markers with identical position
    //     var assemblyId,
    //         existingMarker,
    //         //numberOfMarkersWithIdenticalPosition = 1,
    //         assembliesWithIdenticalPosition = [];
    //     for (assemblyId in WGST.geo.map.markers.assembly) {
    //         existingMarker = WGST.geo.map.markers.assembly[assemblyId];
    //         if (markerPositionLatLng.equals(existingMarker.getPosition())) {
    //             //numberOfMarkersWithIdenticalPosition++;
    //             assembliesWithIdenticalPosition.push(assemblyId);
    //         }
    //     }

    //     return assembliesWithIdenticalPosition;
    // };



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




    // $('.cancel-assembly-upload-button').on('click', function(){
    //     // Remove selected FASTA file

    //     // Remove HTML element
    //     $('.assembly-item[data-name="' + selectedFastaFileName + '"]').remove();
    //     // Delete data object
    //     delete fastaFilesAndMetadata[selectedFastaFileName];

    //     // Update assembly list slider
    //     $('.assembly-list-slider').slider("option", "max", WGST.dragAndDrop.droppedFiles.length);
    //     // Recalculate total number of selected files
    //     $('.total-number-of-dropped-assemblies').text(WGST.dragAndDrop.droppedFiles.length);

    //     updateSelectedFilesUI($('.assembly-list-slider').slider('value'));

    //     // Check if only 1 selected file left
    //     if (Object.keys(fastaFilesAndMetadata).length === 1) {
    //         // Update label
    //         $('.assembly-upload-total-number-label').text('assembly');
    //         // Update file name of assembly
    //         $('.upload-single-assembly-file-name').text(fastaFilesAndMetadata[Object.getOwnPropertyNames(fastaFilesAndMetadata)[0]].name);
    //         // Hide multiple assemblies label
    //         $('.upload-multiple-assemblies-label').hide();
    //         // Show single assembly label
    //         $('.upload-single-assembly-label').show();
    //         // Only 1 selected file left - hide assembly navigator
    //         $('.assembly-navigator').hide();
    //     } else {
    //         // More than 1 selected files left - update assembly navigator
    //         updateRangeNavigationButtons($('.assembly-list-slider').slider('value')); 
    //     }

    //     updateSelectedFilesSummary();
    //     updateMetadataProgressBar();
    // });



    // // Deselect Twitter Bootstrap button on click
    // $('.tree-panel .wgst-tree-controls button').on('click', function(){
    //     $(this).blur();
    // });









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

    // $('.wgst-navigation-item').on('click', function(event){
    //     event.preventDefault();
    // });

    // $('.wgst-navigation-item__map').on('click', function(){
    //     var activeFullscreenElement = $('.wgst-fullscreen--active');

    //     if (activeFullscreenElement.attr('data-fullscreen-name') === 'map') {
    //         bringFullscreenToPanel(false); 
    //     }

    //     window.WGST.openPanel('map');

    //     google.maps.event.trigger(WGST.geo.map.canvas, 'resize');
    // });

    // $('.wgst-navigation-item__representative-tree').on('click', function(){
    //     return false;
    //     openRepresentativeCollectionTree();
    // });

    // $('.wgst-navigation-item__collection').on('click', function(){
    //     if (isNavItemEnabled('collection')) {
    //         var activeFullscreenElement = $('.wgst-fullscreen--active');

    //         if (activeFullscreenElement.attr('data-fullscreen-name') === 'collection') {
    //             bringFullscreenToPanel(false); 
    //         }

    //         window.WGST.openPanel('collection');
    //     }
    // });

    // google.maps.event.addDomListener(window, "resize", function() {
    //     var map = WGST.geo.map.canvas;
    //     var center = map.getCenter();
    //     google.maps.event.trigger(map, "resize");
    // map.setCenter(center); 
    // });








    // /**
    //  * Description
    //  * @method bringMapPanelToFullscreen
    //  * @param {} panelName
    //  * @param {} panelId
    //  * @return 
    //  */
    // var bringMapPanelToFullscreen = function(panelName, panelId) {
    //     if (! isFullscreenActive(panelName)) {
    //         bringFullscreenToPanel(false);

    //         bringPanelToFullscreen(panelId, function(){
    //             $('[data-fullscreen-name="' + panelName + '"]')
    //                 .html('')
    //                 .append(WGST.geo.map.canvas.getDiv());

    //             google.maps.event.trigger(WGST.geo.map.canvas, 'resize');
    //         });
    //     } 
    // };

    // $('body').on('click', '.wgst-panel-control-button__opacity', function(){
    //     if ($(this).hasClass('wgst-panel-control-button--active')) {
    //         // Toggle opacity
    //         var panel = $(this).closest('.wgst-panel');
    //         if (panel.css('opacity') !== '1') {
    //             panel.css('opacity', '1');
    //         } else {
    //             panel.css('opacity', '0.85');
    //         }
    //     } // if
    // });

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