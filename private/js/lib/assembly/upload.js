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

            //
            // This describes how date parsing works: 
            // http://momentjs.com/docs/#/parsing/string/
            //
            var assemblyDate = moment(assemblyMetadataDate, 'DD-MM-YYYY');

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

        var geocoder = new google.maps.Geocoder();

        var geocode = function (address, callback) {

            geocoder.geocode({'address': address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    callback(null, results[0]);

                } else {

                    callback(status, null);
                }
            });
        };

        var GEOCODER_STATUSES = {
            READY: 1,
            BUSY: 0
        };
        var GEOCODER_DELAY_INCREMENT = 1000;
        var geocoderStatus = GEOCODER_STATUSES.READY;
        var geocoderDelay = 0;

        var setAssemblyMetadataFormLocation = function(assemblyFileId, assemblyMetadataAddress) {

            setTimeout(function () {

                var address = assemblyMetadataAddress;

                if (geocoderStatus === GEOCODER_STATUSES.BUSY) {
                    geocoderDelay = geocoderDelay + GEOCODER_DELAY_INCREMENT;
                    setAssemblyMetadataFormLocation(assemblyFileId, assemblyMetadataAddress);
                    return;
                }

                geocoderStatus = GEOCODER_STATUSES.BUSY;

                geocode(address, function (error, result) {
                    if (error) {
                        console.error('[WGST] Could not geocode ' + address + ': ' + error);
                        return;
                    }

                    console.log('[WGST] Geocodeded ' + address);

                    var formattedAddress = result.formatted_address;
                    var latitude = result.geometry.location.lat();
                    var longitude = result.geometry.location.lng();

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

                    geocoderStatus = GEOCODER_STATUSES.READY;
                });

            }, geocoderDelay);
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
            metadata.forEach(function(assemblyMetadata) {

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