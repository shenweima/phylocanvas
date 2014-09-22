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

            if  (! window.WGST.exports.isPanelExists('assembly-upload-progress')) {
                //
                // Create panel
                //
                var totalNumberOfAssembliesUploading = Object.keys(window.WGST.upload.fastaAndMetadata).length;

                window.WGST.exports.createPanel('assembly-upload-progress', {
                    panelId: 'assembly-upload-progress',
                    panelType: 'assembly-upload-progress',
                    assemblyFileIds: Object.keys(window.WGST.upload.fastaAndMetadata),
                    totalNumberOfAssembliesUploading: totalNumberOfAssembliesUploading
                });

                //
                // Show panel
                //
                window.WGST.exports.showPanel('assembly-upload-progress');

                //
                // Hide uploading background
                //
                window.WGST.exports.hideBackground('uploading');
            }

            // //
            // // Hide uploading background
            // //
            // window.WGST.exports.hideBackground('uploading');

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
	                	// Remove panel
	                	//
	                	window.WGST.exports.removePanel('assembly-upload-progress');

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