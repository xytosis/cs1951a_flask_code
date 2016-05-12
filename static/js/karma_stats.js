function karma_stats (data) {
	console.log(data);

	var hist = data["hist"];
	var scale = ($("#visualization").width()-50)/(data["max"] - data["min"]);
	var norm = -1 * data["min"] + 25;

	var svg = d3.select("#main_viz")
		.append("svg")
		.attr("width", $("#visualization").width())
		.attr("height", data["max_height"] + 50);


	svg.selectAll("rect")
		.data(hist)
		.enter()
		.append("rect")
		.attr("x", function(d) {
			return (d[0] + norm) * scale;
		})
		.attr("y", 50)
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
			return (d[0] + norm) * scale;
		})
		.attr("y", 40)
		.text(function(d) {
			if (d[0] == 0 || d[0] == data["min"] || d[0] == data["max"]) {
				console.log(d[0])
				return d[0];
			}
			return "";
		})
		.attr("font-family", "sans-serif");


}