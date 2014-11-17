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