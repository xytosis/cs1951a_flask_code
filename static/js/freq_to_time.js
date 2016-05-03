
function freq_to_time(data) {

	var svg = d3.select("#main_viz")
		.append("svg")
		.attr("width", 1500)
		.attr("height", data.length * 20 + 30);

	svg.selectAll("rect")
		.data(data)
		.enter()
		.append("rect")
		.attr("x", 130)
		.attr("y", function(d, i) {
			return 20 * i + 20;
		})
		.attr("width", function(d) {
			console.log(d[1])
			return d[1]/30 + 2;
		})
		.attr("height", 15)
		.attr("fill", "rgba(150, 13, 13, 1)");


	svg.selectAll("text")
		.data(data)
		.enter()
		.append("text")
		.attr("width", 90)
		.attr("height", 15)
		.attr("x", 10)
		.attr("y", function(d, i) {
			return 20 * i + 33;
		})
		.text(function(d) {
			return d[0].substring(0, 7)
		})
		.attr("font-family", "sans-serif");

	svg.selectAll("text3")
		.data(data)
		.enter()
		.append("text")
		.attr("width", 90)
		.attr("height", 15)
		.attr("x", function(d) {
			return d[1]/30 + 80;
		})
		.attr("y", function(d, i) {
			return 20 * i + 33;
		})
		.text(function(d) {
			return d[1]
		})
		.attr("fill", "white")
		.attr("font-family", "sans-serif");
}