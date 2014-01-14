/*
  d3.phylogram.js
  Wrapper around a d3-based phylogram (tree where branch lengths are scaled)
  Also includes a radial dendrogram visualization (branch lengths not scaled)
  along with some helper methods for building angled-branch trees.
 
  Copyright (c) 2013, Ken-ichi Ueda
 
  All rights reserved.
 
  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:
 
  Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer. Redistributions in binary
  form must reproduce the above copyright notice, this list of conditions and
  the following disclaimer in the documentation and/or other materials
  provided with the distribution.
 
  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
  LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
  SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
  INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
  CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
  POSSIBILITY OF SUCH DAMAGE.
 
  DOCUEMENTATION
 
  d3.phylogram.build(selector, nodes, options)
    Creates a phylogram.
    Arguments:
      selector: selector of an element that will contain the SVG
      nodes: JS object of nodes
    Options:
      width       
        Width of the vis, will attempt to set a default based on the width of
        the container.
      height
        Height of the vis, will attempt to set a default based on the height
        of the container.
      vis
        Pre-constructed d3 vis.
      tree
        Pre-constructed d3 tree layout.
      children
        Function for retrieving an array of children given a node. Default is
        to assume each node has an attribute called "branchset"
      diagonal
        Function that creates the d attribute for an svg:path. Defaults to a
        right-angle diagonal.
      skipTicks
        Skip the tick rule.
      skipBranchLengthScaling
        Make a dendrogram instead of a phylogram.
  
  d3.phylogram.buildRadial(selector, nodes, options)
    Creates a radial dendrogram.
    Options: same as build, but without diagonal, skipTicks, and 
      skipBranchLengthScaling
  
  d3.phylogram.rightAngleDiagonal()
    Similar to d3.diagonal except it create an orthogonal crook instead of a
    smooth Bezier curve.
    
  d3.phylogram.radialRightAngleDiagonal()
    d3.phylogram.rightAngleDiagonal for radial layouts.
*/
 
