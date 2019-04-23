var app = angular.module('pool', []);


app.factory('socket', [function() {
	var websocket_url = "ws://localhost:8080";
	var stack = [];
	var onmessageDefer;
	var socket = {
		ws: new WebSocket(websocket_url),
		send: function(data) {
			data = JSON.stringify(data);
			if (socket.ws.readyState == 1) {
				socket.ws.send(data);
			} else {
				stack.push(data);
			}
		},
		onmessage: function(callback) {
			console.log("update message");
			if (socket.ws.readyState == 1) {
				socket.ws.onmessage = callback;
			} else {
				onmessageDefer = callback;
			}
		}
	};
	socket.ws.onopen = function(event) {
		for (i in stack) {
			socket.ws.send(stack[i]);
		}
		console.log("first message");
		stack = [];
		if (onmessageDefer) {
			socket.ws.onmessage = onmessageDefer;
			onmessageDefer = null;
		}
	};
	return socket;
}]);


app.controller('poolCtrl', ['$scope', 'socket', function($scope, socket) {
	socket.onmessage(function(event) {
		console.log("message received", event.data);
		//var data = JSON.parse(event.data);
		//$scope.testVar =
	});
}]);
