/*
	Fasterbids analytics dashboard
	Last updated: 4/11/2016

 */


var FASTERBIDS = angular.module("fasterbids", []);

FASTERBIDS.controller("dashboardCtrl", function($scope) {

	// keep track of data filters set from input elements
	$scope.selectedFilters = [];

	// load data from local file
	// TODO: api will be called here
	d3.json("data/data.json", function(err, data) {
		if (err) { throw err; }
		$scope.data = data.data;
		$scope.metadata = data.metadata;

		// initialize the data filters to match the first element for each filter category
		$scope.metadata.forEach(function(metadata, index){
			$scope.selectedFilters.push(
				{
					"name": metadata.name,
					"value": metadata.items[0]
				}
			);
		});

		$scope.updateData();
		$scope.$apply();
	});

	// update the data filters with user's selections
	$scope.onInputChange = function(value, name, index) {
		$scope.selectedFilters[index].name = name;
		$scope.selectedFilters[index].value = value;
		$scope.updateData();
	}

	// filter the local json file with user's current selections
	$scope.updateData = function() {
		$scope.totalSales = 0;
		$scope.filteredData = $scope.data;
		$scope.selectedFilters.forEach(function(filter) {
			$scope.filteredData = $scope.filteredData.filter(function(item, n) {
				return item[filter.name] == filter.value;
			});
		});
	}
});


FASTERBIDS.directive("pieChart", function() {
	function link(scope, el, attr) {
		el.addClass("chart");

		// set up the svg canvas
		var width = 375,
			height = 375,
			radius = Math.min(width, height) / 2,
			color = d3.scale.category20(),
			svg = d3.select(el[0])
				.append('svg')
				.attr('width', width)
				.attr('height', height)
				.append('g')
				.attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')'),
			data = [],
			pie = d3.layout.pie()
				.value(function(d) { return d.sales }),
			arcData = pie(data),
			arc = d3.svg.arc()
				.outerRadius(radius)
				.innerRadius(0),
			arcs = svg.selectAll("path");

		// update the pie chart when the data changes
		scope.$watch("filteredData", function(filteredData) {
			var filteredData = filteredData || [];

			// remove old elements so they don't pile up
			svg.selectAll("g").remove();

			// calculate new arc segments
			arcs.data(pie(filteredData))
				.enter()
				.append("g")
				.append("path")
		    .attr("fill", function(d, i) {
		    	return color(i);
		    })
		    .attr("d", arc);

			// add labels
			svg.selectAll("g")
		    .append("text")
		    .attr("transform", function(d) {
		    	return "translate(" + arc.centroid(d) + ") rotate(" + angle(d) + ")";
		    })
		    .attr("text-anchor", "middle")
		    .text(function(d) {
		    	if (d.data.sales > 0) { 
		    		scope.totalSales += (d.data.price * d.data.sales);
		    		return d.data.region + ": $" + (d.data.price * d.data.sales); 
		    	}
		    });

			// convert from radians to degrees
			function angle(d) {
	      var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
	      return a > 90 ? a - 180 : a;
	    }
		}, true);
	};

	return {
		link: link,
		restrict: "E"
	}
});

FASTERBIDS.directive("barChart", function() {
	function link(scope, el, attr) {
		el.addClass("chart");

		// set up the svg canvas
		var width = 400,
			height = 400,
			barWidth = 50,
			barPadding = 5,
			leftGutter = 75,
			color = d3.scale.category20(),
			svg = d3.select(el[0])
				.append('svg')
				.attr('width', width)
				.attr('height', height),
			yScale = d3.scale.linear()
				// arbitrary domain
				.domain([0, 25000])
				.range([height, 0]),
			yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("left")
				.ticks(10)
				.tickFormat(function(d) { return "$" + format(d); }),
			format = d3.format(",");

		scope.$watch("filteredData", function(filteredData) {
			var filteredData = filteredData || [];
			//svg.selectAll("g.bar").remove();

			svg.selectAll("g.bar")
				.data(filteredData)
				.enter()
				.append("g")
				.attr("class", "bar")
				.append("rect");

			svg.selectAll("g.bar").select("rect")
				.attr("width", barWidth)
				.attr("height", function(d) { return (d.sales * d.price); })
				.transition()
				.duration(500)
				.style("fill", function(d, i) { return color(i); })
				.attr("x", function(d, i) { return (i * barWidth) + (i * barPadding) + leftGutter; })
				.attr("y", function(d) { return yScale(d.sales * d.price); });

			// only create text nodes on the first draw of the chart
			if (svg.selectAll("g.bar").select("text").empty()) {
				console.log("creating text nodes");
				svg.selectAll("g.bar")
					.append("text")
					.text(function(d) { return d.region });
			}

			svg.selectAll("g.bar").select("text")
				.transition()
				.duration(500)
				.attr("transform", function(d, i) {
		    	return "translate(" + ((i * barWidth + 30) + (i * barPadding) + leftGutter) + "," + (yScale(d.sales * d.price) - 10) + ") rotate(270)";
		    })
		    
			svg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(" + (leftGutter - barPadding) + ",0)")
				.call(yAxis);

		}, true);
	};

	return {
		link: link,
		restrict: "E"
	}

});