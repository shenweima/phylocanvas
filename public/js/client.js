// ============================================================
// Polyfills
// ============================================================    

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

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function () {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

$(function(){

    'use strict'; // Available in ECMAScript 5 and ignored in older versions. Future ECMAScript versions will enforce it by default.

    // ============================================================
    // Store application state
    // ============================================================

    var WGST = window.WGST || {};

    WGST.panels = {
        assembly: {
            top: 80,
            left: 90
        },
        collection: {
            top: 80,
            left: 90
        },
        representativeTree: {
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
            top: 225,
            left: 110
        }
    };

    WGST.assemblyUploadProgress = {
        results: []
    };
    WGST.assemblyAnalysis = ['MLST_RESULT', 'PAARSNP_RESULT', 'FP_COMP'];

    // ============================================================
    // Manage panels
    // ============================================================    

    var openPanel = function(panelNames, callback) {
        // Overwrite function
        var openPanel = function(panelName) {
            var panel = $('[data-panel-name="' + panelName + '"');

            // Set position
            panel.css('top', WGST.panels[panelName].top);
            panel.css('left', WGST.panels[panelName].left);

            // Show
            panel.fadeIn('fast', function(){
                panel.addClass('wgst-panel--active');
            });
        };

        // Process multiple panels
        if ($.isArray(panelNames)) {

            var panelNameCounter = panelNames.length,
                panelName;

            for (;panelNameCounter !== 0;) {
                panelNameCounter = panelNameCounter - 1;

                panelName = panelNames[panelNameCounter];

                openPanel(panelName);

            } // for

        // Process single panel
        } else {

            openPanel(panelNames);
        }

        if (typeof callback === 'function') {
            callback();
        }
    };

    var closePanel = function(panelNames, callback) {
        // Overwrite function
        var closePanel = function(panelName) {
            var panel = $('[data-panel-name="' + panelName + '"');

            // Hide
            panel.fadeOut('fast', function(){
                panel.removeClass('wgst-panel--active');
            });
        };

        // Process multiple panels
        if ($.isArray(panelNames)) {

            var panelNameCounter = panelNames.length,
                panelName;

            for (;panelNameCounter !== 0;) {
                panelNameCounter = panelNameCounter - 1;

                panelName = panelNames[panelNameCounter];

                closePanel(panelName);

            } // for

        // Process single panel
        } else {

            closePanel(panelNames);
        }

        if (typeof callback === 'function') {
            callback();
        }
    };

/*    var openPanel = function(panelName, callback) {
        var panel = $('[data-panel-name="' + panelName + '"');

        // Set position
        panel.css('top', WGST.panels[panelName].top);
        panel.css('left', WGST.panels[panelName].left);

        // Show
        panel.fadeIn('fast', function(){
            panel.addClass('wgst-panel--active');

            if (typeof callback === 'function') {
                callback();
            }
        });
    };*/

/*    var closePanel = function(panelNames, callback) {

        var closePanel = function(panelName) {
            var panel = $('[data-panel-name="' + panelName + '"');

            panel.fadeOut('fast', function(){
                panel.removeClass('wgst-panel--active');
            });
        };

        // Array
        if ($.isArray(panelNames)) {

            var panelNameCounter = panelNames.length;

            for (;panelNameCounter !== 0;) {
                panelNameCounter = panelNameCounter - 1;

                var panelName = panelNames[panelNameCounter];

                closePanel(panelName);

            } // for

        // Assume String
        } else {

            closePanel(panelNames);
        }

        if (typeof callback === 'function') {
            callback();
        }
    };*/

    var bringPanelToTop = function(panelName) {
        var zIndexHighest = 0;

        $('.wgst-panel').each(function(){
            var zIndexCurrent = parseInt($(this).css('zIndex'), 10);
            if (zIndexCurrent > zIndexHighest) {
                zIndexHighest = zIndexCurrent;
            }
        });

        $('[data-panel-name="' + panelName + '"').css('zIndex', zIndexHighest + 1);
    };

    var isOpenedPanel = function(panelName) {
        var panel = $('[data-panel-name="' + panelName + '"');

        if (panel.hasClass('wgst-panel--active')) {
            return true;
        } else {
            return false;
        }
    };

    // ============================================================
    // Init app
    // ============================================================    

    var socket = io.connect('http://127.0.0.1');

    // Init
    (function(){

        // Init jQuery UI draggable interaction
        $('.wgst-draggable').draggable({
            handle: ".wgst-draggable-handle",
            stop: function(event, ui) {
                // Store current panel position
                var panelName = ui.helper.attr('data-panel-name');
                WGST.panels[panelName].top = ui.position.top;
                WGST.panels[panelName].left = ui.position.left;
            }
        });

        // Init jQuery UI slider widget
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

        // Init jQuery UI accordion widget
/*        $('.assembly-details').accordion({
            header: '> div > h4'
        });*/

        // Popover
        $('.add-data button').popover({
            html: true,
            placement: 'bottom',
            title: 'Add your data',
            content: '<div class="upload-data"><span>You can drag and drop your CSV files anywhere on the map.</span><input type="file" id="exampleInputFile"></div>'
        });

        // Toggle timeline
        $('.timeline-toggle-button').on('click', function(){
            if ($(this).hasClass('active')) {
                $('#timeline').hide();
            } else {
                $('#timeline').css('bottom', '0');
                $('#timeline').show();
            }
        });

        // Toggle graph
        $('.graph-toggle-button').on('click', function(){
            if ($(this).hasClass('active')) {
                $('.tree-panel').hide();
            } else {
                $('.tree-panel').show();
            }
        });

        // Toggle all panels
        $('.all-panels-toggle-button').on('click', function(){
            if ($(this).hasClass('active')) {
                $('.wgst-panel--active').hide();
            } else {
                $('.wgst-panel--active').show();
            }
        });

        // Toggle map
        $('.map-toggle-button').on('click', function(){
            if ($(this).hasClass('active')) {
                $('#map').hide();
            } else {
                $('#map').show();
            }
        });

        // Show graph
        $('.graph-toggle-button').trigger('click');

        // Open socket.io connection
        socket.on('pong', function(data) {
            console.log('[WGST][Socket.IO] Received pong:');
            console.log(data);
        });
        
        // Ping server
        socket.emit('ping', { my: 'data' });

    })();

    var loadRequestedAssembly = function(requestedAssembly) {
        console.log('[WGST] Loading requested assembly');

        // Sort data by score
        // http://stackoverflow.com/a/15322129
        var sortableScores = [],
            score;

        // First create the array of keys/values so that we can sort it
        for (score in requestedAssembly.scores) {
            if (requestedAssembly.scores.hasOwnProperty(score)) {
                sortableScores.push({ 
                    'referenceId': requestedAssembly.scores[score].referenceId,
                    'score': requestedAssembly.scores[score].score
                });
            }
        }

        // Sort scores
        sortableScores = sortableScores.sort(function(a,b){
            return b.score - a.score; // Descending sort (Z-A)
        });

        // Create assembly data table
        var sortableScoreCounter = 0;
        for (; sortableScoreCounter < sortableScores.length; sortableScoreCounter++ ) {
            $('.assembly-data-table tbody').append(
                // This is not verbose enough
                ((sortableScoreCounter % 2 === 0) ? '<tr class="row-stripe">' : '<tr>')
                    + '<td>'
                        + sortableScores[sortableScoreCounter].referenceId
                    + '</td>'
                    + '<td>'
                        + sortableScores[sortableScoreCounter].score
                    + '</td>'
                    + '<td>'
                        // Convert score values into percentages where the highest number is 100%
                        + Math.floor(sortableScores[sortableScoreCounter].score * 100 / requestedAssembly.fingerprintSize) + '%'
                    + '</td>'
                + '<tr/>'
            );
        }

        // Set assembly panel header text
        $('.assembly-panel .wgst-panel-header .assembly-id').text(requestedAssembly.assemblyId);

        // Set assembly upload datetime in footer
        //$('.assembly-upload-datetime').text(moment(requestedAssembly.timestamp, "YYYYMMDD_HHmmss").fromNow());

        // Show assembly data
        $('.assembly-panel').show();
    };

    // If user provided assembly id in url then load requested assembly
    if (typeof window.WGST.requestedAssembly !== 'undefined') {
        loadRequestedAssembly(window.WGST.requestedAssembly);
    }

    // WGST namespace
    //var WGST = window.WGST || {};

    // Map
    WGST.geo = {
        map: {},
        mapOptions: {
            zoom: 5,
            center: new google.maps.LatLng(48.6908333333, 9.14055555556), // new google.maps.LatLng(51.511214, -0.119824),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            minZoom: 2,
            maxZoom: 6
        },
        markers: {
            assembly: {},
            metadata: {},
            representativeTree: []
        },
        markerBounds: new google.maps.LatLngBounds(),
        //geocoder: new google.maps.Geocoder(),
        //metadataAutocomplete: {}, // Store Google Autocomplete object for each dropped file
        metadataSearchBox: {}, // Store Google Autocomplete object for each dropped file
        init: function() {
            this.map = new google.maps.Map(document.getElementById('map'), this.mapOptions);
            this.markers.metadata = new google.maps.Marker({
                position: new google.maps.LatLng(51.511214, -0.119824),
                map: WGST.geo.map,
                visible: false
            });
        }
    };

    var loadRepresentativeTree = function() {

        // ==============================
        // Load representative tree
        // ==============================

        // Init tree
        window.WGST.representativeTree.tree.load('/data/reference_tree.nwk');
        window.WGST.representativeTree.tree.treeType = 'rectangular';
        //window.WGST.representativeTree.tree.showLabels = false;
        window.WGST.representativeTree.tree.baseNodeSize = 0.5;
        window.WGST.representativeTree.tree.selectedNodeSizeIncrease = 0.5;
        window.WGST.representativeTree.tree.selectedColor = '#0059DE';
        window.WGST.representativeTree.tree.rightClickZoom = true;
        window.WGST.representativeTree.tree.onselected = showRepresentativeTreeNodesOnMap;

        // ==============================
        // Load reference tree metadata
        // ==============================

        console.log('[WGST] Getting representative tree metadata');

        $.ajax({
            type: 'POST',
            url: '/representative-tree-metadata/',
            datatype: 'json', // http://stackoverflow.com/a/9155217
            data: {}
        })
        .done(function(data, textStatus, jqXHR) {
            console.log('[WGST] Got representative tree metadata');
            console.log(data.value);

            // Create representative tree markers
            var metadataCounter = data.value.metadata.length,
                metadata = data.value.metadata,
                accession,
                marker;

            for (; metadataCounter !== 0;) {
                // Decrement counter
                metadataCounter = metadataCounter - 1;

                console.log('[WGST] Representative tree metadata for ' + metadata[metadataCounter] + ':');
                console.log(metadata[metadataCounter]);

                accession = metadata[metadataCounter].accession;

                // Set representative tree metadata
                window.WGST.representativeTree[accession] = metadata[metadataCounter];
            } // for
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('[WGST][ERROR] Failed to get representative tree metadata');
            console.error(textStatus);
            console.error(errorThrown);
            console.error(jqXHR);
        });
    };

    // Init map
    WGST.geo.init();

    // Handle Google Maps ready
    google.maps.event.addListenerOnce(WGST.geo.map, 'idle', function() {

        // Open representative tree panel
        openPanel('representativeTree', function(){

            // Init representative tree container
            WGST.representativeTree = {
                tree: new PhyloCanvas.Tree(document.getElementById('phylocanvas')),
                metadata: {}
            };

            // Load representative tree
            loadRepresentativeTree();
        });
    });

    $('.tree-controls-select-none').on('click', function(){
        // This is a workaround
        // TO DO: Refactor using official API
        window.WGST.representativeTree.tree.selectNodes('');

        showRepresentativeTreeNodesOnMap('');
    });

    $('.tree-controls-select-all').on('click', function(){
        
        // Create a list of all nodes in the tree
        var allNodes = WGST.representativeTree.tree.leaves,
            nodeCounter = allNodes.length,
            nodeIds = '';

        for (; nodeCounter !== 0;) {
            nodeCounter = nodeCounter - 1;

            if (nodeIds.length > 0) {
                nodeIds = nodeIds + ',' + allNodes[nodeCounter].id;
            } else {
                nodeIds = allNodes[nodeCounter].id;
            }
        }

        // This is a workaround
        // TO DO: Refactor using official API
        window.WGST.representativeTree.tree.root.setSelected(true, true);
        window.WGST.representativeTree.tree.draw();

        showRepresentativeTreeNodesOnMap(nodeIds);
    });

    var showRepresentativeTreeNodesOnMap = function(nodeIds) {

        var existingMarkers = window.WGST.geo.markers.representativeTree,
            existingMarker;

        // Remove existing markers
        for (existingMarker in existingMarkers) {
            if (existingMarkers.hasOwnProperty(existingMarker)) {
                existingMarkers[existingMarker].setMap(null);
            }
        }

        // Reset marker bounds
        window.WGST.geo.markerBounds = new google.maps.LatLngBounds();

        if (typeof nodeIds === 'string' && nodeIds.length > 0) {
            console.log('[WGST] Selected representative tree nodes: ' + nodeIds);

            // Create representative tree markers
            var selectedNodeIds = nodeIds.split(','),
                nodeCounter = selectedNodeIds.length,
                accession,
                metadata;

            // For each node create representative tree marker
            for (; nodeCounter !== 0;) {
                // Decrement counter
                nodeCounter = nodeCounter - 1;

                accession = selectedNodeIds[nodeCounter];

                metadata = window.WGST.representativeTree[accession];

                // Check if both latitude and longitude provided
                if (metadata.latitude && metadata.longitude) {

                    console.log('[WGST] Marker\'s latitude: ' + metadata.latitude);
                    console.log('[WGST] Marker\'s longitude: ' + metadata.longitude);

                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(metadata.latitude, metadata.longitude),
                        map: window.WGST.geo.map,
                        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                        // This must be optimized, otherwise white rectangles will be displayed when map is manipulated
                        // However, there is a known case when this should be false: http://www.gutensite.com/Google-Maps-Custom-Markers-Cut-Off-By-Canvas-Tiles
                        optimized: true
                    });
                    // Set marker
                    window.WGST.geo.markers.representativeTree[accession] = marker;
                    // Extend markerBounds with each metadata marker
                    window.WGST.geo.markerBounds.extend(marker.getPosition());
                }
            } // for

            // Pan to marker bounds
            window.WGST.geo.map.panToBounds(window.WGST.geo.markerBounds);
            // Set the map to fit marker bounds
            window.WGST.geo.map.fitBounds(window.WGST.geo.markerBounds);
        } else { // No nodes were selected
            console.log('[WGST] No selected nodes');
            // Show Europe
            window.WGST.geo.map.panTo(new google.maps.LatLng(48.6908333333, 9.14055555556));
            window.WGST.geo.map.setZoom(5);
        }
    };

        // Array of objects that store content of FASTA file and user-provided metadata
    var fastaFilesAndMetadata = {},
        // Stores file name of displayed FASTA file
        selectedFastaFileName = '',
        // Element on which user can drag and drop files
        dropZone = document.getElementsByTagName('body')[0],
        // Store individual assembly objects used for displaying data
        assemblies = [],
        // DNA sequence regex
        dnaSequenceRegex = /^[CTAGNUX]+$/i,
        // Count total number of contigs in all selected assemblies
        totalContigsSum = 0;

    var parseFastaFile = function(e, fileCounter, file, droppedFiles) {

            // Array of contigs
        var contigs = [],
            // Array of sequence parts
            contigParts = [],
            // Count total number of contigs in a single assembly
            contigsSum = 0,
            // Count contigs
            contigCounter = 0,
            // Array of DNA sequence strings
            dnaSequenceStrings = [],
            // Single DNA sequence string
            dnaSequenceString = '',
            // Single DNA sequence id
            dnaSequenceId = '',
            // Empty jQuery object
            assemblyListItem = $(),
            // N50 chart data
            chartData = [];

        // Trim, and split assembly string into array of individual contigs
        // then filter that array by removing empty strings
        contigs = e.target.result.trim().split('>').filter(function(element){
            return (element.length > 0);
        });

        assemblies[fileCounter] = {
            'name': file.name,
            'id': '',
            'contigs': {
                'total': contigs.length,
                'invalid': 0,
                'individual': []
            }
        };

        // Clear this array of DNA sequence strings
        dnaSequenceStrings = [];
        // Clear this DNA sequence string
        dnaSequenceString = '';
        // Clear this DNA sequence id string
        dnaSequenceId = '';

        // Parse each contig
        for (; contigCounter < contigs.length; contigCounter++) {

            // Split contig string into parts
            contigParts = contigs[contigCounter].split(/\n/)
                // Filter out empty parts
                .filter(function(part){
                    return (part.length > 0);
                });

            // Trim each contig part
            var contigPartCounter = 0;
            for (; contigPartCounter < contigParts; i++) {
                contigParts[contigPartCounter] = contigParts[contigPartCounter].trim();
            }

            /*

            Validate contig parts

            */

            // If there is only one contig part then this contig is invalid
            if (contigParts.length > 1) {

                /*

                DNA sequence can contain:
                1) [CTAGNUX] characters.
                2) White spaces (e.g.: new line characters).

                The first line of FASTA file contains id and description.
                The second line theoretically contains comments (starts with #).

                To parse FASTA file you need to:
                1. Separate assembly into individual contigs by splitting file's content by > character.
                   Note: id and description can contain > character.
                2. For each sequence: split it by a new line character, 
                   then convert resulting array to string ignoring the first (and rarely the second) element of that array.

                */

                // Parse sequence DNA string

                // Create sub array of the contig parts array - cut the first element (id and description).
                //var sequenceDNAStringArray = contigParts.splice(1, contigParts.length);
                var contigPartsNoIdDescription = contigParts.splice(1, contigParts.length);

                // Very rarely the second line can be a comment
                // If the first element won't match regex then assume it is a comment
                if (! dnaSequenceRegex.test(contigPartsNoIdDescription[0].trim())) {
                    // Remove comment element from the array
                    contigPartsNoIdDescription = contigPartsNoIdDescription.splice(1, contigPartsNoIdDescription.length);
                }

                /*

                Contig string without id, description, comment is only left with DNA sequence string(s)

                */
                // Convert array of DNA sequence substrings into a single string
                // Remove whitespace
                dnaSequenceString = contigPartsNoIdDescription.join('').replace(/\s/g, '');

                // Parse sequence id
                dnaSequenceId = contigParts[0].trim().replace('>','');

                // Validate DNA sequence string
                if (dnaSequenceRegex.test(dnaSequenceString)) {
                    // Store it in array
                    dnaSequenceStrings.push(dnaSequenceString);
                    // Init sequence object
                    assemblies[fileCounter]['contigs']['individual'][contigCounter] = {};
                    // Store sequence id
                    assemblies[fileCounter]['contigs']['individual'][contigCounter]['id'] = dnaSequenceId;
                    // Store sequence string
                    assemblies[fileCounter]['contigs']['individual'][contigCounter]['sequence'] = dnaSequenceString;
                // Invalid DNA sequence string
                } else {
                    // Count as invalid sequence
                    assemblies[fileCounter]['contigs']['invalid'] = assemblies[fileCounter]['contigs']['invalid'] + 1;
                }
            } else {
                // Count as invalid sequence
                assemblies[fileCounter]['contigs']['invalid'] = assemblies[fileCounter]['contigs']['invalid'] + 1;
            }

        } // for

        // Store fasta file and metadata
        fastaFilesAndMetadata[file.name] = {
            // Cut FASTA file extension from the file name
            name: file.name.substr(0, file.name.lastIndexOf('.')),
            assembly: e.target.result,
            metadata: {}
        };
        /*
        fastaFilesAndMetadata.push({
            // Cut FASTA file extension from the file name
            name: file.name.substr(0, file.name.lastIndexOf('.')),
            assembly: e.target.result,
            metadata: {}
        });
        */

        /*

        Calculate N50
        http://www.nature.com/nrg/journal/v13/n5/box/nrg3174_BX1.html

        */

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

        /*

        Sum lengths of every contig starting from the longest contig
        until this running sum equals one-half of the total length of all contigs in the assembly.

        */

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

        // Calculate average nucleotides per sequence
        var averageNucleotidesPerSequence = Math.floor(assemblyNucleotideSums[assemblyNucleotideSums.length - 1] / dnaSequenceStrings.length);

        // Calculate N50 quality
        // If sequence length is greater than average sequence length then quality is good
        /*
        if (assemblyN50['sequenceLength'] > averageNucleotidesPerSequence) {
            assemblyN50['quality'] = true;
        } else { // Quality is bad
            assemblyN50['quality'] = false;
        }
        */

        // Update total number of contigs to upload
        //contigsSum = contigsSum + contigs.length; // TO DO: Depricate contigsSum
        totalContigsSum = totalContigsSum + contigs.length;

        // Show average number of contigs per assembly
        $('.assembly-sequences-average').text(Math.floor(totalContigsSum / droppedFiles.length));

        // TO DO: Convert multiple strings concatenation to array and use join('')
        // Display current assembly
        assemblyListItem = $(
            //'<li class="assembly-item assembly-item-' + fileCounter + ' hide-this" data-name="' + assemblies[fileCounter]['name'] + '" id="assembly-item-' + fileCounter + '">'
            '<li class="assembly-item hide-this" data-name="' + assemblies[fileCounter]['name'] + '" id="assembly-item-' + fileCounter + '">'

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
                        + '<div class="assembly-stats-label">total nt</div>'
                        + '<div class="assembly-stats-number">' + assemblyNucleotideSums[assemblyNucleotideSums.length - 1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</div>'
                        //+ '<div class="assembly-stats-label">sequences</div>'
                    + '</div>'

                    + '<div class="assembly-stats-container">'
                        // Print a number with commas as thousands separators
                        // http://stackoverflow.com/a/2901298
                        + '<div class="assembly-stats-label">total contigs</div>'
                        + '<div class="assembly-stats-number assembly-stats-number-contigs">' + assemblies[fileCounter]['contigs']['total'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</div>'
                        //+ '<div class="assembly-stats-label">sequences</div>'
                    + '</div>'

                    + '<div class="assembly-stats-container">'
                        // Print a number with commas as thousands separators
                        // http://stackoverflow.com/a/2901298
                        + '<div class="assembly-stats-label">min contig</div>'
                        + '<div class="assembly-stats-number">' + sortedDnaSequenceStrings[sortedDnaSequenceStrings.length - 1].length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<small>nt</small></div>'
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
                        + '<div class="assembly-stats-number">' + sortedDnaSequenceStrings[0].length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<small>nt</small></div>'
                        //+ '<div class="assembly-stats-label">sequences</div>'
                    + '</div>'

                    + '<div class="assembly-stats-container">'
                        // Print a number with commas as thousands separators
                        // http://stackoverflow.com/a/2901298
                        + '<div class="assembly-stats-label">contig N50</div>'
                        + '<div class="assembly-stats-number assembly-stats-n50-number">' + assemblyN50['sequenceLength'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<small>nt</small></div>'
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

/*                          + '<div class="assembly-identifier-container">'
                    + '<span class="assembly-identifier-label">Identifier:</span>'
                    + '<span class="assembly-identifier">' + assemblyCollection[assemblyCounter].identifier + '</span>'
                + '</div>'
                + '<div class="assembly-string-container">'
                    + '<span class="assembly-string-label">assembly preview:</span>'
                    + '<span class="assembly-string">' + assemblyCollection[assemblyCounter].assembly.slice(0, 100) + '...</span>'
                + '</div>'*/

            + '</li>'
        );

        var assemblyMetadataFormContainer = $('<div class="assembly-metadata"></div>'),
            assemblyMetadataFormHeader = $('<h4>Please provide mandatory assembly metadata:</h4>'),
            //assemblyMetadataForm = $('<form role="form"></form>'),
            assemblyMetadataForm = $('<div></div>'),
            /*
            assemblySampleSpeciesFormBlock = $(
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
            ),
            */
            assemblySampleDatetimeFormBlock = $(
            '<div class="form-block assembly-metadata-' + fileCounter + ' assembly-metadata-block">'
                + '<div class="form-group">'
                    + '<label for="assemblySampleDatetimeInput' + fileCounter + '">When this assembly was sampled?</label>'
                    + '<div class="input-group">'
                        + '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>'
                        + '<input type="text" class="form-control assembly-sample-datetime-input" id="assemblySampleDatetimeInput' + fileCounter + '" placeholder="">'
                    + '</div>'
                + '</div>'
                + '<div class="checkbox">'
                    + '<label>'
                      + '<input type="checkbox" id="assemblySampleDatetimeNotSure' + fileCounter + '" class="not-sure-checkbox"> I am not sure! <span class="not-sure-hint hide-this">Please provide your best estimate.</span>'
                    + '</label>'
                + '</div>'
            + '</div>'
            ),
            assemblySampleLocationFormBlock = $(
            '<div class="form-block assembly-metadata-' + fileCounter + ' assembly-metadata-block hide-this">'
                + '<div class="form-group">'
                    + '<label for="assemblySampleLocationInput' + fileCounter + '">Where this assembly was sampled?</label>'
                    + '<div class="input-group">'
                        + '<span class="input-group-addon"><span class="glyphicon glyphicon-globe"></span></span>'
                        + '<input type="text" class="form-control assembly-sample-location-input" id="assemblySampleLocationInput' + fileCounter + '" placeholder="E.g.: London, United Kingdom">'
                    + '</div>'
                + '</div>'

                + '<div class="checkbox">'
                    + '<label>'
                      + '<input type="checkbox" id="assemblySampleLocationNotSure' + fileCounter + '" class="not-sure-checkbox"> I am not sure! <span class="not-sure-hint hide-this">Please provide your best estimate.</span>'
                    + '</label>'
                + '</div>'  
            + '</div>'
            ),
            assemblyControlsFormBlock = $(
            '<div class="form-block assembly-metadata-' + fileCounter + ' hide-this">'
                + '<button class="btn btn-default next-assembly-button" class="show-next-assembly">Next empty metadata</button>'
                + ' <button class="btn btn-default apply-to-all-assemblies-button">Copy to all assemblies</button>'
            + '</div>'
            ),
            assemblyMeatadataDoneBlock = $(
            '<div class="form-block assembly-metadata-' + fileCounter + ' hide-this">'
                + 'Ready? Click "Upload" button to upload your assemblies and metadata.'
            + '</div>'
            );

/*                <div class="upload-controls-container">
                  <button type="button" class="btn btn-success assemblies-upload-ready-button" disabled="disabled">Upload sequences and metadata</button>
                  <button type="button" class="btn btn-success assemblies-upload-ready-button" disabled="disabled">Upload metadata only</button>
                </div>*/

        //assemblyMetadataForm.append(assemblySampleSpeciesFormBlock);
        assemblyMetadataForm.append(assemblySampleDatetimeFormBlock);
        assemblyMetadataForm.append(assemblySampleLocationFormBlock);

        // Show form navigation buttons only when you're at the last assembly
        // TO DO: Append to .assembly-metadata instead of the classless div
        if (fileCounter < droppedFiles.length) {
            assemblyMetadataForm.append(assemblyControlsFormBlock);
        } else {
            //assemblyMetadataForm.append(assemblyMeatadataDoneBlock);
        }
        assemblyMetadataFormContainer.append(assemblyMetadataFormHeader);
        assemblyMetadataFormContainer.append(assemblyMetadataForm);

        // REFACTOR!
        var assemblyMetadataListItem = $(
            //'<li class="assembly-item assembly-item-' + fileCounter + ' hide-this" data-name="' + assemblies[fileCounter]['name'] + '" id="assembly-item-' + fileCounter + '">'
            '<li class="assembly-item hide-this" data-name="' + assemblies[fileCounter]['name'] + '" id="assembly-metadata-item-' + fileCounter + '">'
            + '</li>'
        );

        assemblyMetadataListItem.append(assemblyMetadataFormContainer);
        $('.assembly-metadata-list-container ul').append(assemblyMetadataListItem);


        //assemblyListItem.append(assemblyMetadataFormContainer);

        // Append assembly
        $('.assembly-list-container ul').append(assemblyListItem);

        // Draw N50 chart
        drawN50Chart(assemblyNucleotideSums, assemblyN50, fileCounter);

        // Chart 1
        /*          
        var data = [
            {   sequenceLength: 100,
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

        // Show first assembly
        //$('.assembly-item-1').removeClass('hide-this');
        //$('.assembly-item').eq('0').show();
        $('#assembly-item-1').show();
        $('#assembly-metadata-item-1').show();

        // Set file name in metadata panel title
        $('.wgst-panel__assembly-upload-metadata .header-title small').text($('#assembly-metadata-item-1').attr('data-name'));

        // Set file name in analytics panel title
        $('.wgst-panel__assembly-upload-analytics .header-title small').text($('#assembly-item-1').attr('data-name'));

        // Store displayed fasta file name
        //selectedFastaFileName = $('.assembly-item-1').attr('data-name');
        selectedFastaFileName = $('.assembly-item').eq('0').attr('data-name');

        // Init bootstrap datetimepicker
        //$('.assembly-upload-panel .assembly-sample-datetime-input').datetimepicker();
        $('#assemblySampleDatetimeInput' + fileCounter).datetimepicker();

        // Create closure to save value of fileName
        (function(fileName){

            // Get autocomplete input (jQuery) element
            var autocompleteInput = $('.assembly-metadata-list-container li[data-name="' + fileName + '"] .assembly-sample-location-input');

            // Init Goolge Maps API Places Autocomplete
            // TO DO: This creates new Autocomplete object for each drag and drop file - possibly needs refactoring/performance optimization
            //WGST.geo.metadataAutocomplete[fileName] = new google.maps.places.Autocomplete(document.getElementById('assemblySampleLocationInput' + fileCounter));
            // [0] returns native DOM element: http://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/
            //WGST.geo.metadataAutocomplete[fileName] = new google.maps.places.Autocomplete(autocompleteInput[0]);
            WGST.geo.metadataSearchBox[fileName] = new google.maps.places.SearchBox(autocompleteInput[0]);

            // When the user selects an address from the dropdown,
            // get geo coordinates
            // https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform
            // TO DO: Remove this event listener after metadata was sent
            google.maps.event.addListener(WGST.geo.metadataSearchBox[fileName], 'places_changed', function() {

                // Get the place details from the autocomplete object.
                var places = window.WGST.geo.metadataSearchBox[fileName].getPlaces();

                console.log('[WGST] Google Places API first SearchBox place:');
                console.log(places[0].formatted_address);

                // Set first place to as input's value
                $('li.assembly-item[data-name="' + fileName + '"] .assembly-sample-location-input').val(places[0].formatted_address);

                // Set map center to selected address
                WGST.geo.map.setCenter(places[0].geometry.location);
                // Set map
                WGST.geo.markers.metadata.setMap(WGST.geo.map);
                // Set metadata marker's position to selected address
                WGST.geo.markers.metadata.setPosition(places[0].geometry.location);
                // Show metadata marker
                WGST.geo.markers.metadata.setVisible(true);

                // Geocode address
                /*
                WGST.geo.geocoder.geocode({ 'address': place.address_components[0] }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        map.setCenter(results[0].geometry.location);
                        var marker = new google.maps.Marker({
                            map: WGST.geo.map,
                            position: results[0].geometry.location
                        });
                    } else {
                        console.log('Geocode was not successful for the following reason: ' + status);
                    }
                });
                */

                // Remember latitude
                autocompleteInput.attr('data-latitude', places[0].geometry.location.lat());
                // Remember longitude
                autocompleteInput.attr('data-longitude', places[0].geometry.location.lng());
            });
        }(file.name));
    
    }; // parseFastaFile()

    var drawN50Chart = function(chartData, assemblyN50, fileCounter) {

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

    var handleDragOver = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy
    };

    // FASTA file name regex
    var fastaFileNameRegex = /^.+(.fa|.fas|.fna|.ffn|.faa|.frn|.contig)$/i;

    var handleFileDrop = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        closePanel('representativeTree', function(){
            // Open assembly upload navigator panel, analytics panel and metadata panel
            openPanel(['assemblyUploadNavigator', 'assemblyUploadAnalytics', 'assemblyUploadMetadata']);

            // Open assembly upload navigator panel
            //openPanel('assemblyUploadNavigator');

            // Open assembly upload analytics panel
            //openPanel('assemblyUploadAnalytics');

            // Open assembly upload metadata panel
            //openPanel('assemblyUploadMetadata');
        });