if (!d3) { throw "d3 wasn't included!"};
(function() {
  d3.phylogram = {}
  d3.phylogram.rightAngleDiagonal = function() {
    var projection = function(d) { return [d.y, d.x]; }
    
    var path = function(pathData) {
      return "M" + pathData[0] + ' ' + pathData[1] + " " + pathData[2];
    }
    
    function diagonal(diagonalPath, i) {
      var source = diagonalPath.source,
          target = diagonalPath.target,
          midpointX = (source.x + target.x) / 2,
          midpointY = (source.y + target.y) / 2,
          pathData = [source, {x: target.x, y: source.y}, target];
      pathData = pathData.map(projection);
      return path(pathData)
    }
    
    diagonal.projection = function(x) {
      if (!arguments.length) return projection;
      projection = x;
      return diagonal;
    };
    
    diagonal.path = function(x) {
      if (!arguments.length) return path;
      path = x;
      return diagonal;
    };
    
    return diagonal;
  }
  
  d3.phylogram.radialRightAngleDiagonal = function() {
    return d3.phylogram.rightAngleDiagonal()
      .path(function(pathData) {
        var src = pathData[0],
            mid = pathData[1],
            dst = pathData[2],
            radius = Math.sqrt(src[0]*src[0] + src[1]*src[1]),
            srcAngle = d3.phylogram.coordinateToAngle(src, radius),
            midAngle = d3.phylogram.coordinateToAngle(mid, radius),
            clockwise = Math.abs(midAngle - srcAngle) > Math.PI ? midAngle <= srcAngle : midAngle > srcAngle,
            rotation = 0,
            largeArc = 0,
            sweep = clockwise ? 0 : 1;
        return 'M' + src + ' ' +
          "A" + [radius,radius] + ' ' + rotation + ' ' + largeArc+','+sweep + ' ' + mid +
          'L' + dst;
      })
      .projection(function(d) {
        var r = d.y, a = (d.x - 90) / 180 * Math.PI;
        return [r * Math.cos(a), r * Math.sin(a)];
      })
  }
  
  // Convert XY and radius to angle of a circle centered at 0,0
  d3.phylogram.coordinateToAngle = function(coord, radius) {
    var wholeAngle = 2 * Math.PI,
        quarterAngle = wholeAngle / 4
    
    var coordQuad = coord[0] >= 0 ? (coord[1] >= 0 ? 1 : 2) : (coord[1] >= 0 ? 4 : 3),
        coordBaseAngle = Math.abs(Math.asin(coord[1] / radius))
    
    // Since this is just based on the angle of the right triangle formed
    // by the coordinate and the origin, each quad will have different 
    // offsets
    switch (coordQuad) {
      case 1:
        coordAngle = quarterAngle - coordBaseAngle
        break
      case 2:
        coordAngle = quarterAngle + coordBaseAngle
        break
      case 3:
        coordAngle = 2*quarterAngle + quarterAngle - coordBaseAngle
        break
      case 4:
        coordAngle = 3*quarterAngle + coordBaseAngle
    }
    return coordAngle
  }
  
  d3.phylogram.styleTreeNodes = function(vis) {
    vis.selectAll('g.leaf.node')
      .append("svg:circle")
        .attr("r", 4.5)
        .attr('stroke',  'yellowGreen')
        .attr('fill', 'greenYellow')
        .attr('stroke-width', '2px');
    
    vis.selectAll('g.root.node')
      .append('svg:circle')
        .attr("r", 4.5)
        .attr('fill', 'steelblue')
        .attr('stroke', '#369')
        .attr('stroke-width', '2px');
  }
  
  function scaleBranchLengths(nodes, w) {
    // Visit all nodes and adjust y pos width distance metric
    var visitPreOrder = function(root, callback) {
      callback(root)
      if (root.children) {
        for (var i = root.children.length - 1; i >= 0; i--){
          visitPreOrder(root.children[i], callback)
        };
      }
    }
    visitPreOrder(nodes[0], function(node) {
      node.rootDist = (node.parent ? node.parent.rootDist : 0) + (node.length || 0)
    })
    var rootDists = nodes.map(function(n) { return n.rootDist; });
    var yscale = d3.scale.linear()
      .domain([0, d3.max(rootDists)])
      .range([0, w]);
    visitPreOrder(nodes[0], function(node) {
      node.y = yscale(node.rootDist)
    })
    return yscale
  }
  
  
  d3.phylogram.build = function(selector, nodes, options) {
    options = options || {}
    var w = options.width || d3.select(selector).style('width') || d3.select(selector).attr('width'),
        h = options.height || d3.select(selector).style('height') || d3.select(selector).attr('height'),
        w = parseInt(w),
        h = parseInt(h);
    var tree = options.tree || d3.layout.cluster()
      .size([h, w])
      .sort(function(node) { return node.children ? node.children.length : -1; })
      .children(options.children || function(node) {
        return node.branchset
      });
    var diagonal = options.diagonal || d3.phylogram.rightAngleDiagonal();
    var vis = options.vis || d3.select(selector).append("svg:svg")
        .attr("width", w + 300)
        .attr("height", h + 30)
      .append("svg:g")
        .attr("transform", "translate(20, 20)");
    var nodes = tree(nodes);
    
    if (options.skipBranchLengthScaling) {
      var yscale = d3.scale.linear()
        .domain([0, w])
        .range([0, w]);
    } else {
      var yscale = scaleBranchLengths(nodes, w)
    }
    
    if (!options.skipTicks) {
      vis.selectAll('line')
          .data(yscale.ticks(10))
        .enter().append('svg:line')
          .attr('y1', 0)
          .attr('y2', h)
          .attr('x1', yscale)
          .attr('x2', yscale)
          .attr("stroke", "#ddd");
 
      vis.selectAll("text.rule")
          .data(yscale.ticks(10))
        .enter().append("svg:text")
          .attr("class", "rule")
          .attr("x", yscale)
          .attr("y", 0)
          .attr("dy", -3)
          .attr("text-anchor", "middle")
          .attr('font-size', '8px')
          .attr('fill', '#ccc')
          .text(function(d) { return Math.round(d*100) / 100; });
    }
        
    var link = vis.selectAll("path.link")
        .data(tree.links(nodes))
      .enter().append("svg:path")
        .attr("class", "link")
        .attr("d", diagonal)
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("stroke-width", "4px");
        
    var node = vis.selectAll("g.node")
        .data(nodes)
      .enter().append("svg:g")
        .attr("class", function(n) {
          if (n.children) {
            if (n.depth == 0) {
              return "root node"
            } else {
              return "inner node"
            }
          } else {
            return "leaf node"
          }
        })
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      
    d3.phylogram.styleTreeNodes(vis)
    
    if (!options.skipLabels) {
      vis.selectAll('g.inner.node')
        .append("svg:text")
          .attr("dx", -6)
          .attr("dy", -6)
          .attr("text-anchor", 'end')
          .attr('font-size', '8px')
          .attr('fill', '#ccc')
          .text(function(d) { return d.length; });
 
      vis.selectAll('g.leaf.node').append("svg:text")
        .attr("dx", 8)
        .attr("dy", 3)
        .attr("text-anchor", "start")
        .attr('font-family', 'Helvetica Neue, Helvetica, sans-serif')
        .attr('font-size', '10px')
        .attr('fill', 'black')
        .text(function(d) { return d.name + ' ('+d.length+')'; });
    }
    
    return {tree: tree, vis: vis}
  }
  
  d3.phylogram.buildRadial = function(selector, nodes, options) {
    options = options || {}
    var w = options.width || d3.select(selector).style('width') || d3.select(selector).attr('width'),
        r = w / 2,
        labelWidth = options.skipLabels ? 10 : options.labelWidth || 120;
    
    var vis = d3.select(selector).append("svg:svg")
        .attr("width", r * 2)
        .attr("height", r * 2)
      .append("svg:g")
        .attr("transform", "translate(" + r + "," + r + ")");
        
    var tree = d3.layout.tree()
      .size([360, r - labelWidth])
      .sort(function(node) { return node.children ? node.children.length : -1; })
      .children(options.children || function(node) {
        return node.branchset
      })
      .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });
    
    var phylogram = d3.phylogram.build(selector, nodes, {
      vis: vis,
      tree: tree,
      skipBranchLengthScaling: true,
      skipTicks: true,
      skipLabels: options.skipLabels,
      diagonal: d3.phylogram.radialRightAngleDiagonal()
    })
    vis.selectAll('g.node')
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
    
    if (!options.skipLabels) {
      vis.selectAll('g.leaf.node text')
        .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
        .attr("dy", ".31em")
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
        .attr('font-family', 'Helvetica Neue, Helvetica, sans-serif')
        .attr('font-size', '10px')
        .attr('fill', 'black')
        .text(function(d) { return d.data.name; });
 
      vis.selectAll('g.inner.node text')
        .attr("dx", function(d) { return d.x < 180 ? -6 : 6; })
        .attr("text-anchor", function(d) { return d.x < 180 ? "end" : "start"; })
        .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; });
    }
    
    return {tree: tree, vis: vis}
  }
}());

