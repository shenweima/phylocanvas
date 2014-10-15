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
	    	csvFileTypeRegex: /csv/
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

		var handleCsvDrop = function(file) {
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

		var sortLoadedFilesByName = function() {
	        //
	        // Sort loaded files by name
	        //
	        window.WGST.dragAndDrop.loadedFiles.sort(function(a, b){
	            if (a.file.name > b.file.name) {
	                return 1;
	            } else if (a.file.name < b.file.name) {
	                return -1;
	            } else {
	                return 0;
	            }
	        });
		};

		var handleFastaDrop = function(file) {
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
                    // Generate uid for dropped file
                    uid: uuid.v4(),
                    event: event,
                    //fileCounter: fileCounter,
                    file: file//,
                    //droppedFiles: droppedFiles,
                    //collectionId: collectionId
                });

                				//
	                            // Wait until all files were loaded
	                            //
	                            if (window.WGST.dragAndDrop.loadedFiles.length === window.WGST.dragAndDrop.droppedValidFiles.length) {
	                                
                					console.log('[WGST] Loaded all FASTA files');

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

	                                	var assemblyFileId = loadedFile.file.name,
	                                		fastaFileString = loadedFile.event.target.result;

								    	//
								    	// Init data structure
								    	//
								    	window.WGST.upload.fastaAndMetadata[assemblyFileId] = {
								    		fasta: {
								    			name: assemblyFileId,
								    			assembly: fastaFileString
								    		},
								    		metadata: {}
								    	};

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
	                                        '<option value="' + loadedFile.file.name + '">' + loadedFile.file.name + '</option>'
	                                    );
	                                });

	                                //
	                                // Show first assembly
	                                //
	                                window.WGST.exports.showAssemblyUpload(WGST.dragAndDrop.loadedFiles[0].file.name);

	                                //window.WGST.exports.showDroppedAssembly(WGST.dragAndDrop.loadedFiles[0].uid);
					                //window.WGST.exports.showAssemblyUploadAnalytics(WGST.dragAndDrop.loadedFiles[0].file.name);
					                //window.WGST.exports.showAssemblyUploadMetadata(WGST.dragAndDrop.loadedFiles[0].file.name);
	                            
						            //
						            // Hide drag and drop
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
			return file.type.match(window.WGST.dragAndDrop.csvFileTypeRegex)
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

	            window.WGST.dragAndDrop.droppedValidFiles = validatedDroppedFiles.validFiles;

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

	            //
	            // Handle each file based on it's type
	            //
	            window.WGST.dragAndDrop.droppedValidFiles.map(function(file){

	            	//
	            	// Validate file type
	            	//

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