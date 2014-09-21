$(function(){

	(function(){

    	var csvFileTypeRegex = /csv/;

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

	    var handleDrop = function(event) {

	    	//
	        // Check if file upload is on
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

	            var collectionId = '';

	            // // Check if user drag and drops to the existing collection
	            // if (isPanelActive('collection')) {

	            //     collectionId = $('.wgst-panel__collection').attr('data-collection-id');
	            //     $('.wgst-panel__assembly-upload-navigator').attr('data-collection-id', collectionId);
	            //     deactivatePanel('collection');
	            //     clearCollectionAssemblyList(collectionId);

	            // } else if (isFullscreenActive('collection')) {

	            //     collectionId = $('.wgst-fullscreen__collection .wgst-collection').attr('data-collection-id');
	            //     $('.wgst-panel__assembly-upload-navigator').attr('data-collection-id', collectionId);
	            //     clearCollectionAssemblyList(collectionId);

	            //     // Show fullscreen map
	            //     bringMapPanelToFullscreen('map', 'map');

	            // }

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

	            // Set the highest z index for this panel
	            //$('.assembly-upload-panel').trigger('mousedown');

	            if (WGST.speak) {
	                var messageText = '',
	                    message;

	                if (collectionId.length > 0) {
	                    messageText = 'You have dropped ' +  event.dataTransfer.files.length + ' files to the existing collection.';
	                } else {
	                    messageText = 'You have dropped ' +  event.dataTransfer.files.length + ' files';
	                }

	                message = new SpeechSynthesisUtterance(messageText);
	                window.speechSynthesis.speak(message);
	            }

	            //
	            // FileList object
	            // https://developer.mozilla.org/en-US/docs/Web/API/FileList
	            //
	            var droppedFiles = event.dataTransfer.files;

	            WGST.dragAndDrop.files = $.merge(WGST.dragAndDrop.files, droppedFiles);
	            WGST.dragAndDrop.loadedFiles = [];

	            var allDroppedFiles = WGST.dragAndDrop.files,
	                // A single file from FileList object
	                file = allDroppedFiles[0],
	                // File name is used for initial user assembly id
	                fileName = file.name,
	                // Count files
	                //fileCounter = 0,
	                // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
	                fileReader = new FileReader();

	            //
	            // Check if user dropped only 1 assembly
	            //
	            if (allDroppedFiles.length === 1) {
	                // Hide average number of contigs per assembly
	                $('.upload-multiple-assemblies-label').hide();
	                // Set file name of dropped file
	                $('.upload-single-assembly-file-name').text(fileName);
	                // Show single assembly upload label
	                $('.upload-single-assembly-label').show();
	            } else {
	                // Hide text that belongs to a single assembly upload summary
	                $('.upload-single-assembly-label').hide();
	                // Show multiple assemblies upload label
	                $('.upload-multiple-assemblies-label').show();
	            }

	            // Init assembly navigator

	            // Update total number of assemblies
	            $('.total-number-of-dropped-assemblies').text(allDroppedFiles.length);

	            // Update assembly list slider
	            $('.assembly-list-slider').slider('option', 'max', allDroppedFiles.length - 1);

	            // Set file name
	            $('.assembly-file-name').text(fileName);

	            // If there is more than 1 file dropped then show assembly navigator
	            if (allDroppedFiles.length > 1) {
	                // Show assembly navigator
	                $('.assembly-navigator').show();
	                // Focus on slider handle
	                $('.ui-slider-handle').focus();
	            }

	            numberOfDroppedFastaFiles = Object.keys(allDroppedFiles).length;

	            $.each(allDroppedFiles, function(fileCounter, file){
	                // https://developer.mozilla.org/en-US/docs/Web/API/FileList#item()

	                if (file.type.match(csvFileTypeRegex)) {
	                    console.log('Dropped CSV file');
	                    console.dir(file);

	                    handleCsvDrop(file);

	                } else if (file.name.match(WGST.dragAndDrop.fastaFileNameRegex)) {
	                    console.log('Dropped FASTA file');

	                    if ($('.wgst-panel__assembly-upload-analytics .assembly-item[data-name="' + file.name + '"]').length === 0) {

	                        var fileReader = new FileReader();

	                        fileReader.addEventListener('load', function(event){
	                            console.log('[WGST] Loaded file ' + event.target.name);

	                            // Store loaded file
	                            WGST.dragAndDrop.loadedFiles.push({
	                                // Generate uid for dropped file
	                                uid: uuid.v4(),
	                                event: event,
	                                fileCounter: fileCounter,
	                                file: file,
	                                droppedFiles: droppedFiles,
	                                collectionId: collectionId
	                            });

	                            // Once all files have been loaded
	                            if (WGST.dragAndDrop.loadedFiles.length === WGST.dragAndDrop.files.length) {
	                                
	                                //
	                                // Sort loaded files by name
	                                //
	                                WGST.dragAndDrop.loadedFiles.sort(function(a, b){
	                                    if (a.file.name > b.file.name) {
	                                        return 1;
	                                    } else if (a.file.name < b.file.name) {
	                                        return -1;
	                                    } else {
	                                        return 0;
	                                    }
	                                });

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
	                                    parseFastaFile(loadedFile.event, loadedFile.fileCounter, loadedFile.file, loadedFile.droppedFiles, loadedFile.collectionId, loadedFile.uid);
	                                    
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
	                            }
	                        });

	                        // Read file as text
	                        fileReader.readAsText(file);

	                    } // if

	                } else {
	                    // ============================================================
	                    // React component
	                    // ============================================================
	                    React.renderComponent(
	                        WorkflowQuestion({
	                            title: 'What type of data have you dropped?',
	                            buttons: [
	                            {
	                                label: 'Assemblies in FASTA format',
	                                value: 'fasta'
	                            },
	                            {
	                                label: 'Metadata in CSV format',
	                                value: 'csv'
	                            }]
	                        }),
	                        document.querySelectorAll(".wgst-react-component__workflow-question")[0]
	                    );
	                } // if

	                //console.log('Dropped file type: ' + file.type);
	                //console.dir(file);

	                // // Validate file name   
	                // if (file.name.match(WGST.dragAndDrop.fastaFileNameRegex)) {
	                //     if ($('.wgst-panel__assembly-upload-analytics .assembly-item[data-name="' + file.name + '"]').length === 0) {

	                //         // Create closure (new scope) to save fileCounter, file variable with it's current value
	                //         //(function(){
	                //             var fileReader = new FileReader();

	                //             fileReader.addEventListener('load', function(event){
	                //                 parseFastaFile(event, fileCounter, file, droppedFiles, collectionId);
	                //             });

	                //             // Read file as text
	                //             fileReader.readAsText(file);
	                //         //})();

	                //     } // if
	                // // Invalid file name
	                // } else {
	                //     console.log("[WGST] File not supported");
	                // }

	            });

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
	            $('.assembly-upload-total-number').text(allDroppedFiles.length);
	            // Update lable for total number of assemblies to upload
	            $('.assembly-upload-total-number-label').html((allDroppedFiles.length === 1 ? 'assembly': 'assemblies'));
	        }
	    };

	    //
	    // Parse fasta file
	    //
	    var parseFastaFile = function(event, fileCounter, file, droppedFiles, collectionId) {

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

	        window.WGST.exports.validateContigs(contigs);

	        // // Start counting assemblies from 1, not 0
	        // fileCounter = fileCounter + 1;

	        // assemblies[fileCounter] = {
	        //     'name': file.name,
	        //     'id': '',
	        //     'contigs': {
	        //         'total': contigs.length,
	        //         'invalid': 0,
	        //         'individual': []
	        //     }
	        // };

	        var dnaStrings = window.WGST.exports.extractDnaStringsFromContigs(contigs);
	        var assemblyN50Data = window.WGST.exports.calculateN50(dnaStrings);
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

	        //totalNumberOfContigsDropped = totalNumberOfContigsDropped + contigs.length;
	        window.WGST.upload.stats.totalNumberOfContigs = window.WGST.upload.stats.totalNumberOfContigs + contigs.length;

	        // Show average number of contigs per assembly
	        //$('.assembly-sequences-average').text(Math.floor(totalNumberOfContigsDropped / droppedFiles.length));
	        //$('.assembly-sequences-average').text(Math.floor(window.WGST.upload.stats.totalNumberOfContigs / droppedFiles.length));




	        //
	        // 
	        // Render dropped assembly analytics
	        //
	        //
	        var droppedAssemblyAnalyticsContext = {
	            //name: assemblyFileId,
	            //fileCounter: fileCounter,
	            assemblyFileId: assemblyFileId,
	            // Print a number with commas as thousands separators
	            // http://stackoverflow.com/a/2901298
	            totalNumberOfNucleotidesInDnaStrings: totalNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            totalNumberOfContigs: contigs.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            smallestNumberOfNucleotidesInDnaStrings: smallestNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            averageNumberOfNucleotidesInDnaStrings: averageNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            biggestNumberOfNucleotidesInDnaStrings: biggestNumberOfNucleotidesInDnaStrings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
	            contigN50: assemblyN50Data['sequenceLength'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	        };

	        //console.debug('droppedAssemblyAnalyticsContext:');
	        //console.dir(droppedAssemblyAnalyticsContext);

	        var droppedAssemblyAnalyticsTemplateHtml = $('.wgst-template[data-template-id="droppedAssemblyAnalytics"]').html();
	        var droppedAssemblyAnalyticsTemplate = Handlebars.compile(droppedAssemblyAnalyticsTemplateHtml);
	        var droppedAssemblyAnalyticsHtml = droppedAssemblyAnalyticsTemplate(droppedAssemblyAnalyticsContext);

	        $('.wgst-assembly-upload__analytics ul').append($(droppedAssemblyAnalyticsHtml));




	        //
	        // 
	        // Render dropped assembly metadata form
	        //
	        //
	        var droppedAssemblyMetadataFormContext = {
	            //name: assemblies[fileCounter]['name'],
	            //fileCounter: fileCounter,
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






	        // Draw N50 chart
	        var sumsOfNucleotidesInDnaStrings = window.WGST.exports.calculateSumsOfNucleotidesInDnaStrings(dnaStrings);

	        //console.log('[WGST] * dev * assemblyN50:');
	        //console.dir(assemblyN50);

	        window.WGST.exports.drawN50Chart(sumsOfNucleotidesInDnaStrings, assemblyN50Data, '.sequence-length-distribution-chart[data-assembly-file-id="' + assemblyFileId + '"]');
	        //drawN50Chart(assemblyNucleotideSums, assemblyN50, fileCounter);

	        // Show first assembly
	        //$('.assembly-item-1').removeClass('wgst--hide-this');
	        //$('.assembly-item').eq('0').show();
	        // $('#assembly-item-1').show();
	        // $('#assembly-metadata-item-1').show();

	        //showDroppedAssembly();
	        //$('.')

	        // // Set file name in metadata panel title
	        // $('.wgst-panel__assembly-upload-metadata .header-title small').text($('#assembly-metadata-item-1').attr('data-name'));

	        // // Set file name in analytics panel title
	        // $('.wgst-panel__assembly-upload-analytics .header-title small').text($('#assembly-item-1').attr('data-name'));

	        // Store displayed fasta file name
	        //selectedFastaFileName = $('.assembly-item-1').attr('data-name');
	        //selectedFastaFileName = $('.assembly-item').eq('0').attr('data-name');

	        // Init bootstrap datetimepicker
	        //$('.assembly-upload-panel .assembly-sample-datetime-input').datetimepicker();
	        // $('#assemblySampleDatetimeInput' + fileCounter).datetimepicker().on('dp.change', function(){
	        //     console.log('Datetime changed');
	        // });


			window.WGST.exports.initAssemblyUploadMetadataLocation(assemblyFileId);


            // // On change store datetime in assembly metadata
            // $('li.assembly-item[data-name="' + fileName + '"] .assembly-sample-datetime-input').datetimepicker({
            //     useCurrent: false,
            //     language: 'en-gb'
            // }).on('change', function(){
            //     WGST.upload.assembly[fileName].metadata = WGST.upload.assembly[fileName].metadata || {};
            //     WGST.upload.assembly[fileName].metadata.datetime = $(this).val();
            // });





                // numberOfParsedFastaFiles = numberOfParsedFastaFiles + 1;

                // console.log('numberOfDroppedFastaFiles: ' + numberOfDroppedFastaFiles);
                // console.log('numberOfParsedFastaFiles: ' + numberOfParsedFastaFiles);

                // if (numberOfDroppedFastaFiles === numberOfParsedFastaFiles) {
                //     //openAssemblyUploadPanels();

                //     //YYY
                // }

	        





	        // // Create closure to save value of fileName
	        // (function(fileName){

	        //     // Get autocomplete input (jQuery) element
	        //     var autocompleteInput = $('.wgst-assembly-upload__metadata li[data-name="' + fileName + '"] .assembly-sample-location-input');

	        //     // Init Goolge Maps API Places Autocomplete
	        //     // TO DO: This creates new Autocomplete object for each drag and drop file - possibly needs refactoring/performance optimization
	        //     //WGST.geo.metadataAutocomplete[fileName] = new google.maps.places.Autocomplete(document.getElementById('assemblySampleLocationInput' + fileCounter));
	        //     // [0] returns native DOM element: http://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/
	        //     //WGST.geo.metadataAutocomplete[fileName] = new google.maps.places.Autocomplete(autocompleteInput[0]);
	        //     WGST.geo.placeSearchBox[fileName] = new google.maps.places.SearchBox(autocompleteInput[0], {
	        //         bounds: WGST.geo.map.searchBoxBounds
	        //     });

	        //     // When the user selects an address from the dropdown, get geo coordinates
	        //     // https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform
	        //     // TO DO: Remove this event listener after metadata was sent
	        //     // view-source:http://rawgit.com/klokan/8408394/raw/5ab795fb36c67ad73c215269f61c7648633ae53e/places-enter-first-item.html
	        //     google.maps.event.addListener(WGST.geo.placeSearchBox[fileName], 'places_changed', function() {

	        //         // Get the place details from the autocomplete object.
	        //         var places = WGST.geo.placeSearchBox[fileName].getPlaces(),
	        //             place = places[0];

	        //         if (typeof place === 'undefined' || typeof place.geometry === 'undefined') {
	        //             console.dir(WGST.geo.placeSearchBox[fileName]);
	        //             return;
	        //         }

	        //         // If the place has a geometry, then present it on a map
	        //         var latitude = place.geometry.location.lat(),
	        //             longitude = place.geometry.location.lng(),
	        //             formattedAddress = place.formatted_address;

	        //         console.log('[WGST] Google Places API first SearchBox place:');
	        //         console.log(formattedAddress);

	        //         // ------------------------------------------
	        //         // Update metadata form
	        //         // ------------------------------------------
	        //         var currentInputElement = $('.wgst-panel__assembly-upload-metadata .assembly-item[data-name="' + fileName + '"]').find('.assembly-sample-location-input');

	        //         // Show next form block if current input has some value
	        //         if (currentInputElement.val().length > 0) {

	        //             // Show next metadata form block
	        //             currentInputElement.closest('.form-block').next('.form-block').fadeIn();

	        //             // Scroll to the next form block
	        //             currentInputElement.closest('.assembly-metadata').animate({scrollTop: currentInputElement.closest('.assembly-metadata').height()}, 400);
	        //         } // if

	        //         // Increment metadata progress bar
	        //         updateMetadataProgressBar();
	        //         // Replace whatever user typed into this input box with formatted address returned by Google
	        //         currentInputElement.blur().val(formattedAddress);

	        //         // ------------------------------------------
	        //         // Update map, marker and put metadata into assembly object
	        //         // ------------------------------------------
	        //         // Set map center to selected address
	        //         WGST.geo.map.canvas.setCenter(place.geometry.location);
	        //         // Set map
	        //         WGST.geo.map.markers.metadata.setMap(WGST.geo.map.canvas);
	        //         // Set metadata marker's position to selected address
	        //         WGST.geo.map.markers.metadata.setPosition(place.geometry.location);
	        //         // Show metadata marker
	        //         WGST.geo.map.markers.metadata.setVisible(true);

	        //         //
	        //         // Update metadata store
	        //         //
	        //         WGST.upload.assembly[fileName] = WGST.upload.assembly[fileName] || {};
	        //         WGST.upload.assembly[fileName].metadata = WGST.upload.assembly[fileName].metadata || {};
	        //         WGST.upload.assembly[fileName].metadata.geography = {
	        //             address: formattedAddress,
	        //             position: {
	        //                 latitude: latitude,
	        //                 longitude: longitude
	        //             },
	        //             // https://developers.google.com/maps/documentation/geocoding/#Types
	        //             type: place.types[0]
	        //         };

	        //     });

	        //     // // On change store datetime in assembly metadata
	        //     // $('li.assembly-item[data-name="' + fileName + '"] .assembly-sample-datetime-input').datetimepicker({
	        //     //     useCurrent: false,
	        //     //     language: 'en-gb'
	        //     // }).on('change', function(){
	        //     //     WGST.upload.assembly[fileName].metadata = WGST.upload.assembly[fileName].metadata || {};
	        //     //     WGST.upload.assembly[fileName].metadata.datetime = $(this).val();
	        //     // });

	        //     // On change store source in assembly metadata
	        //     $('li.assembly-item[data-name="' + fileName + '"] .assembly-sample-source-input').on('change', function(){
	        //         WGST.upload.assembly[fileName].metadata = WGST.upload.assembly[fileName].metadata || {};
	        //         WGST.upload.assembly[fileName].metadata.source = $(this).val();
	        //     });



	        //         numberOfParsedFastaFiles = numberOfParsedFastaFiles + 1;

	        //         console.log('numberOfDroppedFastaFiles: ' + numberOfDroppedFastaFiles);
	        //         console.log('numberOfParsedFastaFiles: ' + numberOfParsedFastaFiles);

	        //         if (numberOfDroppedFastaFiles === numberOfParsedFastaFiles) {
	        //             //openAssemblyUploadPanels();

	        //             //YYY
	        //         }

	        
	        // }(file.name));
	    
	    }; // parseFastaFile()

		//
		// Listen to drag and drop events
		//
		var dropZone = $('[wgst-drag-and-drop-zone]')[0];
		dropZone.addEventListener('dragenter', handleDragEnter, false);
		dropZone.addEventListener('dragover', handleDragOver, false);
		dropZone.addEventListener('dragleave', handleDragLeave, false);
		dropZone.addEventListener('drop', handleDrop, false);
	})();

});