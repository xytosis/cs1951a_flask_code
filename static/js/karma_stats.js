function karma_stats (data) {

	var hist = data["hist"];
	//var gap = (data["max"] - data["min"])/100;
	//var hist = [[0, 10],[200, 20],[300, 30],[400, 40]];
	//var gap = 400;
	console.log(data)

	var svg = d3.select("#main_viz")
		.append("svg")
		.attr("width", data["max"] * 5 + 150 + (-5 * data["min"]))
		.attr("height", 1200);


	svg.selectAll("rect")
		.data(hist)
		.enter()
		.append("rect")
		.attr("x", function(d) {
			return d[0]*5 + 100 + (-5 * data["min"]);
		})
		.attr("y", 110)
		.attr("width", function(d) {
			return 3;
		})
		.attr("height", function(d) {
			return d[1]* 3;
		})
		.attr("fill", "rgba(150, 13, 13, 1)");


	svg.selectAll("text")
		.data(hist)
		.enter()
		.append("text")
		.attr("width", 90)
		.attr("height", 15)
		.attr("x", function(d) {
			return d[0]*5 + 100 + (-5 * data["min"]);
		})
		.attr("y", 100)
		.text(function(d) {
			if (d[0] == 0 || d[0] == data["min"] || d[0] == data["max"] || d[0] == data["a"] || d[0] == data["b"] || d[0] == data["c"] || d[0] == data["d"]) {
				console.log(d[0])
				return d[0];
			}
			return "";
		})
		.attr("font-family", "sans-serif");


}