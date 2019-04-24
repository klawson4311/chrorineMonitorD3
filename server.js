const {
	Server: Server
} = require("ws"), moment = require("moment"), wss = new Server({
	port: 8080
});
console.log("Listening on port 8080"), wss.on("connection", function(e) {
	e.on("message", function(e) {
		console.log("received: %s", e)
	});
	const n = moment(),
		t = ukj(n);
	console.log("sending data", t);
	e.send(JSON.stringify(t));
	let o = moment();
	setInterval(function() {
		const n = pmt(o);
		o.add(5, "minutes"), e.send(JSON.stringify(n))
	}, 5e3)
}), ukj = (e => {
	let n = moment().subtract(24, "hours"),
		t = [];
	for (; n.isSameOrBefore(e);) {
		const e = pmt(n);
		t.push(e), n.add(5, "minutes")
	}
	return t
}), pmt = (e => {
	console.log(`Generating data for ${e}`);
	let n = 0;
	const t = {
		orgName: "Community Pool",
		orgID: 7,
		sensorName: "Chlorine Level",
		sensorID: 21,
		timestamp: e.toDate(), // convert from momentObj back to date.
		value: n = Math.random() <= .05 ? xqa() : xda()
	};
	return console.log(t), t
}), xda = (() => eki(1, 3)), xqa = (() => {
	return Math.random() <= .25 ? null : eki(0, 1e3)
}), eki = ((e, n) => Math.random() * (n - e) + e);
