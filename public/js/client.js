"use strict"; // Available in ECMAScript 5 and ignored in older versions. Future ECMAScript versions will enforce it by default.

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
if (!Array.prototype.filter) {
  Array.prototype.filter = function (fn, context) {
    var i,
        value,
        result = [],
        length;

        if (!this || typeof fn !== 'function' || (fn instanceof RegExp)) {
          throw new TypeError();
        }

        length = this.length;

        for (i = 0; i < length; i++) {
          if (this.hasOwnProperty(i)) {
            value = this[i];
            if (fn.call(context, value, i, this)) {
              result.push(value);
            }
          }
        }
    return result;
  };
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
if ('function' !== typeof Array.prototype.reduce) {
  Array.prototype.reduce = function(callback, opt_initialValue){
    'use strict';
    if (null === this || 'undefined' === typeof this) {
      // At the moment all modern browsers, that support strict mode, have
      // native implementation of Array.prototype.reduce. For instance, IE8
      // does not support strict mode, so this check is actually useless.
      throw new TypeError(
          'Array.prototype.reduce called on null or undefined');
    }
    if ('function' !== typeof callback) {
      throw new TypeError(callback + ' is not a function');
    }
    var index, value,
        length = this.length >>> 0,
        isValueSet = false;
    if (1 < arguments.length) {
      value = opt_initialValue;
      isValueSet = true;
    }
    for (index = 0; length > index; ++index) {
      if (this.hasOwnProperty(index)) {
        if (isValueSet) {
          value = callback(value, this[index], index, this);
        }
        else {
          value = this[index];
          isValueSet = true;
        }
      }
    }
    if (!isValueSet) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    return value;
  };
}

var getSequenceStringLengthFrequency = function(sequenceStringArray) {
    var frequency = {},
    	i = 0;
    for (; i < sequenceStringArray.length; i++) {
        var sequenceLength = sequenceStringArray[i].length;
        if (frequency[sequenceLength]) {
           frequency[sequenceLength]++;
        } else {
           frequency[sequenceLength] = 1;
        }
    }
    return frequency;
};

// Check if user provided assembly id
if (typeof window.requestedAssembly !== 'undefined') {

	console.log('[WGST] Assembly requested');
	console.log(requestedAssembly);

	// TODO: Sort data by score
	// http://stackoverflow.com/a/15322129
	var sortableScoresArray = [],
		maxScore = 0;

	for (var score in requestedAssembly.scores) {
		if (requestedAssembly.scores.hasOwnProperty(score)) {
			sortableScoresArray.push({ 
				'referenceId': requestedAssembly.scores[score].referenceId,
				'score': requestedAssembly.scores[score].score
			});
			// Check for max score
			if (requestedAssembly.scores[score].score > maxScore) {
				// Update max score
				maxScore = requestedAssembly.scores[score].score;
			}
		}
	}

	sortableScoresArray = sortableScoresArray.sort(function(a,b){
		return b.score - a.score;
	});

	console.log(sortableScoresArray);
	console.log('Max score: ' + maxScore);

	// TODO: Convert score values into percentages where the highest number is 100%

	// Create assembly data table
	var counter = 0;
	for (var i = 0; i < sortableScoresArray.length; i++ ) {
		counter++;
		$('.assembly-data-table tbody').append(
			((counter % 2 === 0) ? '<tr>' : '<tr class="row-stripe">')
			+ '<td>'
				+ sortableScoresArray[i].referenceId
			+ '</td>'
			+ '<td>'
				+ Math.floor(+sortableScoresArray[i].score * 100 / maxScore) + '%'
			+ '</td>'
			+ '<tr/>'
		);
	}
	
	// Create assembly data table
	/*
	var counter = 0;
	for (var score in requestedAssembly.scores) {
		if (requestedAssembly.scores.hasOwnProperty(score)) {
			counter++;
			$('.assembly-data-table tbody').append(
				((counter % 2 === 0) ? '<tr>' : '<tr class="row-stripe">')
				+ '<td>'
					+ requestedAssembly.scores[score].referenceId
				+ '</td>'
				+ '<td>'
					+ requestedAssembly.scores[score].score
				+ '</td>'
				+ '<tr/>'
			);	
		}
	}
	*/

	// Create assembly data table
	/*
	var counter = 0;
	for (var score in requestedAssembly.scores) {
		if (requestedAssembly.scores.hasOwnProperty(score)) {
			counter++;
			$('.assembly-data-table tbody').append(
				((counter % 2 === 0) ? '<tr>' : '<tr class="row-stripe">')
				+ '<td>'
					+ requestedAssembly.scores[score][0]
				+ '</td>'
				+ '<td>'
					+ requestedAssembly.scores[score][1]
				+ '</td>'
				+ '<tr/>'
			);	
		}
	}
	*/

	// Set assembly panel header text
	$('.assembly-panel .wgst-panel-header .assembly-id').text(requestedAssembly.assemblyId);

	// Set assembly upload datetime in footer
	$('.assembly-upload-datetime').text(moment(requestedAssembly.timestamp, "YYYYMMDD_HHmmss").fromNow());

	// Show assembly data
	$('.assembly-panel').show();

} else {
	console.log('[WGST] No assembly requested');
}

$(function(){

	// Init jQuery UI draggable interaction
	$('.wgst-draggable').draggable({ handle: ".wgst-panel-header" });

	// Init jQuery IU slider widget
	$('.assembly-list-slider').slider({
		range: "max",
		min: 1,
		max: 10,
		value: 1,
		animate: 'fast',
		slide: function(event, ui) {
			$('.selected-assembly-counter').text(ui.value);
		}
	});

	// Init tabs
	//$('.assembly-list-container').tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
	//$('.assembly-list-container li').removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );

	// Init Twitter Bootstrap Slider
/*	$('.assembly-list-slider').slider({
		min: 1,
		max: 10
	});*/

	// WGST namespace
	var WGST = WGST || {};
	// Map
	WGST.map = {};
	WGST.mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(51.511214, -0.119824),
        mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	WGST.initMap = function() {
		this.map = new google.maps.Map(document.getElementById('map'), this.mapOptions);
	};
	// Init map
	WGST.initMap();

	// File Upload
	WGST.fileUpload = {
		handleFileSelect: function() {

		}
	};

	if (Modernizr.draganddrop) {
	  // Browser supports HTML5 DnD.
	} else {
	  // Fallback to a library solution.
	}











/*	WGST.fileUpload = WGST.fileUpload || {};
	WGST.fileUpload = {
		dragAndDrop: (function(){
			var dropZone = document.getElementsByTagName('body')[0],

		}())
	};*/


	var FASTAFiles = [];





	var parseFastaFile = function(fastaFile) {
		// Validate FASTA format
		// Slice sequence identifier
		// Slice description
		// Slice sequence data
	};

	var uploadFastaObject = function(fastaObject) {
		// Post ajax request
	};


	var dropZone = document.getElementsByTagName('body')[0];
/*	var parseTextFile = function(e) {

		var sequenceListItem = $(
			'<li>'
			+ '<a href="#sequence-' + (i++) + '">Sequence ' + i + '</a>'
			+ '</li>'
		);

		var sequenceContent = $(
			'<div id="' + (i++) + '"></div>'
		);

		console.log(e.target.result);
	};*/

	var assemblies = {};

	var handleDragOver = function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	};
	var handleFileSelect = function(evt) {
		evt.stopPropagation();
		evt.preventDefault();

		$('.assembly-upload-panel').fadeIn('fast');

		


		// files is a FileList of File objects. List some properties.
/*		var output = [];
		for (var i = 0, f; f = files[i]; i++) {
		output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
			f.size, ' bytes, last modified: ',
			f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
			'</li>');
		}
		document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
*/

		//var file = files[0];
		//var textType = /text.*/;
		//var output = [];
		//var fileCounter,
		//	sequenceCounter,
		//	a, li, div, sequence;
		//var reader = new FileReader();









		// Define vars
		var files = evt.dataTransfer.files, // FileList object
			file = files[0],
			fileCounter = 0,
			sequenceCounter = 0,
			reader = new FileReader(),
			// FASTA file
			FASTAFileRegex = /^.+(.fa)$/i,
			// Assemblies
			//assemblies = {},
			// Array of sequence strings
			sequences = [],
			// Array of DNA sequence strings
			sequenceStringArray = [],
			// Array of sequence parts
			sequenceParts = [],
			assemblyListItem = $(); // Empty jQuery object

		var dnaSequenceRegex = /^[CTAGNUX]+$/i;
		var rawData = [];
		var chartData = [];
		var chartDataN50 = [];

		/*
			If user dropped only 1 assembly then 
			Hide average number of contigs per assembly
		*/
		if (files.length === 1) {
			$('.upload-multiple-assemblies-label').hide();
		}

		// Final JSON
		var finalAssembliesArray = [];

		// Configure assembly navigator

		// Update total number of assemblies
		$('.total-number-of-dropped-assemblies').text(files.length);

		// Update assembly list slider
		$('.assembly-list-slider').slider("option", "max", files.length);

		// Set file name
		$('.assembly-file-name').text(file.name);

		// If there is more than 1 file dropped then show assembly navigator
		if (files.length > 1) {
			// Show assembly navigator
			$('.assembly-navigator').show();
			// Focus on slider handle
			$('.ui-slider-handle').focus();
		}

		var totalSequencesUpload = 0,
			dnaSequence = '',
			dnaSequenceId = '';

		var parseFile = function(e, fileCounter, file) {

			// Start counting from 1 not 0
			fileCounter = fileCounter + 1;

			// Trim and then split assembly string into array of individual sequences
			// Then filter that array by removing empty strings
			sequences = e.target.result.trim().split('>').filter(function(element){
				return (element.length > 0);
			});

			console.log('sequences.length: ' + sequences.length);
			console.log('Last sequence: ' + sequences[sequences.length - 1]);

			// Record number of sequences found
			assemblies[fileCounter] = {
				'name': file.name,
				'id': '',
				'sequences': {
					'total': sequences.length,
					'invalid': 0,
					'individual': []
				}
			};

			// Empty array of DNA sequence strings
			sequenceStringArray = [];
			// Empty DNA sequence string
			dnaSequence = '';
			dnaSequenceId = '';

			// Parse each sequence and break it into sequence parts
			for (sequenceCounter = 0; sequenceCounter < sequences.length; sequenceCounter++) {

				// Split sequence string into sequence parts
				// Filter out empty parts
				sequenceParts = sequences[sequenceCounter].split(/\n/)
					.filter(function(element){
						return (element.length > 0);
					});
					/*
					.reduce(function(previousValue, currentValue, index, array){
							return array[index].trim();
					});
					*/

				console.log('sequenceParts.length: ' + sequenceParts.length);

				// Trim each element in sequence parts array
				for (var i = 0; i < sequenceParts; i++) {
					sequenceParts[i] = sequenceParts[i].trim();
				}

				/*

				Validate sequence parts

				*/

				// If there is only one sequence part then this sequence is invalid
				if (sequenceParts.length > 1) {

					/*

					DNA sequence can contain:
					1) [CTAGNUX] characters.
					2) White spaces (e.g.: new line characters).

					The first line of FASTA file contains id and description.
					The second line theoretically contains comments (starts with #).

					To parse FASTA file you need to:
					1. Separate assembly into individual sequences by splitting file's content by > character.
					   Note: id and description can contain > character.
					2. For each sequence: split it by a new line character, 
					   then convert resulting array to string ignoring the first (and rarely the second) element of that array.

					*/

					//// Store DNA sequence string
					//// Need to remove white space at the end of DNA sequence string
					////dnaSequence = sequenceParts[sequenceParts.length - 1].trim();

					// Parse sequence DNA string

					// Create sub array of a sequence parts array - cut the first element (id and description).
					var sequenceDNAStringArray = sequenceParts.splice(1, sequenceParts.length);

					console.log('sequenceDNAStringArray.length: ' + sequenceDNAStringArray.length);
					console.log('sequenceDNAStringArray[0]: ' + sequenceDNAStringArray[0].substr(0, 20));

					// Very rarely the second line can be a comment
					// If the first element won't match regex then assume it is a comment
					if (! dnaSequenceRegex.test(sequenceDNAStringArray[0].trim())) {
						console.log('DNA sequences comment!');
						// Remove comment element from the array
						sequenceDNAStringArray = sequenceDNAStringArray.splice(1, sequenceDNAStringArray.length);
					}

					console.log('sequenceDNAStringArray.length: ' + sequenceDNAStringArray.length);

					// If DNA sequence string is broken amongst multiple lines then convert all parts into a single string
/*					if (sequenceDNAStringArray.length > 1) {
						dnaSequence = sequenceDNAStringArray.join('');
					}*/

					// Convert array of DNA sequence substrings into a single string
					dnaSequence = sequenceDNAStringArray.join('').trim();

					console.log('dnaSequence.length: ' + dnaSequence.length);
					//console.log(sequenceDNAStringArray.length);
					//console.log('Fist array item: ' + sequenceDNAStringArray[0]);

					// Parse sequence id
					dnaSequenceId = sequenceParts[0].trim().replace('>','');

					// Validate DNA sequence string
					if (dnaSequenceRegex.test(dnaSequence)) {
						// Store it in array
						sequenceStringArray.push(dnaSequence);
						// Init sequence object
						assemblies[fileCounter]['sequences']['individual'][sequenceCounter] = {};
						// Sequence id
						assemblies[fileCounter]['sequences']['individual'][sequenceCounter]['id'] = dnaSequenceId;
						// Store it in object
						assemblies[fileCounter]['sequences']['individual'][sequenceCounter]['sequence'] = dnaSequence;
					// Invalid DNA sequence string
					} else {
						//$('#log').append('<div class="log-item">' + dnaSequence + '</div>');
						// Count as invalid sequence
						assemblies[fileCounter]['sequences']['invalid'] = assemblies[fileCounter]['sequences']['invalid'] + 1;
					}
				} else {
					// Count as invalid sequence
					assemblies[fileCounter]['sequences']['invalid'] = assemblies[fileCounter]['sequences']['invalid'] + 1;
				}

				// Construct sequence object out of sequence parts and add it to a collecton of sequences
				/*
				sequenceCollection[sequenceCounter] = {
					'identifier': sequenceParts[0],
					'sequence': sequenceParts[sequenceParts.length-1],
				};
				*/

			} // for

/*			var fileNameParts = 'foo.bar.bar.test.fa'.split('.');

			console.log([fileNameParts.length-1]);
			console.log(e.target);*/

			// FASTA file is valid
			FASTAFiles.push({
				name: file.name.substr(0, file.name.lastIndexOf('.')),
				assembly: e.target.result,
				metadata: {}
			});

/*			var fileNameParts = 'foo.bar.bar.test.fa'.split('.');

			console.log([fileNameParts.length-1]);

			// FASTA file is valid
			FASTAFiles.push({
				x: [fileNameParts.length-1],
				name: 'foo.bar.bar.test.fa'.replace([fileNameParts.length - 1], ''),
				assembly: e.target.result,
				metadata: {}
			});*/

			/*
			//rawData = getSequenceStringLengthFrequency(sequenceStringArray);
			//console.log(rawData);

		    chartData = $.map(rawData, function(value, index) {
				return {
					sequenceLength: index,
					lengthFrequency: value
				};
			});
			*/

			// Calculate N50
			// http://www.nature.com/nrg/journal/v13/n5/box/nrg3174_BX1.html

		    console.log('sequenceStringArray.length: ' + sequenceStringArray.length);

			// Order array by sequence length DESC
		    var sortedSequenceStringArray = sequenceStringArray.sort(function(a, b){
		    	return b.length - a.length;
		    });

		    console.log('sortedSequenceStringArray.length: ' + sortedSequenceStringArray.length);

		    // Calculate the total length of all contigs in the assembly
		    var sequenceLengthArray = [];
		    for (var i = 0; i < sortedSequenceStringArray.length; i++) {
		    	if (sequenceLengthArray.length > 0) {
		    		sequenceLengthArray.push(+sortedSequenceStringArray[i].length + +sequenceLengthArray[sequenceLengthArray.length - 1]);
		    	} else {
		    		sequenceLengthArray.push(+sortedSequenceStringArray[i].length);
		    	}
		    }
		    // Calculate one-half of the total length of all contigs in the assembly
		    var halfSum = sequenceLengthArray[sequenceLengthArray.length - 1] / 2;

		    console.log('Half sum: ' + halfSum);

		    console.log('sequenceLengthArray.length: ' + sequenceLengthArray.length);

		    // Sum the length of each contig starting from the longest contig
		    // until this running sum equals one-half of the total length of all contigs in the assembly
		    var sum = 0;
		    var n50 = {};
		    for (var i = 0; i < sortedSequenceStringArray.length; i++) {
		    	sum = sum + sortedSequenceStringArray[i].length;
		    	console.log('Index: ' + i + '. Length: ' + sortedSequenceStringArray[i].length + '. Sum: ' + sum);
		    	// The contig N50 of the assembly is the length of the shortest contig in this list
		    	if (sum >= halfSum) {
		    		n50['sequenceNumber'] = i + 1;
		    		n50['sum'] = sum;
		    		n50['sequenceLength'] = sortedSequenceStringArray[i].length;
		    		break;
		    	}
		    }

		    var averageNucleotidesPerSequence = Math.floor(sequenceLengthArray[sequenceLengthArray.length - 1] / sequenceStringArray.length);

		    // Calculate N50 quality
		    // If sequence length is greater than average sequence length then quality is good
		    if (n50['sequenceLength'] > averageNucleotidesPerSequence) {
		    	n50['quality'] = true;
		    	//$('.assembly-stats-n50-number').addClass('n50-quality');
		    } else { // Quality is bad
		    	n50['quality'] = false;
		    	//$('.assembly-stats-n50-number').addClass('n50-no-quality');
		    }

		    console.log('N50: ' + JSON.stringify(n50));

		    // Find N50
			/*for (var i = 0; i < sortedSequenceStringArray.length; i++) {
		    	sum = sum + sortedSequenceStringArray[i].length;
		    	if (sum >= half) {
		    		console.log('Sum: ' + sum);
		    		console.log('Index: ' + i);
		    		n50['index'] = i + 1;
		    		n50['sum'] = sum;
		    		break;
		    	}
		    }*/

/*		    for (var i = sortedSequenceStringArray.length - 1; i > 0; i--) {
		    	console.log('looking for N50: ' + sortedSequenceStringArray[i].length);
		    	if (sortedSequenceStringArray[i].length >= half) {
		    		n50 = sortedSequenceStringArray[i].length;
		    	}
		    }*/

			// Update total sequences to upload number
			totalSequencesUpload = totalSequencesUpload + sequences.length;
			// Show total sequences to upload number
			//$('.sequence-upload-total-number').text(totalSequencesUpload);
			// Show label for total sequence to upload number
			//$('.sequence-upload-number-label').text((totalSequencesUpload === 1 ? 'sequence': 'sequences'));

			// Show average number of sequences per assembly
			$('.assembly-sequences-average').text(Math.floor(totalSequencesUpload / files.length));

			// Display current assembly
			assemblyListItem = $(
				'<li class="assembly-item assembly-item-' + fileCounter + ' hide-this" data-name="' + assemblies[fileCounter]['name'] + '" id="assembly-item-' + fileCounter + '">'

					// Assembly overview
					+ '<div class="assembly-overview">'

						/*
		       			+ '<div class="assembly-stats-container assembly-file-name">'
		    				+ '<div>' + assemblies[fileCounter]['name'] + '</div>'
		    			+ '</div>'
		    			*/

		       			+ '<div class="assembly-stats-container">'
		       				// Print a number with commas as thousands separators
		       				// http://stackoverflow.com/a/2901298
		       				+ '<div class="assembly-stats-label">total nucleotides</div>'
		    				+ '<div class="assembly-stats-number">' + sequenceLengthArray[sequenceLengthArray.length - 1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</div>'
		    				//+ '<div class="assembly-stats-label">sequences</div>'
		    			+ '</div>'

		       			+ '<div class="assembly-stats-container">'
		       				// Print a number with commas as thousands separators
		       				// http://stackoverflow.com/a/2901298
		       				+ '<div class="assembly-stats-label">total contigs</div>'
		    				+ '<div class="assembly-stats-number">' + assemblies[fileCounter]['sequences']['total'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</div>'
		    				//+ '<div class="assembly-stats-label">sequences</div>'
		    			+ '</div>'

		       			+ '<div class="assembly-stats-container">'
		       				// Print a number with commas as thousands separators
		       				// http://stackoverflow.com/a/2901298
		    				+ '<div class="assembly-stats-label">min contig</div>'
		    				+ '<div class="assembly-stats-number">' + sortedSequenceStringArray[sortedSequenceStringArray.length - 1].length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<small>nt</small></div>'
		    				//+ '<div class="assembly-stats-label">sequences</div>'
		    			+ '</div>'

		       			+ '<div class="assembly-stats-container">'
		       				// Print a number with commas as thousands separators
		       				// http://stackoverflow.com/a/2901298
		    				+ '<div class="assembly-stats-label">mean contig</div>'
		    				+ '<div class="assembly-stats-number">' + averageNucleotidesPerSequence.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<small>nt</small></div>'
		    				//+ '<div class="assembly-stats-label">nucleotides per sequence<br/> on average</div>'
		    			+ '</div>'

		       			+ '<div class="assembly-stats-container">'
		       				// Print a number with commas as thousands separators
		       				// http://stackoverflow.com/a/2901298
		    				+ '<div class="assembly-stats-label">max contig</div>'
		    				+ '<div class="assembly-stats-number">' + sortedSequenceStringArray[0].length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<small>nt</small></div>'
		    				//+ '<div class="assembly-stats-label">sequences</div>'
		    			+ '</div>'

		       			+ '<div class="assembly-stats-container">'
		       				// Print a number with commas as thousands separators
		       				// http://stackoverflow.com/a/2901298
		    				+ '<div class="assembly-stats-label">contig N50</div>'
		    				+ '<div class="assembly-stats-number assembly-stats-n50-number">' + n50['sequenceLength'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<small>nt</small></div>'
		    				//+ '<div class="assembly-stats-label">nucleotides in<br>N50 contig</div>'
		    			+ '</div>'

	    			+ '</div>'

					// Summary
					+ '<div class="assembly-content-data">'
/*
		       			+ '<div class="assembly-stats-container">'
		    				+ '<div class="assembly-stats-number">' + assemblies[fileCounter]['sequences']['total'] + '</div>'
		    				+ '<div class="assembly-stats-label">sequences</div>'
		    			+ '</div>'

		       			+ '<div class="assembly-stats-container">'
		       				// Print a number with commas as thousands separators
		       				// http://stackoverflow.com/a/2901298
		    				+ '<div class="assembly-stats-number">' + averageNucleotidesPerSequence.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</div>'
		    				+ '<div class="assembly-stats-label">nucleotides per sequence<br/> on average</div>'
		    			+ '</div>'
*/
		    			+ '<div class="sequence-length-distribution-chart-' + fileCounter + '"></div>'
	    			+ '</div>'

	    			// Metadata form
	    			//+ '<div class="assembly-metadata">'
	    				//+ '<h4>Please provide mandatory assembly metadata:</h4>'
						/*+ '<form role="form">'

							+ '<div class="form-block assembly-metadata-' + fileCounter + '">'
								+ '<div class="form-group">'
									+ '<label for="assemblySampleDatetimeInput' + fileCounter + '">When this assembly was sampled?</label>'
									+ '<input type="text" class="form-control assembly-sample-datetime-input" id="assemblySampleDatetimeInput' + fileCounter + '" placeholder="">'
								+ '</div>'
								+ '<div class="checkbox">'
									+ '<label>'
									  + '<input type="checkbox" id="assemblySampleDatetimeNotSure' + fileCounter + '" class="not-sure-checkbox"> I am not sure! <span class="not-sure-hint hide-this">Please provide your best estimate.</span>'
									+ '</label>'
								+ '</div>'
							+ '</div>'

							+ '<div class="form-block assembly-metadata-' + fileCounter + ' hide-this">'
								+ '<div class="form-group">'
									+ '<label for="assemblySampleLocationInput' + fileCounter + '">Where this assembly was sampled?</label>'
									+ '<input type="text" class="form-control assembly-sample-location-input" id="assemblySampleLocationInput' + fileCounter + '" placeholder="E.g.: London, United Kingdom">'
								+ '</div>'

								+ '<div class="checkbox">'
									+ '<label>'
									  + '<input type="checkbox" id="assemblySampleLocationNotSure' + fileCounter + '" class="not-sure-checkbox"> I am not sure! <span class="not-sure-hint hide-this">Please provide your best estimate.</span>'
									+ '</label>'
								+ '</div>'	
							+ '</div>'

							+ '<div class="form-block assembly-metadata-' + fileCounter + ' hide-this">'
						  		+ '<button class="btn btn-default next-assembly-button" class="show-next-assembly">Next assembly</button>'
						  		+ ' <button class="btn btn-default apply-to-all-assemblies-button">Copy to all assemblies</button>'
							+ '</div>'

						+ '</form>'*/
					//+ '</div>'

					//+ '<div class="assembly-total-sequences">' + assemblies[fileCounter]['sequences']['all'] + '</div>'

	/*                			+ '<div class="assembly-identifier-container">'
	    				+ '<span class="assembly-identifier-label">Identifier:</span>'
	    				+ '<span class="assembly-identifier">' + assemblyCollection[assemblyCounter].identifier + '</span>'
	    			+ '</div>'
	    			+ '<div class="assembly-string-container">'
	    				+ '<span class="assembly-string-label">assembly preview:</span>'
	    				+ '<span class="assembly-string">' + assemblyCollection[assemblyCounter].assembly.slice(0, 100) + '...</span>'
	    			+ '</div>'*/

				+ '</li>'
			);

			var assemblyMetadataFormContainer = $('<div class="assembly-metadata"></div>');
			var assemblyMetadataFormHeader = $('<h4>Please provide mandatory assembly metadata:</h4>');
			var assemblyMetadataForm = $('<form role="form"></form>');

			var assemblySampleSpeciesFormBlock = $(
				'<div class="form-block assembly-metadata-' + fileCounter + ' assembly-metadata-block">'
					+ '<div class="form-group">'
						+ '<label for="assemblySampleSpeciesSelect' + fileCounter + '">What species have you sampled?</label>'
						+ '<select class="form-control assembly-sample-species-select" id="assemblySampleSpeciesSelect' + fileCounter + '">'
							+ '<option value="0" selected="selected">Choose species...</option>'
							+ '<option value="1">Staphylococcus aureus</option>'
							+ '<option value="2">Streptococcus pneumoniae</option>'
						+ '</select>'
					+ '</div>'
				+ '</div>'
			);

			var assemblySampleDatetimeFormBlock = $(
				'<div class="form-block assembly-metadata-' + fileCounter + ' assembly-metadata-block hide-this">'
					+ '<div class="form-group">'
						+ '<label for="assemblySampleDatetimeInput' + fileCounter + '">When this assembly was sampled?</label>'
						+ '<div class="input-group">'
							+ '<input type="text" class="form-control assembly-sample-datetime-input" id="assemblySampleDatetimeInput' + fileCounter + '" placeholder="">'
						 	+ '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>'
						+ '</div>'
					+ '</div>'
					+ '<div class="checkbox">'
						+ '<label>'
						  + '<input type="checkbox" id="assemblySampleDatetimeNotSure' + fileCounter + '" class="not-sure-checkbox"> I am not sure! <span class="not-sure-hint hide-this">Please provide your best estimate.</span>'
						+ '</label>'
					+ '</div>'
				+ '</div>'
			);
			var assemblySampleLocationFormBlock = $(
				'<div class="form-block assembly-metadata-' + fileCounter + ' assembly-metadata-block hide-this">'
					+ '<div class="form-group">'
						+ '<label for="assemblySampleLocationInput' + fileCounter + '">Where this assembly was sampled?</label>'
						+ '<div class="input-group">'
							+ '<input type="text" class="form-control assembly-sample-location-input" id="assemblySampleLocationInput' + fileCounter + '" placeholder="E.g.: London, United Kingdom">'
						 	+ '<span class="input-group-addon"><span class="glyphicon glyphicon-globe"></span></span>'
						+ '</div>'
					+ '</div>'

					+ '<div class="checkbox">'
						+ '<label>'
						  + '<input type="checkbox" id="assemblySampleLocationNotSure' + fileCounter + '" class="not-sure-checkbox"> I am not sure! <span class="not-sure-hint hide-this">Please provide your best estimate.</span>'
						+ '</label>'
					+ '</div>'	
				+ '</div>'
			);
			var assemblyControlsFormBlock = $(
				'<div class="form-block assembly-metadata-' + fileCounter + ' hide-this">'
			  		+ '<button class="btn btn-default next-assembly-button" class="show-next-assembly">Next empty metadata</button>'
			  		+ ' <button class="btn btn-default apply-to-all-assemblies-button">Copy to all assemblies</button>'
				+ '</div>'
			);
			var assemblyMeatadataDoneBlock = $(
				'<div class="form-block assembly-metadata-' + fileCounter + ' hide-this">'
			  		+ 'Ready? Click "Upload" button to upload your assemblies and metadata.'
				+ '</div>'
			);
			assemblyMetadataForm.append(assemblySampleSpeciesFormBlock);
			assemblyMetadataForm.append(assemblySampleDatetimeFormBlock);
			assemblyMetadataForm.append(assemblySampleLocationFormBlock);
			// Show form navigation buttons only when you're at the last assembly
			if (fileCounter < files.length) {
				assemblyMetadataForm.append(assemblyControlsFormBlock);
			} else {
				assemblyMetadataForm.append(assemblyMeatadataDoneBlock);
			}
			assemblyMetadataFormContainer.append(assemblyMetadataFormHeader);
			assemblyMetadataFormContainer.append(assemblyMetadataForm);

			assemblyListItem.append(assemblyMetadataFormContainer);

			// Append assembly
			$('.assembly-list-container ul').append(assemblyListItem);

			// Draw chart
			chartData = sequenceLengthArray;

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
			var svg = d3.select('.sequence-length-distribution-chart-' + fileCounter)
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

/*			svg.selectAll('.n50-circle')
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
				.data([n50])
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
			var n50Text = n50Group.append('text')
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
				'y': yScale(n50.sum)
			},
			{
				'x': xScale(n50.sequenceNumber) + 20,
				'y': yScale(n50.sum)
			},
			{
				'x': xScale(n50.sequenceNumber) + 20,
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

			var n50Path = n50Group.append('path')
				.attr('d', d50Line(d50LinesData));
				//.attr('class', 'n50-path');

			// Chart 1
			/*			
			var data = [
				{	sequenceLength: 100,
					lengthFrequency: 10
				},
				{
					sequenceLength: 200,
					lengthFrequency: 20
				},
				{
					sequenceLength: 300,
					lengthFrequency: 30
				},
				{
					sequenceLength: 400,
					lengthFrequency: 40
				},
				{
					sequenceLength: 500,
					lengthFrequency: 50
				}
			];
			data = chartData;
			console.log(JSON.stringify(data));

			var chartWidth = 460,
				chartHeight = 312;

			// Extent
			var xExtent = d3.extent(chartData, function(datum){
				return datum.sequenceLength;
			});

			// Scales

			// X
			var xScale = d3.scale.linear()
				//.domain(xExtent) // your data min and max
				.domain([0, d3.max(chartData, function(datum){
					return +datum.sequenceLength;
				})])
				.range([40, chartWidth - 50]); // the pixels to map, i.e. the width of the diagram

			// Y
			var yScale = d3.scale.linear()
				.domain([d3.max(chartData, function(datum){ // Can't use d3.extent in this case because min value has to be 0.
					return +datum.lengthFrequency;
				}), 0])
				.range([30, chartHeight - 52]);

			// Axes

			// X
			var xAxis = d3.svg.axis()
			    .scale(xScale)
			    .orient('bottom');

			// Y
			var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient('left')
				// http://stackoverflow.com/a/18822793
				.ticks(d3.max(chartData, function(datum){
					return datum.lengthFrequency;
				}))
				.tickFormat(d3.format("d"));

			// Append SVG to DOM
			var svg = d3.select('.sequence-length-distribution-chart-' + fileCounter)
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
				.text('Sequence length')
				.attr('class', 'axis-label')
				.attr('text-anchor', 'end')
				//.attr('x', chartWidth - 49)
				.attr('x', (chartWidth / 2) + 49)
				.attr('y', 45);

			// Y
			svg.select('.y.axis')
				.append('text')
				.text('Frequency')
				.attr('class', 'axis-label')
				.attr('transform', 'rotate(-90)')
				//.attr('x', -80)
				.attr('x', -(chartHeight / 2) - 22)
				//.attr('y', chartHeight / 2)
				.attr('y', -30);

			// Circles
			svg.selectAll('circle')
				.data(chartData)
				.enter()
				.append('circle')
				.attr('cx', function(datum){
					return xScale(datum.sequenceLength) + 20;
				})
				.attr('cy', function(datum){
					return yScale(datum.lengthFrequency);
				})
				.attr('r', 5);
			*/











			// Average sequence length / assembly
			// Average number of sequences / assembly


			// Draw graph
			//$('.sequence-length-distribution-chart-' + fileCounter).;

			//console.log('Assembly identifier: ' + assemblyCollection[sequenceCounter].identifier);
			//console.log('Assembly sequence: ' + assemblyCollection[sequenceCounter].sequence);

			// Show first assembly
			$('.assembly-item-1').removeClass('hide-this');

			// Init bootstrap datetimepicker
			//$('.assembly-upload-panel .assembly-sample-datetime-input').datetimepicker();
			$('#assemblySampleDatetimeInput' + fileCounter).datetimepicker();

			// Init Goolge Maps API Places Autocomplete
			/*var autocomplete = */new google.maps.places.Autocomplete(document.getElementById('assemblySampleLocationInput' + fileCounter));
			//autocomplete.bindTo('bounds', WGST.map);

			/*
			google.maps.event.addListener(autocomplete, 'place_changed', function() {
				var place = autocomplete.getPlace();
				console.log('Place: ' + place);
			});
			*/
		
		}; // parseFile

		// Process each file/assembly (1 file === 1 assembly)
		for (fileCounter = 0; fileCounter < files.length; fileCounter++) {
			file = files[fileCounter];			
			if (file.name.match(FASTAFileRegex)) {
				console.log('FASTA file.');
				// Create new file reader
				reader = new FileReader();
				// Create new scope to save fileCounter variable with it's current value
				// http://stackoverflow.com/a/2568989
				(function(savedFileCounter, currentFile) { 
					reader.onload = function(event){ parseFile(event, savedFileCounter, currentFile); };
				})(fileCounter, file);
				// Read file as a text
				reader.readAsText(file);
			} else {
				console.log("File not supported!");
			}
		} // for

		// Update total number of assemblies to upload
		$('.assembly-upload-total-number').text(files.length);
		// Update lable for total number of assemblies to upload
		$('.assembly-upload-total-number-label').text((files.length === 1 ? 'assembly': 'assemblies'));

	};
	var init = function() {
		dropZone.addEventListener('dragover', handleDragOver, false);
		dropZone.addEventListener('drop', handleFileSelect, false);
	};

	// Init drag and drop
	init();

	/*
		Sequence list navigation buttons
	*/
	// Disable/enable range navigation buttons
	var updateRangeNavigationButtons = function(handleValue) {
		// Update sequence navigation buttons
		if (handleValue === 1) { // Reached min limit
			// Disable prev sequence button
			$('.nav-prev-item').attr('disabled', 'disabled');
			// Enable next sequence button (if disabled)
			$('.nav-next-item').removeAttr('disabled', 'disabled');
		} else if (handleValue === parseInt($('.total-number-of-dropped-assemblies').text())) { // Reached max limit
			// Disable next sequence button
			$('.nav-next-item').attr('disabled', 'disabled');
			// Enable prev sequence button (if disabled)
			$('.nav-prev-item').removeAttr('disabled', 'disabled');
		} else {
			// Enable both buttons (if any disabled)
			$('.nav-next-item').removeAttr('disabled', 'disabled');
			$('.nav-prev-item').removeAttr('disabled', 'disabled');
		}
	};
	// Handle slide event
	// Triggered when user moved but didn't release range handle
	$('.assembly-list-slider').on( "slide", function(event, ui) {
		// Update sequence counter label
		$('.selected-assembly-counter').text(ui.value);
		updateRangeNavigationButtons(ui.value);
		// Update sequence list item content
		// Hide all sequences
		$('.assembly-item').hide();
		// Show selected sequence
		$('.assembly-item-' + ui.value).show();
		// Update assembly file name
		$('.assembly-file-name').text($('.assembly-item-' + ui.value).attr('data-name'));
	});
	// Handle slidechange event
	// Triggered when user clicks a button or releases range handle
	$('.assembly-list-slider').on( "slidechange", function(event, ui) {
		// Update sequence counter label
		$('.selected-assembly-counter').text(ui.value);
		updateRangeNavigationButtons(ui.value);
		// Update sequence list item content
		// Hide all sequences
		$('.assembly-item').hide();
		// Show selected sequence
		$('.assembly-item-' + ui.value).show();
		// Update assembly file name
		$('.assembly-file-name').text($('.assembly-item-' + ui.value).attr('data-name'));
	});
	// Navigate to the previous sequence
	$('.nav-prev-item').on('click', function(e){
		// Check if selected sequence counter is greater than 1
		if ($('.assembly-list-slider').slider('value') > 1) {
			// Decrement slider's value
			$('.assembly-list-slider').slider('value', $('.assembly-list-slider').slider('value') - 1);
		}
		e.preventDefault();
	});
	// Navigate to the next sequence
	$('.nav-next-item').on('click', function(e){
		// Check if selected sequence counter is greater than 1
		if ($('.assembly-list-slider').slider('value') < parseInt($('.total-number-of-dropped-assemblies').text())) {
			// Decrement slider's value
			$('.assembly-list-slider').slider('value', $('.assembly-list-slider').slider('value') + 1);
		}
		e.preventDefault();
	});

	// Assembly metadata from

	// Show hint message when 'I am not sure' checkbox is checkec
	$('.assembly-list-container').on('click', '.not-sure-checkbox', function(){
		// Show 'I am not sure' message
		$(this).closest('label').find('.not-sure-hint').toggleClass('hide-this');
	});

	/*	
	var updateProgressBar = function(stepNumber) {
		var progressBar = $('.progress-bar'),
			currentProgress = progressBar.css('width'),
			// Multiply number of assemblies by number of metadata input fields
			stepWidth = $('assembly-upload-total-number').text() * 2;
		// Set new progress value
		progressBar.css('width', currentProgress + (stepWidth * stepNumber));
		console.log('Updating progress bar!');
	};
	*/

	// TODO: This should work for general case where number of increment steps is unknown
	var incrementMetadataProgressBar = function() {
		var newProgressValue = +$('.adding-metadata-progress-container .progress-bar').attr('aria-valuenow') + 30;
		// Update bar's width
		$('.adding-metadata-progress-container .progress-bar').width(newProgressValue + '%');
		// Update aria-valuenow attribute
		$('.adding-metadata-progress-container .progress-bar').attr('aria-valuenow', newProgressValue);
		// Update percentage value
		$('.adding-metadata-progress-container .progress-percentage').text(newProgressValue + '%');
	};

	// Show next form block when user selects species
	// TODO: Do now increment metadata progress bar more than once
	$('.assembly-list-container').on('change', '.assembly-sample-species-select', function(){
		// Show next form block
		$(this).closest('.form-block').next('.form-block').fadeIn();
	});
	// Increment metadata progress bar only once
	$('.assembly-list-container').one('change', '.assembly-sample-species-select', function(){
		// Increment progress bar
		incrementMetadataProgressBar();
	});

	// Show next form block when user fills in an input
	// http://stackoverflow.com/a/6458946
	// Relevant issue: https://github.com/Eonasdan/bootstrap-datetimepicker/issues/83
	$('.assembly-list-container').on('change change.dp', '.assembly-sample-datetime-input', function(){
		// TODO: validate input value
		// Show next form block
		$(this).closest('.form-block').next('.form-block').fadeIn();
		// Scroll to the next form block
		//$(this).closest('.assembly-metadata').scrollTop($(this).closest('.assembly-metadata').height());
		//$(this).closest('.assembly-metadata').animate({scrollTop: $(this).closest('.assembly-metadata').height()}, 400);
		// Focus on the next input
		$(this).closest('.form-block').next('.form-block').find('.assembly-sample-location-input').focus();
		//$('.assembly-sample-location-input').focus();
	});
	// Increment metadata progress bar only once
	$('.assembly-list-container').one('change change.dp', '.assembly-sample-datetime-input', function(){
		// Increment progress bar
		incrementMetadataProgressBar();
	});
	$('.assembly-list-container').one('hide.dp', '.assembly-sample-datetime-input', function(event){
		var that = $(this);
		setTimeout(function(){
			// Scroll to the next form block
			//$(this).closest('.assembly-metadata').scrollTop($(this).closest('.assembly-metadata').height());
			that.closest('.assembly-metadata').animate({scrollTop: that.closest('.assembly-metadata').height()}, 400);
		}, 500);
	});

	// Show next form block when user fills in an input
	$('.assembly-list-container').on('change', '.assembly-sample-location-input', function(){
		// Show next form block if current input has some value
		if ($(this).val().length) {
			// TODO: validate input value
			// Show next form block
			$(this).closest('.form-block').next('.form-block').fadeIn();
			// Scroll to the next form block
			//$(this).closest('.assembly-metadata').scrollTop($(this).closest('.assembly-metadata').height());
			$(this).closest('.assembly-metadata').animate({scrollTop: $(this).closest('.assembly-metadata').height()}, 400);
			// Enable 'Upload' button
			$('.upload-assemblies-button').removeAttr('disabled');
		}
	});
	// Increment metadata progress bar only once
	$('.assembly-list-container').one('change', '.assembly-sample-location-input', function(){
		// Increment progress bar
		incrementMetadataProgressBar();
		// Hide progress hint
		$('.adding-metadata-progress-container .progress-hint').fadeOut();
	});

	// When 'Next assembly' button is pressed
	$('.assembly-list-container').on('click', '.next-assembly-button', function(e){
		// Find assembly with empty or incomplete metadata
		console.log($(this).closest('.assembly-list-container').find('.assembly-item input:text[value=""]'));

		// Get current assembly's id and split it
		//var currentAssemblyIdPartArray = $(this).closest('.assembly-item').attr('id').split('-');
		// Get id's number
		//var currentAssemblyIdCounter = currentAssemblyIdPartArray[currentAssemblyIdPartArray.length - 1];
		// Focus

		//console.log($('#assembly-item-' + (+currentAssemblyIdCounter + 1)).find('input:first'));



/*		// Focus on the next fist input of the next assembly metadata form
		var currentAssemblyCounter = $(this).closest('.assembly-item').attr('id').split('-')[];


		// http://stackoverflow.com/questions/267615/focusing-first-control-in-the-form-using-jquery
		var currentAssemblyCounter = $(this).closest('.assembly-item').next('.assembly-item')

		$(this).closest('.assembly-item').next('.assembly-item').find('input:first').focus();

		console.log($(this).closest('.assembly-item').next('.assembly-item input'));
*/
		// Trigger to show next assembly
		$('.nav-next-item').trigger('click');

		//$('#assembly-item-' + (+currentAssemblyIdCounter + 1)).find('input:first').focus();

		// Focus on the next empty input field
		$(this).closest('.assembly-list-container').find('.assembly-item input:text[value=""]').focus();

		e.preventDefault();
	});


	// On
	$('.assembly-list-container').on('click', '.next-assembly-button', function(e){
		// Do something
	});

	var incrementProgressBar = function(stepWidth) {
		$('.uploading-progress-container .progress-bar').width((+$('.uploading-progress-container .progress-bar').width() + stepWidth) + '%');
		$('.uploading-progress-container .progress-percentage').text((+$('.uploading-progress-container .progress-bar').width() + stepWidth) + '%');
	};

	var endProgressBar = function(stepWidth) {
		$('.progress-bar').width('100%');
		$('.uploading-progress-container .progress-percentage').text('100%');
		$('.uploading-progress-container .progress').removeClass('active');
		setTimeout(function(){
			$('.uploading-progress-container .progress-percentage').text('All done!');
			$('.uploading-progress-container .progress').slideUp(function(){
				setTimeout(function(){
					$('.uploaded-assembly-url').slideDown(function(){
						$('.uploading-progress-container .progress-label').slideUp();
					});
				}, 500);
			});
		}, 500);

		// Show countdown timer

		// It takes less than 10 seconds to process one assembly
		var seconds = 10 * FASTAFiles.length;
		console.log('Seconds to wait until processed: ' + seconds);
		var timer = setInterval(
			function() {
				console.log(seconds);
				$('.visit-url-seconds-number').text(seconds);
				seconds--;
				if (seconds === 0) {
					// Hide processing assembly seconds countdown
					$('.uploaded-assembly-process-countdown-label').fadeOut(function(){
						// Update status
						$('.uploaded-assembly-process-status').text('finished processing');
					});
					clearInterval(timer);
				}
			}, 1000
		);
	};	

	$('.upload-assemblies-button').on('click', function() {
		
		console.log('Upload assemblies.');
		console.log(FASTAFiles);

		console.log(new Date());

		$('.uploading-assembly-progress-container').fadeIn('slow', function(){

			$('.adding-metadata-progress-container').slideUp('normal', function(){
				for (var i = 0; i < FASTAFiles.length; i++) {

					incrementProgressBar(25);

					// POST to Node.js end
					$.ajax({
						type: 'POST',
						url: '/assembly/add/',
						datatype: 'json', // http://stackoverflow.com/a/9155217
						data: FASTAFiles[i]
					}).done(function(message){
						console.log('POST request success: ');
						console.log(message);
						console.log(new Date());

						// Create assembly URL
						var url = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/assembly/' + 'FINGERPRINT_COMPARISON_' + JSON.parse(message).assemblyId;

						console.log(url);

						$('.uploaded-assembly-url-input').val(url);
						endProgressBar();

					}).fail(function(jqXHR, textStatus, errorThrown){
						console.error('POST request failed: ' + textStatus);
						console.error('errorThrown: ' + errorThrown);
						console.error('jqXHR: ' + jqXHR);

						endProgressBar();
					});
				}
			});

		});

/*		$('.upload-controls-container').hide();
		$('.progress-container').hide();
		$('.uploading-progress-container').fadeIn();*/

/*		// Update progress bar
		$('.progress-container .progress').addClass('active');
		$('.progress-container .progress-bar').removeClass('progress-bar-success');

		// Update button
		//$('.upload-controls-container .upload-assemblies-button').text('Uploading...').removeClass('btn-success').addClass('btn-primary').attr('disabled', 'disabled');
		// Hide all buttons
		$('.upload-controls-container').fadeOut('fast', function(){
			// Change width of Progress Container to 100%
			$('.progress-container').css('width', '100%');
		});*/

	});



/*	$('form').on('submit', function(e){
		console.log('Submit!');
		e.preventDefault();
	});*/

/*	$('.assembly-list-container').on('blur', 'input', function(){
		//console.log($(this).val());
		if ($(this).val().length) {
			// Increment progress bar
			//updateProgressBar(1);
		}
	});*/


	    			// Metadata form
	    			/*
	    			+ '<div class="assembly-metadata">'
	    				+ '<h4>Please provide mandatory assembly metadata:</h4>'
						+ '<form role="form">'

							+ '<div class="form-block assembly-metadata-' + fileCounter + '">'
								+ '<div class="form-group">'
									+ '<label for="assemblySampleDatetimeInput' + fileCounter + '">When this assembly was sampled?</label>'
									+ '<input type="datetime-local" class="form-control assembly-sample-datetime-input" id="assemblySampleDatetimeInput' + fileCounter + '" placeholder="">'
								+ '</div>'
								+ '<div class="checkbox">'
									+ '<label>'
									  + '<input type="checkbox" id="assemblySampleDatetimeNotSure' + fileCounter + '"> I am not sure! <span class="not-sure-hint hide-this">Please provide your best estimate.</span>'
									+ '</label>'
								+ '</div>'
							+ '</div>'

							+ '<div class="form-block assembly-metadata-' + fileCounter + ' hide-this">'
								+ '<div class="form-group">'
									+ '<label for="assemblySampleLocationInput' + fileCounter + '">Where this assembly was sampled?</label>'
									+ '<input type="text" class="form-control" id="assemblySampleLocationInput' + fileCounter + '" placeholder="E.g.: London, United Kingdom">'
								+ '</div>'

								+ '<div class="checkbox">'
									+ '<label>'
									  + '<input type="checkbox" id="assemblySampleLocationNotSure' + fileCounter + '"> I am not sure!'
									+ '</label>'
								+ '</div>'	
							+ '</div>'

							+ '<div class="form-block assembly-metadata-' + fileCounter + ' hide-this">'
						  		+ '<button type="submit" class="btn btn-default" class="show-next-assembly">Next assembly</button>'
						  		+ ' <button type="submit" class="btn btn-default">Apply to all assemblies</button>'
							+ '</div>'

						+ '</form>'
					+ '</div>'
					*/

});