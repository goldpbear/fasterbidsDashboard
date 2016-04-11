/*
	Fasterbids analytics dashboard



 */


var FASTERBIDS = angular.module("fasterbids", []);

FASTERBIDS.controller("dashboardCtrl", function($scope) {

	// load data from local file
	// TODO: api will be called here
	d3.json("data/data.json", function(err, data) {
		if (err) { throw err; }
		$scope.data = data;
		
		$scope.metadata = data.metadata;
		$scope.$apply();

	});
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
			// dummy data
			data = [21, 32, 35, 64, 83],
			pie = d3.layout.pie(),
			arcData = pie(data),
			arc = d3.svg.arc().outerRadius(radius - padding),
			path = svg.selectAll("path")
					  .data(arcData)
					  .enter()
					  .append("path")
					  .attr("d", arc)
					  .attr("fill", function(d, i) { 
					    return color(i);
					  });

		scope.$watch("data", function(data) {
			//path.data(pie(data)).attr("d", arc);
			console.log("data updated!", data);
		}, true);

	};

	return {
		link: link,
		restrict: "E"
	}


});