/*
	Fasterbids analytics dashboard



 */


var FASTERBIDS = angular.module("fasterbids", []);

FASTERBIDS.controller("dashboardCtrl", function($scope) {
	d3.json("data/data.json", function(err, data) {
		if (err) {
			throw err;
		}
		$scope.data = data;
		$scope.$apply();

	});
});


FASTERBIDS.directive("pieChart", function() {
	function link(scope, el, attr) {
		el.css("height", (height + padding) + "px");
		el.css("width", (width + padding) + "px");

		var width = 300,
			height = 300,
			padding = 50,
			radius = Math.min(width, height) / 2,
			color = d3.scale.category20b(),
			svg = d3.select(el[0])
					.append('svg')
					.attr('width', width)
					.attr('height', height)
					.append('g')
					.attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')'),
			// dummy data
			data = [21, 32, 35, 64, 83],
			//data = [],
			//data = $scope.data["sampleData1"],
			pie = d3.layout.pie(),
			arcData = pie(data),
			arc = d3.svg.arc().outerRadius(radius),
			path = svg.selectAll("path")
					  .data(arcData)
					  .enter()
					  .append("path")
					  .attr("d", arc)
					  .attr('fill', function(d, i) { 
					    return color(d);
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