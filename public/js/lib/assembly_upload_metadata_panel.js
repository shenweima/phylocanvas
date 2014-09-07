$(function(){

	(function(){

		window.WGST.exports.showAssemblyUploadMetadata = function(assemblyFileId) {
			$('.wgst-panel__assembly-upload-metadata .wgst-upload-assembly__metadata').addClass('hide-this');
			$('.wgst-panel__assembly-upload-metadata .wgst-upload-assembly__metadata[data-assembly-file-id="' + assemblyFileId + '"]').removeClass('hide-this');
		
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
	                populateDaySelect($timestampDaySelect, selectedYear, selectedMonth);
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
	            $('.assembly-metadata-timestamp-month[data-assembly-file-id="' + assemblyFileId + '"]').removeClass('hide-this');
	        } else if (timestampPart === 'month') {
	            $('.assembly-metadata-timestamp-day[data-assembly-file-id="' + assemblyFileId + '"]').removeClass('hide-this');
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

	            window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata = window.WGST.upload.fastaAndMetadata[assemblyFileId].metadata || {};
	            window.WGST.upload.fastaAndMetadata[assemblyFileId].datetime = date;

	            //WGST.upload.assembly[fileName].metadata = WGST.upload.assembly[fileName].metadata || {};
	            //WGST.upload.assembly[fileName].metadata.datetime = date; 
	        } // if

	        // ---------------------------------------------------------------
	        // Show next assembly metadata block if at least year is provided
	        // ---------------------------------------------------------------
	        if (selectedYear !== '-1') {
	            // Show next metadata form block
	            $select.closest('.assembly-metadata-block').next('.assembly-metadata-block').fadeIn();
	            // Scroll to the next form block
	            $select.closest('.assembly-metadata-block').animate({scrollTop: $select.closest('.assembly-metadata-block').height()}, 400);

	            window.WGST.exports.updateMetadataProgressBar();
	        } // if
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

	    var getTotalNumberOfDaysInMonth = function(year, month) {
	        // http://www.dzone.com/snippets/determining-number-days-month
	        return 32 - new Date(year, month, 32).getDate();
	    };

	    var populateDaySelect = function($selectElement, selectedYear, selectedMonth) {
	        // Remove previous list of days and append a new one
	        $selectElement.html('')
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

	})();

});