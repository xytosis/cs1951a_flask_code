function karma_predict(data) {
	
	var svg = d3.select("#main_viz")
		.append("svg")
		.attr("width", 1000)
		.attr("height", 1000);

	svg.selectAll("text")
		.data([data])
		.enter()
		.append("text")
		.attr("width", 90)
		.attr("height", 15)
		.attr("x", 100)
		.attr("y", 100)
		.text(function(d) {
			return "predicted score: " + d;
		})
		.attr("font-family", "sans-serif");
}