/*        // Make Assembly Upload Navigator panel active
        if (! $('.wgst-panel__assembly-upload-navigator').hasClass('wgst-panel--active')) {
            $('.wgst-panel__assembly-upload-navigator').addClass('wgst-panel--active');
        }  

        // Make Assembly Upload Analytics panel active
        if (! $('.wgst-panel__assembly-upload-analytics').hasClass('wgst-panel--active')) {
            $('.wgst-panel__assembly-upload-analytics').addClass('wgst-panel--active');
        }

        // Make Assembly Upload Metadata panel active
        if (! $('.wgst-panel__assembly-upload-metadata').hasClass('wgst-panel--active')) {
            $('.wgst-panel__assembly-upload-metadata').addClass('wgst-panel--active');
        }*/

        // Show upload panel
        // REFACTOR!
        //$('.assembly-upload-panel').fadeIn('fast');

        // Set the highest z index for this panel
        $('.assembly-upload-panel').trigger('mousedown');

            // FileList object
            // https://developer.mozilla.org/en-US/docs/Web/API/FileList
        var droppedFiles = evt.dataTransfer.files,
            // A single file from FileList object
            file = droppedFiles[0],
            // Count files
            fileCounter = 0,
            // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
            fileReader = new FileReader();
            
        // Check if user dropped only 1 assembly
        if (droppedFiles.length === 1) {
            // Hide average number of contigs per assembly
            $('.upload-multiple-assemblies-label').hide();
            // Set file name of dropped file
            $('.upload-single-assembly-file-name').text(file.name);
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
        $('.total-number-of-dropped-assemblies').text(droppedFiles.length);

        // Update assembly list slider
        $('.assembly-list-slider').slider("option", "max", droppedFiles.length);

        // Set file name
        $('.assembly-file-name').text(file.name);

        // If there is more than 1 file dropped then show assembly navigator
        if (droppedFiles.length > 1) {
            // Show assembly navigator
            $('.assembly-navigator').show();
            // Focus on slider handle
            $('.ui-slider-handle').focus();
        }

        // Process each file/assembly (1 file === 1 assembly)
        for (fileCounter = 0; fileCounter < droppedFiles.length; fileCounter++) {
            // https://developer.mozilla.org/en-US/docs/Web/API/FileList#item()
            file = droppedFiles.item(fileCounter);  
            // Validate file name   
            if (file.name.match(fastaFileNameRegex)) {
                // Create new file reader
                fileReader = new FileReader();
                // Create new scope to save fileCounter variable with it's current value
                // http://stackoverflow.com/a/2568989
                (function(savedFileCounter, currentFile) {
                    // Start counting files from 1, not 0
                    savedFileCounter = savedFileCounter + 1;
                    // A handler for the load event. This event is triggered each time the reading operation is successfully completed
                    fileReader.onload = function(event){
                        // Once file is loaded, parse it
                        parseFastaFile(event, savedFileCounter, currentFile, droppedFiles);
                    };
                    /* Alternative code:
                    fileReader.addEventListener('load', function(event){
                        parseFastaFile(event, savedFileCounter, currentFile, files);
                    });
                    */
                })(fileCounter, file);
                // Read file as a text
                fileReader.readAsText(file);
            // Invalid file name
            } else {
                console.log("[WGST] File not supported");
            }
        } // for

        // Update total number of assemblies to upload
        $('.assembly-upload-total-number').text(droppedFiles.length);
        // Update lable for total number of assemblies to upload
        $('.assembly-upload-total-number-label').html((droppedFiles.length === 1 ? 'assembly': 'assemblies'));

    };

    // Listen to dragover and drop events
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileDrop, false);

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
    
    var updateSelectedFilesUI = function(elementCounter) {
        // Update sequence counter label
        $('.selected-assembly-counter').text(elementCounter);
        // Update sequence list item content
        // Hide all sequences
        $('.assembly-item').hide();
        // Show selected sequence
        //$('.assembly-item-' + ui.value).show();
        //$('.assembly-item').eq(elementCounter - 1).show(); // Convert one-based index to zero-based index used by .eq()

        // Analytics
        var selectedFastaFileElement = $('#assembly-item-' + elementCounter);
        selectedFastaFileElement.show();

        // Metadata
        var selectedFastaFileElementMetadata = $('#assembly-metadata-item-' + elementCounter);
        selectedFastaFileElementMetadata.show();

        // Update assembly file name
        var fileName = $('.assembly-item').eq(elementCounter - 1).attr('data-name');

        // Update file name in Assembly Upload Navigator
        $('.wgst-panel__assembly-upload-navigator .assembly-file-name').text(fileName);

        // Update file name in Assembly Upload Metadata panel
        $('.wgst-panel__assembly-upload-metadata .header-title small').text(fileName);

        // Update file name in Assembly Upload Analytics panel
        $('.wgst-panel__assembly-upload-analytics .header-title small').text(fileName);

        // Update sequence counter label
        updateRangeNavigationButtons(elementCounter);
        // Store displayed fasta file name
        //selectedFastaFileName = $('.assembly-item').eq(elementCounter - 1).attr('data-name'); 
        selectedFastaFileName = selectedFastaFileElement.attr('data-name'); 
    };

    var resetAssemlyUploadPanel = function() {

        // Empty list of selected FASTA files and metadata
        fastaFilesAndMetadata = {};

        // Reset stats

        // Clear list of assembly items
        $('.assembly-list-container ul').html('');
        // Clear metadata list of assembly items
        $('.assembly-metadata-list-container ul').html('');
        // Set average number of contigs per assembly
        $('.assembly-sequences-average').text(0);
        // Set total number of selected assemblies/files
        $('.assembly-upload-total-number').text(0);

        // Reset adding metadata progress bar

        // Update bar's width
        $('.adding-metadata-progress-container .progress-bar').width('0%');
        // Update aria-valuenow attribute
        $('.adding-metadata-progress-container .progress-bar').attr('aria-valuenow', 0);
        // Update percentage value
        $('.adding-metadata-progress-container .progress-percentage').text('0%');

        // Reset uploading assemblies and metadata progress bar

        // Update bar's width
        $('.uploading-assembly-progress-container .progress-bar').width('0%');
        // Update aria-valuenow attribute
        $('.uploading-assembly-progress-container .progress-bar').attr('aria-valuenow', 0);
        // Update percentage value
        $('.uploading-assembly-progress-container .progress-percentage').text('0%');
 
        //$('.uploading-assembly-progress-container .progress').removeClass('active');
    };

    var updateSelectedFilesSummary = function() {
        // Calculate average number of selected contigs
        var contigsTotalNumber = 0;
        // Count all contigs
        $.each($('.assembly-item'), function(key, value){
            contigsTotalNumber = contigsTotalNumber + parseInt($(value).find('.assembly-stats-number-contigs').text(), 10);
        });
        $('.assembly-sequences-average').text(Math.floor(contigsTotalNumber / Object.keys(fastaFilesAndMetadata).length));

        // Set total number of selected assemblies/files
        $('.assembly-upload-total-number').text(Object.keys(fastaFilesAndMetadata).length);
    };

    var assemblyListSliderEventHandler = function(event, ui) {
        updateSelectedFilesUI(ui.value);
        /*
        // Update sequence list item content
        // Hide all sequences
        $('.assembly-item').hide();
        // Show selected sequence
        //$('.assembly-item-' + ui.value).show();
        $('.assembly-item').eq(ui.value-1).show();
        // Update assembly file name
        $('.assembly-file-name').text($('.assembly-item-' + ui.value).attr('data-name'));
        // Store displayed fasta file name
        selectedFastaFileName = $('.assembly-item-' + ui.value).attr('data-name');
        */
    };
    // Handle slide event
    // Triggered when user moved but didn't release range handle
    $('.assembly-list-slider').on('slide', assemblyListSliderEventHandler);
    // Handle slidechange event
    // Triggered when user clicks a button or releases range handle
    $('.assembly-list-slider').on('slidechange', assemblyListSliderEventHandler);
    // Navigate to the previous sequence
    $('.nav-prev-item').on('click', function(e){
        // Check if selected sequence counter value is greater than 1
        if ($('.assembly-list-slider').slider('value') > 1) {
            // Decrement slider's value
            $('.assembly-list-slider').slider('value', $('.assembly-list-slider').slider('value') - 1);
        }
        e.preventDefault();
    });
    // Navigate to the next sequence
    $('.nav-next-item').on('click', function(e){
        // Check if selected sequence counter value is less than total number of dropped assemblies
        if ($('.assembly-list-slider').slider('value') < parseInt($('.total-number-of-dropped-assemblies').text(), 10)) {
            // Increment slider's value
            $('.assembly-list-slider').slider('value', $('.assembly-list-slider').slider('value') + 1);
        }
        e.preventDefault();
    });

    // Assembly metadata from

    // Show hint message when 'I am not sure' checkbox is checkec
    $('.assembly-metadata-list-container').on('click', '.not-sure-checkbox', function(){
        // Show 'I am not sure' message
        $(this).closest('label').find('.not-sure-hint').toggleClass('hide-this');
    });

    var updateMetadataProgressBar = function() {
        // Calculate total number of metadata form elements
        var totalNumberOfMetadataItems = 
            //$('.assembly-sample-species-select').length
            + $('.assembly-sample-datetime-input').length
            + $('.assembly-sample-location-input').length;

        // Calculate number of non empty metadata form elements
        var numberOfNonEmptyMetadataItems =
            /*
            // Filter out default value
            $('.assembly-sample-species-select').filter(function(){
                return $(this).val() !== '0';
            }).length
            */
            // Filter out empty datetime inputs
            + $('.assembly-sample-datetime-input').filter(function(){
                return this.value.length !== 0;
            }).length
            // Filter out empty location inputs
            + $('.assembly-sample-location-input').filter(function(){
                return this.value.length !== 0;
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

            // Enable 'Upload' button
            //$('.assemblies-upload-ready-button').removeAttr('disabled');
        }
    };

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

    // Show next form block when user fills in an input
    // http://stackoverflow.com/a/6458946
    // Relevant issue: https://github.com/Eonasdan/bootstrap-datetimepicker/issues/83
    $('.assembly-metadata-list-container').on('change change.dp', '.assembly-sample-datetime-input', function(){
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
    // Increment metadata progress bar
    $('.assembly-metadata-list-container').on('change change.dp', '.assembly-sample-datetime-input', function(){
        // Increment progress bar
        updateMetadataProgressBar();
    });
    $('.assembly-metadata-list-container').one('hide.dp', '.assembly-sample-datetime-input', function(event){
        var that = $(this);
        setTimeout(function(){
            // Scroll to the next form block
            //$(this).closest('.assembly-metadata').scrollTop($(this).closest('.assembly-metadata').height());
            that.closest('.assembly-metadata').animate({scrollTop: that.closest('.assembly-metadata').height()}, 400);
        }, 500);
    });

    // Show next form block when user fills in an input
    $('.assembly-metadata-list-container').on('change', '.assembly-sample-location-input', function(){

        // Show next form block if current input has some value
        if ($(this).val().length > 0) {

            // TO DO: Validate input value

            // Show next metadata form block
            $(this).closest('.form-block').next('.form-block').fadeIn();

            // Scroll to the next form block
            //$(this).closest('.assembly-metadata').scrollTop($(this).closest('.assembly-metadata').height());
            $(this).closest('.assembly-metadata').animate({scrollTop: $(this).closest('.assembly-metadata').height()}, 400);
        }

        // Increment metadata progress bar
        updateMetadataProgressBar();
        // Hide progress hint
        $('.adding-metadata-progress-container .progress-hint').fadeOut();
    });

    // TO DO: Refactor
    // When 'Next empty assembly' button is pressed
    $('.assembly-metadata-list-container').on('click', '.assembly-metadata button.next-assembly-button', function(e){
        // Show assembly with empty metadata input field

        // Trigger to show next assembly
        $('.nav-next-item').trigger('click');

        //$('#assembly-item-' + (+currentAssemblyIdCounter + 1)).find('input:first').focus();

        // Focus on the next empty input field
        //$(this).closest('.assembly-metadata-list-container').find('.assembly-metadata-item input:text[value=""]').focus();
        //console.log($(this).closest('.assembly-metadata-list-container').find('.assembly-metadata-item input:text[value=""]'));

        var currentAssemblyIdCounter = $(this).closest('.assembly-item').attr('id').replace('assembly-metadata-item-', '');

        $(this).closest('.assembly-metadata-list-container').find('.assembly-metadata-block input:text[value=""]').focus();

        e.preventDefault();
    });

    var updateAssemblyUploadProgressBar = function(collectionId) {
        // Get total number of assemblies to upload
        var totalNumberOfAssemblies = Object.keys(fastaFilesAndMetadata).length;
        // Calculate number of uploaded assemblies
        var numberOfUploadedAssemblies = 0;
        for (var fastaFileAndMetadata in fastaFilesAndMetadata) {
            if (fastaFilesAndMetadata.hasOwnProperty(fastaFileAndMetadata)) {
                if (fastaFilesAndMetadata[fastaFileAndMetadata].uploaded) {
                    numberOfUploadedAssemblies = numberOfUploadedAssemblies + 1;
                }
            }
        }

        // If all assemblies have been uploaded then end progress bar
        if (numberOfUploadedAssemblies === totalNumberOfAssemblies) {
            endAssemblyUploadProgressBar(collectionId);
        } else {
            // Calculate new progress bar percentage value
            var newProgressBarPercentageValue = Math.floor(numberOfUploadedAssemblies * 100 / totalNumberOfAssemblies);

            // Update bar's width
            $('.uploading-assembly-progress-container .progress-bar').width(newProgressBarPercentageValue + '%');
            // Update aria-valuenow attribute
            $('.uploading-assembly-progress-container .progress-bar').attr('aria-valuenow', newProgressBarPercentageValue);
            // Update percentage value
            $('.uploading-assembly-progress-container .progress-percentage').text(newProgressBarPercentageValue + '%');
        }
    };

    var getAssemblyTopScore = function(assemblyScores) {
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

    var getCollection = function(collectionId) {
        console.log('[WGST] Getting collection with id: ' + collectionId);

        // Get collection that you just created/modified
        $.ajax({
            type: 'POST',
            url: '/collection/',
            datatype: 'json', // http://stackoverflow.com/a/9155217
            data: {
                collectionId: collectionId
            }
        })
        .done(function(data, textStatus, jqXHR) {
            console.log('[WGST] Got collection with id: ' + collectionId);
            console.log(data);

            var collectionAssemblyIdentifiers = data.assemblyIdentifiers;
            console.log('[WGST] Collection ' + collectionId + ' length: ' + data.assemblyIdentifiers.length);
            console.log('[WGST] Requesting assembly data for ids: ' + collectionAssemblyIdentifiers);

            // Get assemblies data
            $.ajax({
                type: 'POST',
                url: '/api/assemblies',
                datatype: 'json', // http://stackoverflow.com/a/9155217
                data: {
                    assemblyIds: collectionAssemblyIdentifiers
                }
            })
            .done(function(data, textStatus, jqXHR) {
                console.log('[WGST] Received assemblies:');
                console.log(data);

                // PASTE IT BACK

                var assemblies = data;

                // Get list of all antibiotics
                $.ajax({
                    type: 'GET',
                    url: '/api/all-antibiotics',
                    datatype: 'json', // http://stackoverflow.com/a/9155217
                    data: {}
                })
                .done(function(data, textStatus, jqXHR) {
                    console.log('[WGST] Got list of all antibiotics:');
                    console.log(data);

                    var antibiotics = data;

                    // TO DO: Refactor: Rename data to assemblies
                    data = assemblies;

                    var assemblyId,
                        assemblyIds = Object.keys(assemblies),
                        assemblyCounter = 0,
                        // Get the last property (assembly) of the object
                        lastAssemblyId = assemblyIds[assemblyIds.length - 1],
                        lastAssembly = data[lastAssemblyId]['FP_COMP'],
                        assemblyTopScore,
                        selectNodesWithIds = '';

                    // Set assembly created date
                    // Format to readable string so that user could read exact time on mouse over
                    $('.assembly-created-datetime').attr('title', moment(lastAssembly.timestamp, "YYYYMMDD_HHmmss").format('YYYY-MM-DD HH:mm:ss'));
                    // Convert to time ago
                    $('.timeago').timeago();

                    // Parse each assembly object
                    for (assemblyId in data) {
                        console.log('[WGST] Parsing assembly with id: ' + assemblyId);
                        console.log(data[assemblyId]);
                        //console.log('Top score: ' + getAssemblyTopScore(data[assemblyId].value.scores));
                       
                        // Get top score for this assembly
                        assemblyTopScore = getAssemblyTopScore(data[assemblyId]['FP_COMP'].scores);

                        console.log('[WGST] Top score reference id: ' + assemblyTopScore.referenceId);

                        var assemblyLatitude = data[assemblyId]['ASSEMBLY_METADATA'].geographicLocation.coordinates[0],
                            assemblyLongitude = data[assemblyId]['ASSEMBLY_METADATA'].geographicLocation.coordinates[1];

                        console.log('[WGST] Assembly coordinates: ' + assemblyLatitude + ', ' + assemblyLongitude);

                        console.log('[WGST] Generating Resistance Profile table');

                        var assemblyResistanceProfile = data[assemblyId].PAARSNP_RESULT.paarResult.resistanceProfile,
                            assemblyResistanceProfileHtml = '';

                        /*

                        TO DO: Try changing .antibiotic span elements to div and see if that will introduce hover right border bug,
                        when Bootstrap Tooltip is activated.

                        */

                        // Parse each antibiotic group
                        for (var antibioticGroupName in antibiotics) {

                            var antibioticGroupHtml = '<div class="antibiotic-group" data-antibiotic-group-name="' + antibioticGroupName + '">';

                            // Parse each antibiotic
                            for (var antibioticName in antibiotics[antibioticGroupName]) {

                                var antibioticHtml = '';

                                // Antibiotic found in Resistance Profile for this assembly
                                if (typeof assemblyResistanceProfile[antibioticGroupName] !== 'undefined') {
                                    
                                    if (typeof assemblyResistanceProfile[antibioticGroupName][antibioticName] !== 'undefined') {

                                        var assemblyAntibioticResistanceState = assemblyResistanceProfile[antibioticGroupName][antibioticName].resistanceState;

                                        if (assemblyAntibioticResistanceState === 'RESISTANT') {
                                            antibioticHtml = antibioticHtml + '<span class="antibiotic resistance-fail" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '"></span>';
                                        } else if (assemblyAntibioticResistanceState === 'SENSITIVE') {
                                            antibioticHtml = antibioticHtml + '<span class="antibiotic resistance-success" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '"></span>';
                                        } else {
                                            antibioticHtml = antibioticHtml + '<span class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '"></span>';
                                        }

                                    } else {
                                        antibioticHtml = antibioticHtml + '<span class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '"></span>';
                                    }

                                } else {
                                    antibioticHtml = antibioticHtml + '<span class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '"></span>';
                                }

                                antibioticGroupHtml = antibioticGroupHtml + antibioticHtml;

                            } // for

                            antibioticGroupHtml = antibioticGroupHtml + '</div>';

                            assemblyResistanceProfileHtml = assemblyResistanceProfileHtml + antibioticGroupHtml;

                        } // for

                        // Append to only first tbody tag (currently there more than one)
                        $('.assemblies-summary-table tbody').eq(0).append(
                            // This is not verbose enough
                            ((assemblyCounter % 2 === 0) ? '<tr class="row-stripe">' : '<tr>')
                            //'<tr>'
                                + '<td class="show-on-tree-radio-button">'
                                    + '<input type="radio" data-reference-id="' + assemblyTopScore.referenceId + '" data-assembly-id="' + data[assemblyId]['FP_COMP'].assemblyId + '" name="optionsRadios" value="' + assemblyTopScore.referenceId + '">'
                                    //+ '<input type="checkbox" data-reference-id="' + assemblyTopScore.referenceId + '" data-assembly-id="' + data[assemblyId]['FP_COMP'].assemblyId + '" data-latitude="' + assemblyLatitude + '" data-longitude="' + assemblyLongitude + '">'
                                + '</td>'
                                + '<td class="show-on-map-checkbox">'
                                    + '<input type="checkbox" data-reference-id="' + assemblyTopScore.referenceId + '" data-assembly-id="' + data[assemblyId]['FP_COMP'].assemblyId + '" data-latitude="' + assemblyLatitude + '" data-longitude="' + assemblyLongitude + '">'
                                + '</td>'
                                + '<td>' + '<a href="#" class="open-assembly-button" data-assembly-id="' + data[assemblyId]['FP_COMP'].assemblyId + '">' + data[assemblyId]['ASSEMBLY_METADATA']['assemblyUserId'] + '</a>' + '</td>'
                                + '<td>' + assemblyTopScore.referenceId + ' (' + Math.round(assemblyTopScore.score.toFixed(2) * 100) + '%)</td>'
                                //+ '<td>' + assemblyTopScore.score.toFixed(2) + ' = ' + Math.round(assemblyTopScore.score * parseInt(data[assemblyId]['FP_COMP']['fingerprintSize'], 10)) + '/' + data[assemblyId]['FP_COMP']['fingerprintSize'] + '</td>'
                                //+ '<td>' + assemblyTopScore.score.toFixed(2) * 100 + '%</td>'
                                + '<td>'
                                    // Resistance profile
                                    +'<div class="assembly-resistance-profile-container">'
                                        + assemblyResistanceProfileHtml
                                    + '</div>'

                                + '</td>'
                            + '</tr>'
                        );

                        // Increment counter
                        assemblyCounter = assemblyCounter + 1;

                    } // for

                    // TO DO: Create table with results for each assembly in this collection
                    // TO DO: Highlight parent node on the reference tree
                    // TO DO: Create markers for each assembly in this collection?

                    //closePanel('assemblyUploadNavigator');
                    //closePanel('assemblyUploadAnalytics');
                    //closePanel('assemblyUploadMetadata');
                    //closePanel(['assemblyUploadNavigator', 'assemblyUploadAnalytics', 'assemblyUploadMetadata']);

                    closePanel('assemblyUploadProgress');

    /*                                    // Close Assembly Upload Navigator panel
                    $('.wgst-panel__assembly-upload-navigator').fadeOut('fast', function(){
                        // Make it inactive
                        $(this).removeClass('wgst-panel--active');
                    });

                    // Close Assembly Upload Analytics panel
                    $('.wgst-panel__assembly-upload-analytics').fadeOut('fast', function(){
                        // Make it inactive
                        $(this).removeClass('wgst-panel--active');
                    });

                    // Close Assembly Upload Metadata panel
                    $('.wgst-panel__assembly-upload-metadata').fadeOut('fast', function(){
                        // Make it inactive
                        $(this).removeClass('wgst-panel--active');
                    });*/

                    // Reset assembly upload panel
                    // TO DO: Refactor?
                    resetAssemlyUploadPanel();

                    //openPanel('representativeTree');

                    openPanel(['representativeTree', 'collection'], function(){
                        bringPanelToTop('collection');
                    });

    /*                                    // Make Collection panel active
                    if (! $('.wgst-panel__collection-panel').hasClass('wgst-panel--active')) {
                        $('.wgst-panel__collection-panel').addClass('wgst-panel--active');
                    }*/

    /*                                    // Bring collection-panel panel to front and open
                    $('.wgst-panel__collection-panel').trigger('mousedown').fadeIn('fast');
    */
                    // Bring assembly-panel panel to front and open
                    //$('.assembly-panel').trigger('mousedown').fadeIn('fast');

                        // Set collection properties
                        //$('.collection-properties').append('<li class="collection-property collection-property-created-timestamp"><span class="glyphicon glyphicon-search"></span><span class="assembly-created-datetime timeago" title=""></span></li>');
                    
                        $('.antibiotic[data-toggle="tooltip"]').tooltip();

                    });

                    // Set collection id
                    //$('.collection-panel .collection-id').text(collectionId);


            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log('[WGST][ERROR] Failed to get assembly data');
                console.error(textStatus);
                console.error(errorThrown);
                console.error(jqXHR);
            });
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('[WGST][ERROR] Failed to get collection id');
            console.error(textStatus);
            console.error(errorThrown);
            console.error(jqXHR);
        });
    };

    // Listen to notifications
    socket.on('assemblyUploadNotification', function(data) {
        console.log('[WGST][Socket.io] Received assembly upload notification:');
        console.log(data);

        //WGST.assemblyUploadProgress[data.collectionId][data.assemblyId].results.push(data.result);
        WGST.assemblyUploadProgress.results.push(data.collectionId + '__' + data.assemblyId + '__' + data.result);

        var assemblies = Object.keys(WGST.assemblyUploadProgress[data.collectionId]);

        console.log('WGST.assemblyUploadProgress.results.length: ' + WGST.assemblyUploadProgress.results.length);
        console.log('(assemblies.length * WGST.assemblyAnalysis.length): ' + (assemblies.length * WGST.assemblyAnalysis.length));

        if ((assemblies.length * WGST.assemblyAnalysis.length) === WGST.assemblyUploadProgress.results.length) {
            getCollection(data.collectionId);
        }
    });

    var endAssemblyUploadProgressBar = function(collectionId) {
        // Update bar's width
        $('.uploading-assembly-progress-container .progress-bar').width('100%');
        // Update aria-valuenow attribute
        $('.uploading-assembly-progress-container .progress-bar').attr('aria-valuenow', 100);
        // Update percentage value
        $('.uploading-assembly-progress-container .progress-percentage').text('100%');

        //$('.uploading-assembly-progress-container .progress').removeClass('active');

        // Allow smooth visual transition of elements
        setTimeout(function(){
            $('.uploading-assembly-progress-container .progress-percentage').text('All done!');
            $('.uploading-assembly-progress-container .progress').slideUp(function(){

                /*
                // Allow smooth visual transition of elements
                setTimeout(function(){
                    $('.uploaded-assembly-url').slideDown(function(){
                        $('.uploading-assembly-progress-container .progress-label').slideUp();
                    });
                }, 500);
                */

            });
        }, 500);

        // It takes less than 30 seconds to process one assembly
        //var seconds = 30 * Object.keys(fastaFilesAndMetadata).length;
            //function() {
                //$('.visit-url-seconds-number').text(seconds);
                //seconds = seconds - 1;
                //if (seconds === 0) {
                    // Hide processing assembly seconds countdown
                    //$('.uploaded-assembly-process-countdown-label').fadeOut(function(){
                        // Update status
                        //$('.uploaded-assembly-process-status').text('finished processing');
                    //});
                //}

    };

    /*
    $('.wgst-panel__collection-panel .assemblies-summary-table').on('click', 'tr', function(event) {
        if (event.target.type !== 'radio' && event.target.type !== 'checkbox') {
            $(':checkbox', this).trigger('click');
        }
    });
    */

    // User wants to show assembly on map
    $('.wgst-panel__collection-panel .assemblies-summary-table').on('change', 'input[type="checkbox"]', function(e) {

        //======================================================
        // Map
        //======================================================

        var checkedAssemblyId = $(this).attr('data-assembly-id');

        // Checked
        if ($(this).is(":checked")) {
            console.log('[WGST] Creating marker for assembly id: ' + checkedAssemblyId);

            // Create marker
            window.WGST.geo.markers.assembly[checkedAssemblyId] = new google.maps.Marker({
                position: new google.maps.LatLng($(this).attr('data-latitude'), $(this).attr('data-longitude')),
                map: window.WGST.geo.map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                optimized: true // http://www.gutensite.com/Google-Maps-Custom-Markers-Cut-Off-By-Canvas-Tiles
            });

            // Highlight row
            $(this).closest('tr').addClass("row-highlighted");

        // Unchecked
        } else {
            console.log('[WGST] Removing marker for assembly id: ' + checkedAssemblyId);

            // Remove marker
            window.WGST.geo.markers.assembly[checkedAssemblyId].setMap(null);

            // Remove node highlighing
            $(this).closest('tr').removeClass("row-highlighted");
        }

        // Extend markerBounds with each metadata marker
        window.WGST.geo.markerBounds.extend(window.WGST.geo.markers.assembly[checkedAssemblyId].getPosition());
        // Pan to marker bounds
        window.WGST.geo.map.panToBounds(window.WGST.geo.markerBounds);
        // Set the map to fit marker bounds
        window.WGST.geo.map.fitBounds(window.WGST.geo.markerBounds);
    });

    // User wants to select representative tree branch
    $(".wgst-panel__collection-panel .assemblies-summary-table").on('change', 'input[type="radio"]', function(e) {

        //======================================================
        // Tree
        //======================================================

        // Store node ids to highlight in a string
        var checkedAssemblyNodesString = '';

        // Get node id of each node that use selected via checked checkbox 
        $('.wgst-panel__collection-panel .assemblies-summary-table input[type="radio"]:checked').each(function(){
            // Concat assembly ids to string
            // Use this string to highlight nodes on tree
            if (checkedAssemblyNodesString.length > 0) {
                checkedAssemblyNodesString = checkedAssemblyNodesString + ',' + $(this).attr('data-reference-id');
            } else {
                checkedAssemblyNodesString = $(this).attr('data-reference-id');
            }
        });

        // Highlight assembly with the highest score on the representative tree
        window.WGST.representativeTree.tree.selectNodes(checkedAssemblyNodesString);
    });

    $('.assemblies-upload-cancel-button').on('click', function() {
        // Close FASTA files upload panel
        $('.assembly-upload-panel').hide();
        // Remove stored dropped FASTA files
        fastaFilesAndMetadata = {};
        // Remove stored selected FASTA file
        selectedFastaFileName = '';
        // Remove analytics HTML element
        $('.assembly-list-container ul').html('');
        // Remove metadata HTML element
        $('.assembly-metadata-list-container ul').html('');
        // Reset progress bar
        // Update bar's width
        $('.adding-metadata-progress-container .progress-bar').width('0%');
        // Update aria-valuenow attribute
        $('.adding-metadata-progress-container .progress-bar').attr('aria-valuenow', 0);
        // Update percentage value
        $('.adding-metadata-progress-container .progress-percentage').text('0%');
        // Remove metadata marker
        window.WGST.geo.markers.metadata.setMap(null);
    });

    var assemblyUploadDoneHandler = function(collectionId, fastaFile) {
        return function(data, textStatus, jqXHR) {
            console.log('[WGST] Successfully sent FASTA file object to the server and received response message');

            // Create assembly URL
            var url = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/assembly/' + 'FP_COMP_' + data.assemblyId;
            $('.uploaded-assembly-url-input').val(url);

            // Mark assembly as uploaded
            fastaFilesAndMetadata[fastaFile].uploaded = true;

            updateAssemblyUploadProgressBar(collectionId);

            WGST.assemblyUploadProgress[collectionId][data.assemblyId] = {
                results: []
            };
        };
    };

    $('.assemblies-upload-ready-button').on('click', function() {
        console.log('[WGST] Getting ready to send assemblies and metadata');

        // Remove metadata marker
        window.WGST.geo.markers.metadata.setMap(null);
        
        // Disable upload button
        $(this).attr('disabled','disabled');

        // Close panels
        closePanel(['assemblyUploadNavigator', 'assemblyUploadAnalytics', 'assemblyUploadMetadata']);

        // Open assembly upload progress panel
        openPanel('assemblyUploadProgress', function(){
            console.log('[WGST] Getting collection id');

            // Get collection id
            $.ajax({
                type: 'POST',
                url: '/collection/add/',
                datatype: 'json', // http://stackoverflow.com/a/9155217
                data: {}
            })
            .done(function(data, textStatus, jqXHR) {

                var collectionIdResponse = JSON.parse(data),
                    collectionId = collectionIdResponse.uuid;

                console.log('[WGST] Collection id: ' + collectionId);
                console.log('[WGST] Collection response: ');
                console.log(collectionIdResponse);

                // Store ids of assemblies you're uploading
                WGST.assemblyUploadProgress[collectionId] = [];

                // Post each FASTA file separately
                for (var fastaFile in fastaFilesAndMetadata) {
                    if (fastaFilesAndMetadata.hasOwnProperty(fastaFile)) {

                        // Add collection id to each FASTA file object
                        fastaFilesAndMetadata[fastaFile].collectionId = collectionId;

                        var autocompleteInput = $('li[data-name="' + fastaFile + '"] .assembly-sample-location-input');

                        // Add metadata to each FASTA file object
                        fastaFilesAndMetadata[fastaFile].metadata = {
                            location: {
                                // TO DO: Change 'data-name' to 'data-file-name'
                                latitude: autocompleteInput.attr('data-latitude'),
                                longitude: autocompleteInput.attr('data-longitude')
                            }
                        };

                        console.log('[WGST] Metadata for ' + fastaFile + ': ');
                        console.log(fastaFilesAndMetadata[fastaFile].metadata);

                        // Post assembly
                        $.ajax({
                            type: 'POST',
                            url: '/assembly/add/',
                            datatype: 'json', // http://stackoverflow.com/a/9155217
                            data: fastaFilesAndMetadata[fastaFile]
                        })
                        .done(assemblyUploadDoneHandler(collectionId, fastaFile))
                        .fail(function(jqXHR, textStatus, errorThrown) {
                            console.log('[WGST][ERROR] Failed to send FASTA file object to server or received error message');
                            console.error(textStatus);
                            console.error(errorThrown);
                            console.error(jqXHR);
                            updateAssemblyUploadProgressBar();
                        });

                    } // if
                } // for
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log('[WGST][ERROR] Failed to get collection id');
                console.error(textStatus);
                console.error(errorThrown);
                console.error(jqXHR);
            });

        });

/*        $('.uploading-assembly-progress-container').fadeIn('slow', function(){
            $('.adding-metadata-progress-container').slideUp('normal', function(){

                // Add delay for smooth visual transition
                setTimeout(function(){

                }, 300);
            });
        });*/
    });

    $('.cancel-assembly-upload-button').on('click', function(){
        // Remove selected FASTA file

        // Remove HTML element
        $('.assembly-item[data-name="' + selectedFastaFileName + '"]').remove();
        // Delete data object
        delete fastaFilesAndMetadata[selectedFastaFileName];

        // Update assembly list slider
        $('.assembly-list-slider').slider("option", "max", Object.keys(fastaFilesAndMetadata).length);
        // Recalculate total number of selected files
        $('.total-number-of-dropped-assemblies').text(Object.keys(fastaFilesAndMetadata).length);

        updateSelectedFilesUI($('.assembly-list-slider').slider('value'));

        // Check if only 1 selected file left
        if (Object.keys(fastaFilesAndMetadata).length === 1) {
            // Update label
            $('.assembly-upload-total-number-label').text('assembly');
            // Update file name of assembly
            $('.upload-single-assembly-file-name').text(fastaFilesAndMetadata[Object.getOwnPropertyNames(fastaFilesAndMetadata)[0]].name);
            // Hide multiple assemblies label
            $('.upload-multiple-assemblies-label').hide();
            // Show single assembly label
            $('.upload-single-assembly-label').show();
            // Only 1 selected file left - hide assembly navigator
            $('.assembly-navigator').hide();
        } else {
            // More than 1 selected files left - update assembly navigator
            updateRangeNavigationButtons($('.assembly-list-slider').slider('value')); 
        }

        updateSelectedFilesSummary();
        updateMetadataProgressBar();
    });

    // Bring to front selected panel
    $('.wgst-panel').on('mousedown', function(){

        bringPanelToTop($(this).attr('data-panel-name'));

        /*
        // Change z index for all panels
        $('.wgst-panel').css('z-index', 100);
        // Set the  highest z index for this (selected) panel
        $(this).css('z-index', 101);
        */
    });

    // Deselect Twitter Bootstrap button on click
    $('.tree-panel .tree-controls button').on('click', function(){
        $(this).blur();
    });

    $('.wgst-panel__assembly-upload-metadata').on('click', '.apply-to-all-assemblies-button', function(){

        // Get metadata from selected assembly
        var metadataElementTimestamp = $(this).closest('.assembly-metadata').find('.assembly-sample-datetime-input'),
            metadataElementLocation = $(this).closest('.assembly-metadata').find('.assembly-sample-location-input');

        // Set value
        $('.assembly-metadata').find('.assembly-sample-datetime-input').val(metadataElementTimestamp.val());
        $('.assembly-metadata').find('.assembly-sample-location-input').val(metadataElementLocation.val());

        // Set data
        $('.assembly-metadata').find('.assembly-sample-location-input').attr('data-latitude', metadataElementLocation.attr('data-latitude'));
        $('.assembly-metadata').find('.assembly-sample-location-input').attr('data-longitude', metadataElementLocation.attr('data-longitude'));

        // Show metadata
        $('.assembly-metadata-block').show();

        updateMetadataProgressBar();

    });

    // Open Assembly from Collection list
    $('.wgst-panel__collection-panel').on('click', '.open-assembly-button', function(e){

        var assemblyId = $(this).attr('data-assembly-id');

        // ============================================================
        // Close any previously openned assembly panels
        // ============================================================

        if (isOpenedPanel('assembly')) {

            closePanel('assembly', function(){

                // Remove content
                $('.wgst-panel__assembly-panel .assembly-details .assembly-detail-content').html('');

                openAssemblyPanel(assemblyId);
            });
        } else {
            openAssemblyPanel(assemblyId);
        }

        e.preventDefault();
    });

    var openAssemblyPanel = function(assemblyId) {

        // ============================================================
        // Get assembly data
        // ============================================================

        //var assemblyId = $(this).attr('data-assembly-id');

        // Get assembly data
        $.ajax({
            type: 'POST',
            url: '/api/assembly',
            datatype: 'json', // http://stackoverflow.com/a/9155217
            data: {
                assemblyId: assemblyId
            }
        })
        .done(function(data, textStatus, jqXHR) {
            console.log('[WGST] Received data for assembly id: ' + assemblyId);
            console.log(data);

            // ============================================================
            // Prepare assembly panel
            // ============================================================

            var assembly = data.assemblies[assemblyId],
                assemblyPanel = $('.wgst-panel__assembly-panel');

            // Set assembly name
            assemblyPanel.find('.header-title small').text(assembly.ASSEMBLY_METADATA.assemblyUserId);

            // ============================================================
            // Prepare predicted resistance profile
            // ============================================================

            var antibiotics = data.antibiotics,
                assemblyResistanceProfile = assembly.PAARSNP_RESULT.paarResult.resistanceProfile,
                assemblyResistanceProfileHtml = '',
                antibioticGroupHtml = '',
                antibioticResistancesHtml = '';

            // Parse each antibiotic group
            for (var antibioticGroupName in antibiotics) {
                if (antibiotics.hasOwnProperty(antibioticGroupName)) {

                    antibioticGroupHtml = 
                    '<table class="antibiotic-group" data-antibiotic-group-name="{{antibioticGroupName}}">'
                    + '<thead>'
                        + '<tr>'
                            + '<th>{{antibioticGroupName}}</th>'
                        + '</tr>'
                    + '</thead>'
                    + '<tbody>'
                        + '<tr>'
                            + '<td>'
                                + '<table>'
                                    + '<tbody>'
                                        + '<tr>{{antibioticResistancesHtml}}</tr>'
                                    + '</tbody>'
                                + '</table>'
                            + '</td>'
                        + '</tr>'
                    + '</tbody>'
                    + '</table>',
                    antibioticNamesHtml = '',
                    antibioticResistancesHtml = '';

                    // Parse each antibiotic
                    for (var antibioticName in antibiotics[antibioticGroupName]) {
                        if (antibiotics[antibioticGroupName].hasOwnProperty(antibioticName)) {

                            var antibioticNamesHtml = antibioticNamesHtml + '<td>' + antibioticName + '</td>';

                            // Antibiotic found in Resistance Profile for this assembly
                            if (typeof assemblyResistanceProfile[antibioticGroupName] !== 'undefined') {
                                
                                if (typeof assemblyResistanceProfile[antibioticGroupName][antibioticName] !== 'undefined') {

                                    var assemblyAntibioticResistanceState = assemblyResistanceProfile[antibioticGroupName][antibioticName].resistanceState;

                                    if (assemblyAntibioticResistanceState === 'RESISTANT') {
                                        antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-fail" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                    } else if (assemblyAntibioticResistanceState === 'SENSITIVE') {
                                        antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-success" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                    } else {
                                        antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                    }

                                } else {
                                    antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                                }

                            } else {
                                antibioticResistancesHtml = antibioticResistancesHtml + '<td><div class="antibiotic resistance-unknown" data-antibiotic-name="' + antibioticName + '" data-antibiotic-resistance-state="' + assemblyAntibioticResistanceState + '" data-toggle="tooltip" data-placement="top" title="' + antibioticName + '">' + antibioticName +'</div></td>';
                            }

                        } // if
                    } // for

                    antibioticGroupHtml = antibioticGroupHtml.replace(/{{antibioticGroupName}}/g, antibioticGroupName);
                    antibioticGroupHtml = antibioticGroupHtml.replace(/{{antibioticResistancesHtml}}/, antibioticResistancesHtml);

                    assemblyResistanceProfileHtml = assemblyResistanceProfileHtml + antibioticGroupHtml;

                } // if
            } // for

            $('.wgst-panel__assembly-panel .assembly-detail__resistance-profile .assembly-detail-content').append($(assemblyResistanceProfileHtml));

            // ============================================================
            // Prepare MLST
            // ============================================================

            var assemblyAlleles = assembly.MLST_RESULT.alleles,
                assemblyMlstHtml =
                '<table>'
                    + '<tbody>'
                        + '<tr>'
                            + '<td class="row-title">Locus Id</td>'
                            + '{{locusIds}}'
                        + '</tr>'
                        + '<tr>'
                            + '<td class="row-title">Allele Id</td>'
                            + '{{alleleIds}}'
                        + '</tr>'
                    + '</tbody>'
                + '</table>',
                locusDataHtml = '',
                alleleDataHtml = '';

            for (var assemblyAllele in assemblyAlleles) {
                if (assemblyAlleles.hasOwnProperty(assemblyAllele)) {

                    locusDataHtml = locusDataHtml + '<td>' + assemblyAlleles[assemblyAllele].locusId + '</td>'
                    alleleDataHtml = alleleDataHtml + '<td>' + assemblyAlleles[assemblyAllele].alleleId + '</td>';

                } // if
            } // for

            assemblyMlstHtml = assemblyMlstHtml.replace('{{locusIds}}', locusDataHtml);
            assemblyMlstHtml = assemblyMlstHtml.replace('{{alleleIds}}', alleleDataHtml);

            $('.wgst-panel__assembly-panel .assembly-detail__mlst .assembly-detail-content').append($(assemblyMlstHtml));

            // ============================================================
            // Prepare nearest representative
            // ============================================================

            var assemblyScores = assembly['FP_COMP'].scores,
                assemblyTopScore = getAssemblyTopScore(assemblyScores);

            $('.wgst-panel__assembly-panel .assembly-detail__nearest-representative .assembly-detail-content').text(assemblyTopScore.referenceId);

            // ============================================================
            // Prepare scores
            // ============================================================

            var assemblyScoresHtml =
                '<table>'
                    + '<thead>'
                        + '<tr>'
                            + '<th>Reference Id</th>'
                            + '<th>Score</th>'
                        + '</tr>'
                    + '</thead>'
                    + '<tbody>'
                        + '{{assemblyScoresDataHtml}}'
                    + '</tbody>'
                + '</table>',
                assemblyScoresDataHtml = '',
                scoreText;

            // Sort scores
            var sortedAssemblyScores = Object.keys(assemblyScores).sort(function(assemblyScoreReferenceId1, assemblyScoreReferenceId2){
                return assemblyScores[assemblyScoreReferenceId1] - assemblyScores[assemblyScoreReferenceId2];
            });

            console.log('sortedAssemblyScores:');
            console.log(sortedAssemblyScores);

            /*
            assemblyScores = [assemblyScores].sort(function(obj1, obj2){
                var scoreOne = obj1.score.toFixed(2) + ' = ' + Math.round(obj1.score * parseInt(assembly['FP_COMP']['fingerprintSize'], 10)) + '/' + assembly['FP_COMP']['fingerprintSize'];
                var scoreTwo = obj2.score.toFixed(2) + ' = ' + Math.round(obj2.score * parseInt(assembly['FP_COMP']['fingerprintSize'], 10)) + '/' + assembly['FP_COMP']['fingerprintSize'];

                return scoreTwo - scoreOne;
            });

            console.log(assemblyScores);
            assemblyScores = assemblyScores[0];
            */

            var assemblyScoreCounter = sortedAssemblyScores.length;
            for (; assemblyScoreCounter !== 0;) {
                assemblyScoreCounter = assemblyScoreCounter - 1;

                    var referenceId = sortedAssemblyScores[assemblyScoreCounter],
                        scoreData = assemblyScores[referenceId],
                        scoreText = scoreData.score.toFixed(2) + ' = ' + Math.round(scoreData.score * parseInt(assembly['FP_COMP']['fingerprintSize'], 10)) + '/' + assembly['FP_COMP']['fingerprintSize'];

                    assemblyScoresDataHtml = assemblyScoresDataHtml 
                        + '<tr>' 
                            + '<td>' + scoreData.referenceId + '</td>'
                            + '<td>' + scoreText + '</td>'
                        + '</tr>';

                console.log(scoreData.score);

            } // for
            
            /*
            for (var assemblyScore in assemblyScores) {
                if (assemblyScores.hasOwnProperty(assemblyScore)) {

                    var scoreText = assemblyScores[assemblyScore].score.toFixed(2) + ' = ' + Math.round(assemblyScores[assemblyScore].score * parseInt(assembly['FP_COMP']['fingerprintSize'], 10)) + '/' + assembly['FP_COMP']['fingerprintSize'];

                    assemblyScoresDataHtml = assemblyScoresDataHtml 
                        + '<tr>' 
                            + '<td>' + assemblyScores[assemblyScore].referenceId + '</td>'
                            + '<td>' + scoreText + '</td>'
                        + '</tr>';
                }
            } // for
            */

            assemblyScoresHtml = assemblyScoresHtml.replace('{{assemblyScoresDataHtml}}', assemblyScoresDataHtml);

            //var score = assemblyTopScore.score.toFixed(2) + ' = ' + Math.round(assemblyTopScore.score * parseInt(assembly['FP_COMP']['fingerprintSize'], 10)) + '/' + assembly['FP_COMP']['fingerprintSize']

            $('.wgst-panel__assembly-panel .assembly-detail__score .assembly-detail-content').html(assemblyScoresHtml);

            // ============================================================
            // Open panel
            // ============================================================

            // Bring panel to top
            bringPanelToTop('assembly');
            // Open panel
            openPanel('assembly');
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('[WGST][ERROR] Failed to get assembly data');
            console.error(textStatus);
            console.error(errorThrown);
            console.error(jqXHR);
        });

        e.preventDefault();
    };
});

// TO DO:
// + Sort assemblies selected to upload alphabetically.





