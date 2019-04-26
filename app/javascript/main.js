var app = angular.module('pool', []);
const upper_limit_feasible = 200;
const lower_limit_feasible = 0;
const upper_limit_warn = 3.0;
const lower_limit_warn = 1.0;

/* Websocket interface for Angular */
app.factory('socket', [function() {
	var websocket_url = "ws://localhost:8080";
	var onmessageDefer;
	var socket = {
		ws: new WebSocket(websocket_url),
		onmessage: function(callback) {
			if (socket.ws.readyState == 1) {
				socket.ws.onmessage = callback;
			} else {
				onmessageDefer = callback;
			}
		}
	};
	socket.ws.onopen = function(event) {
		if (onmessageDefer) {
			socket.ws.onmessage = onmessageDefer;
			onmessageDefer = null;
		}
	};
	return socket;
}]);

/*  Get average of {num_prev_entries}-entries up to last_index. */
function getAverage(data, last_index, num_prev_entries){
	let filtered_data = [];
	let num_entries = 0;
	while (num_entries < num_prev_entries){
		let index = last_index - num_entries;
		if (index <= 0) break;
		let reading_feasible = readingFeasible(data[index].value);
		if (reading_feasible) {
			filtered_data.push(data[index].value)
			num_entries++;
		}else last_index--;
	}
	if (filtered_data.length == 0) return 0;
	return filtered_data.reduce((x, y)=> x+y, 0) / filtered_data.length;
}


/*
	Reading not feasible if value is null, or outside upper/lower limits.
*/
function readingFeasible(result){
	return  !(result == null || result > upper_limit_feasible || result < lower_limit_feasible);
}



app.controller('poolCtrl', ['$scope', 'socket', function($scope, socket) {
	$scope.first_message_received = false;
	$scope.data = [];
	$scope.x, $scope.y;
	$scope.line;


	$scope.initGraph = function(data){
		$scope.data = data;
		$scope.first_message_received = true;

		let graph_width = document.getElementById("content").offsetWidth;
		$scope.graph_height = 400;
		$scope.graph_width = Math.max(graph_width * 0.8, 300);

		let graph = d3.select("#graph").append("svg:svg").attr("width", $scope.graph_width).attr("height", $scope.graph_height);
		// Scale values (domain) to graph height (range)
		let firstTimeStamp = new Date(data[0]["timestamp"]);

		let gutter = 40; // leave gap for axes + labels.
		$scope.x = d3.scaleTime().domain([firstTimeStamp, new Date()]).range([gutter, $scope.graph_width ]);
		let xaxis = graph.append('g')
			.attr('class', 'axis')
			.attr('transform', `translate(0, ${$scope.graph_height - gutter})`)
			.call(d3.axisBottom($scope.x));
		// xaxis.ticks(d3.timeMinute.every(15));
			// .ticks(d3.timeMinute.every(60))

		// y-axis
		$scope.y = d3.scaleLinear().domain([6, -1]).range([0, $scope.graph_height-gutter]);
		graph.append('g')
			.attr('class', 'axis')
			.attr('transform', `translate(${gutter})`)
			.call(d3.axisLeft($scope.y));

		$scope.line = d3.line()
			.x((d)=> $scope.x(new Date(d.timestamp)))
			.y((d, i) => {
				if (!readingFeasible(d.value)){ // if result is not feasible, take the avg of the last 3 readings.
					let average = getAverage(data, i-1, 3);
					return $scope.y(average);
				}else return $scope.y(d.value)
			}).curve(d3.curveBasis);


		graph.append("svg:path").attr("id", "line").attr("d", $scope.line(data));

	}





	$scope.appendData = function(new_entry){

		let latest_timestamp = new Date(new_entry.timestamp);
		new_entry.timestamp = latest_timestamp;
		// if (new_entry.value > upper_limit_warn){
		// 	alert("Chlorine level has exceeded the recommended range");
		// }else if (new_entry.value < lower_limit_warn){
		// 	alert("Chlorine is lower than the recommended minimum");
		// }

		// remove oldest, push latest
		$scope.data.shift();
		$scope.data.push(new_entry);

		// set new path using updated data.
		d3.select("#line").attr('d', $scope.line($scope.data));
		// COMBAK look into why the transition didn't work later.
			// .attr('transform', 'translate(40)')
			// .transition()
			// .ease(d3.easeLinear)
			// .duration(1000)
			// .attr('transform', 'translate(' + (40+$scope.x(new Date($scope.data[1].timestamp))*-1)+')');

		// Shift domain
		$scope.x.domain([new Date($scope.data[0].timestamp), latest_timestamp]);
	}

	socket.onmessage(function(event) {
		let data = JSON.parse(event.data);
		if ($scope.first_message_received == false){
			$scope.initGraph(data);
		}else{
			$scope.appendData(data);
		}
	});

}]);