'use strict'; // Available in ECMAScript 5 and ignored in older versions. Future ECMAScript versions will enforce it by default.

/* Polyfills */

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

    // Init
    (function(){

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
                $('#graph').hide();
            } else {
                $('#graph').show();
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
        $('.assembly-upload-datetime').text(moment(requestedAssembly.timestamp, "YYYYMMDD_HHmmss").fromNow());

        // Show assembly data
        $('.assembly-panel').show();
    };

    // If user provided assembly id in url then load requested assembly
    if (typeof window.WGST.requestedAssembly !== 'undefined') {
        loadRequestedAssembly(window.WGST.requestedAssembly);
    }

    // WGST namespace
    var WGST = window.WGST || {};

    // Map
    WGST.geo = {
        map: {},
        mapOptions: {
            zoom: 8,
            center: new google.maps.LatLng(51.511214, -0.119824),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        markers: {
            metadata: {}
        },
        //geocoder: new google.maps.Geocoder(),
        metadataAutocomplete: [], // Store Google Autocomplete object for each dropped file
        init: function() {
            this.map = new google.maps.Map(document.getElementById('map'), this.mapOptions);
            this.markers.metadata = new google.maps.Marker({
                position: new google.maps.LatLng(51.511214, -0.119824),
                map: WGST.geo.map,
                visible: false
            });
        }
    };

    // Init map
    WGST.geo.init();

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

        // TODO: Convert multiple strings concatenation to array and use join('')
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
                        + '<div class="assembly-stats-label">total nucleotides</div>'
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
            assemblyMetadataForm = $('<form role="form"></form>'),
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
            assemblySampleDatetimeFormBlock = $(
            '<div class="form-block assembly-metadata-' + fileCounter + ' assembly-metadata-block hide-this">'
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

        assemblyMetadataForm.append(assemblySampleSpeciesFormBlock);
        assemblyMetadataForm.append(assemblySampleDatetimeFormBlock);
        assemblyMetadataForm.append(assemblySampleLocationFormBlock);

        // Show form navigation buttons only when you're at the last assembly
        if (fileCounter < droppedFiles.length) {
            assemblyMetadataForm.append(assemblyControlsFormBlock);
        } else {
            assemblyMetadataForm.append(assemblyMeatadataDoneBlock);
        }
        assemblyMetadataFormContainer.append(assemblyMetadataFormHeader);
        assemblyMetadataFormContainer.append(assemblyMetadataForm);

        assemblyListItem.append(assemblyMetadataFormContainer);

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
        $('.assembly-item').eq('0').show();
        // Store displayed fasta file name
        //selectedFastaFileName = $('.assembly-item-1').attr('data-name');
        selectedFastaFileName = $('.assembly-item').eq('0').attr('data-name');

        // Init bootstrap datetimepicker
        //$('.assembly-upload-panel .assembly-sample-datetime-input').datetimepicker();
        $('#assemblySampleDatetimeInput' + fileCounter).datetimepicker();

        // Init Goolge Maps API Places Autocomplete
        // TO DO: This creates new Autocomplete object for each drag and drop file - possibly needs refactoring/performance optimization
        WGST.geo.metadataAutocomplete[fileCounter] = new google.maps.places.Autocomplete(document.getElementById('assemblySampleLocationInput' + fileCounter));

        // When the user selects an address from the dropdown,
        // get geo coordinates
        // https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform
        // TO DO: Remove this event listener after metadata was sent
        google.maps.event.addListener(WGST.geo.metadataAutocomplete[fileCounter], 'place_changed', function() {

            // Get the place details from the autocomplete object.
            var place = window.WGST.geo.metadataAutocomplete[fileCounter].getPlace();
            // Set map center to selected address
            WGST.geo.map.setCenter(place.geometry.location);
            // Set map
            WGST.geo.markers.metadata.setMap(WGST.geo.map);
            // Set metadata marker's position to selected address
            WGST.geo.markers.metadata.setPosition(place.geometry.location);
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
        });

        /*
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            var place = autocomplete.getPlace();
            console.log('Place: ' + place);
        });
        */
    
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

        // Show upload panel
        $('.assembly-upload-panel').fadeIn('fast');

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
        $('.assembly-upload-total-number-label').text((droppedFiles.length === 1 ? 'assembly': 'assemblies'));

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
        $('.assembly-item').eq(elementCounter - 1).show(); // Convert one-based index to zero-based index used by .eq()
        // Update assembly file name
        //$('.assembly-file-name').text($('.assembly-item-' + elementCounter).attr('data-name'));
        $('.assembly-file-name').text($('.assembly-item').eq(elementCounter - 1).attr('data-name'));
        // Update sequence counter label
        updateRangeNavigationButtons(elementCounter);
        // Store displayed fasta file name
        selectedFastaFileName = $('.assembly-item').eq(elementCounter - 1).attr('data-name');  
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
    }

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
    $('.assembly-list-slider').on( "slide", assemblyListSliderEventHandler);
    // Handle slidechange event
    // Triggered when user clicks a button or releases range handle
    $('.assembly-list-slider').on( "slidechange", assemblyListSliderEventHandler);
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

    var updateMetadataProgressBar = function() {
        // Calculate total number of metadata form elements
        var totalNumberOfMetadataItems = 
            $('.assembly-sample-species-select').length
            + $('.assembly-sample-datetime-input').length
            + $('.assembly-sample-location-input').length;

        // Calculate number of non empty metadata form elements
        var numberOfNonEmptyMetadataItems =
            // Filter out default value
            $('.assembly-sample-species-select').filter(function(){
                return $(this).val() !== '0';
            }).length
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
    };

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
    // Increment metadata progress bar
    $('.assembly-list-container').on('change change.dp', '.assembly-sample-datetime-input', function(){
        // Increment progress bar
        updateMetadataProgressBar();
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
            $('.assemblies-upload-ready-button').removeAttr('disabled');
        }
    });
    // Increment metadata progress bar
    $('.assembly-list-container').on('change', '.assembly-sample-location-input', function(){
        // Increment progress bar
        updateMetadataProgressBar();
        // Hide progress hint
        $('.adding-metadata-progress-container .progress-hint').fadeOut();
    });

    // When 'Next assembly' button is pressed
    $('.assembly-list-container').on('click', '.next-assembly-button', function(e){
        // Find assembly with empty or incomplete metadata
        //console.log($(this).closest('.assembly-list-container').find('.assembly-item input:text[value=""]'));

        // Get current assembly's id and split it
        //var currentAssemblyIdPartArray = $(this).closest('.assembly-item').attr('id').split('-');
        // Get id's number
        //var currentAssemblyIdCounter = currentAssemblyIdPartArray[currentAssemblyIdPartArray.length - 1];
        // Focus

        //console.log($('#assembly-item-' + (+currentAssemblyIdCounter + 1)).find('input:first'));

/*      // Focus on the next fist input of the next assembly metadata form
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
/*  $('.assembly-list-container').on('click', '.next-assembly-button', function(e){
        // Do something
    });*/

    /*
    var incrementProgressBar = function(stepWidth) {
        $('.uploading-progress-container .progress-bar').width(parseInt($('.uploading-progress-container .progress-bar').width() + stepWidth, 10) + '%');
        $('.uploading-progress-container .progress-percentage').text(parseInt($('.uploading-progress-container .progress-bar').width() + stepWidth, 10) + '%');
    };
    */

    var updateAssemblyUploadProgressBar = function() {
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
            endAssemblyUploadProgressBar();
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

    var endAssemblyUploadProgressBar = function() {
        // Update bar's width
        $('.uploading-assembly-progress-container .progress-bar').width('100%');
        // Update aria-valuenow attribute
        $('.uploading-assembly-progress-container .progress-bar').attr('aria-valuenow', 100);
        // Update percentage value
        $('.uploading-assembly-progress-container .progress-percentage').text('100%');

        $('.uploading-assembly-progress-container .progress').removeClass('active');       

        // Allow smooth visual transition of elements
        setTimeout(function(){
            $('.uploading-assembly-progress-container .progress-percentage').text('All done!');
            $('.uploading-assembly-progress-container .progress').slideUp(function(){
                // Allow smooth visual transition of elements
                setTimeout(function(){
                    $('.uploaded-assembly-url').slideDown(function(){
                        $('.uploading-assembly-progress-container .progress-label').slideUp();
                    });
                }, 500);
            });
        }, 500);

        // Show countdown timer

        // It takes less than 10 seconds to process one assembly
        var seconds = 10 * Object.keys(fastaFilesAndMetadata).length;
        var timer = setInterval(
            function() {
                $('.visit-url-seconds-number').text(seconds);
                seconds = seconds - 1;
                if (seconds === 0) {
                    // Hide processing assembly seconds countdown
                    $('.uploaded-assembly-process-countdown-label').fadeOut(function(){
                        // Update status
                        $('.uploaded-assembly-process-status').text('finished processing');
                    });
                    clearInterval(timer);
                }
            }, 1000);
    };

    $('.assemblies-upload-cancel-button').on('click', function() {
        // Close FASTA files upload panel
        $('.assembly-upload-panel').hide();
        // Remove stored dropped FASTA files
        fastaFilesAndMetadata = {};
        // Remove stored selected FASTA file
        selectedFastaFileName = '';
        // Remove HTML element
        $('.assembly-list-container ul').html('');
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

    var assemblyUploadDoneHandler = function(fastaFile) {
        return function(data, textStatus, jqXHR) {
            console.log('[WGST] Successfully sent FASTA file object to the server and received response message');
            // Create assembly URL
            var url = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/assembly/' + 'FP_COMP_' + JSON.parse(data).assemblyId;
            $('.uploaded-assembly-url-input').val(url);

            // Mark assembly as uploaded
            fastaFilesAndMetadata[fastaFile].uploaded = true;

            updateAssemblyUploadProgressBar();
        };
    };

    $('.assemblies-upload-ready-button').on('click', function() {
        $('.uploading-assembly-progress-container').fadeIn('slow', function(){
            $('.adding-metadata-progress-container').slideUp('normal', function(){
                // Add delay for smooth visual transition
                setTimeout(function(){
                    // Post each FASTA file separately
                    for (var fastaFile in fastaFilesAndMetadata) {
                        if (fastaFilesAndMetadata.hasOwnProperty(fastaFile)) {
                            $.ajax({
                                type: 'POST',
                                url: '/assembly/add/',
                                datatype: 'json', // http://stackoverflow.com/a/9155217
                                data: fastaFilesAndMetadata[fastaFile]
                            })
                            .done(assemblyUploadDoneHandler(fastaFile))
                            .fail(function(jqXHR, textStatus, errorThrown) {
                                console.log('[WGST] Failed to send FASTA file object to server or received error message');
                                console.error(textStatus);
                                console.error(errorThrown);
                                console.error(jqXHR);
                                //endProgressBar();
                                updateAssemblyUploadProgressBar();
                            });
                        } // if
                    } // for
                }, 300);
            });
        });
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
            // Only 1 selected file left - hide assembly navigator
            $('.assembly-navigator').hide();
        } else {
            // More than 1 selected files left - update assembly navigator
            updateRangeNavigationButtons($('.assembly-list-slider').slider('value')); 
        }

        updateSelectedFilesSummary();
        updateMetadataProgressBar();
    });

});