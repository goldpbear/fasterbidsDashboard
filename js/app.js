/*
	Fasterbids analytics dashboard



 */


var FASTERBIDS = angular.module("fasterbids", []);

FASTERBIDS.controller("dashboardCtrl", function($scope) {

	// load data from local file
	// TODO: api will be called here
	d3.json("data/data.json", function(err, data) {
		if (err) { throw err; }
		$scope.data = data.data;
		$scope.metadata = data.metadata;

		$scope.selectedFilters = [];
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

	$scope.onInputChange = function(value, name, index) {
		$scope.selectedFilters[index].name = name;
		$scope.selectedFilters[index].value = value;
		$scope.updateData();
	}

	$scope.updateData = function() {
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
		var width = 500,
			height = 500,
			padding = 75,
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
					.outerRadius(radius - padding)
					.innerRadius(0),
			arcs = svg.selectAll("g.arc");
			//path = svg.selectAll("path");

		// update the pie chart when the data changes
		scope.$watch("filteredData", function(filteredData) {
			filteredData = filteredData || [];
			arcs.data(pie(filteredData))
				.enter()
				.append("g")
				.append("path")
			    .attr("fill", function(d, i) {
			    	return color(i);
			    })
			    .attr("d", arc);

			svg.selectAll("g")
			    .append("text")
			    .attr("transform", function(d) {
			    	return "translate(" + arc.centroid(d) + ")";
			    })
			    .attr("text-anchor", "middle")
			    .text(function(d) {
			    	console.log(d.data.region);
			    	return d.data.region;
			    });
		}, true);
	};

	return {
		link: link,
		restrict: "E"
	}
});