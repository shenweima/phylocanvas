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

	    $('body').on('click', '.wgst-panel__assembly-upload-metadata .copy-metadata-to-all-empty-assemblies', function() {
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