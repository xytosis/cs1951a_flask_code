
function freq_to_time(data) {

	var yvalues = []
	var xvalues = []
	for (var i = 0; i < data.length; i++) {
		yvalues.push(data[i][1]);
		xvalues.push(data[i][1]/data[i][2]);
	}
	var scale = Math.max.apply(Math, yvalues);
	var temp = Math.max.apply(Math, xvalues)
	var scale = scale/1500;
	var factor = temp * scale * 70 - 100

	var svg = d3.select("#main_viz")
		.append("svg")
		.attr("width", factor + Math.max.apply(Math, yvalues)/scale + 350)
		.attr("height", data.length * 20 + 30);

	svg.selectAll("rect")
		.data(data)
		.enter()
		.append("rect")
		.attr("x", 250 + factor)
		.attr("y", function(d, i) {
			return 20 * i + 20;
		})
		.attr("width", function(d) {
			return d[1]/scale + 2;
		})
		.attr("height", 15)
		.attr("fill", "rgba(150, 13, 13, 1)");

	svg.selectAll("rect2")
		.data(data)
		.enter()
		.append("rect")
		.attr("x", function(d) {
			return 240 - d[1] * scale *70/d[2] + 2 + factor;
		})
		.attr("y", function(d, i) {
			return 20 * i + 20;
		})
		.attr("width", function(d) {
			return d[1] * scale *70/d[2] + 2;
		})
		.attr("height", 15)
		.attr("fill", "blue");


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

	svg.selectAll("text2")
		.data(data)
		.enter()
		.append("text")
		.attr("width", 90)
		.attr("height", 15)
		.attr("x", function(d) {
			return 240 - d[1] * scale *70/d[2] - 45 + factor;
		})
		.attr("y", function(d, i) {
			return 20 * i + 33;
		})
		.text(function(d) {
			return (d[1] * 100/d[2]).toString().substring(1, 5) + "%";
		})
		.attr("font-family", "sans-serif")
		.attr("fill", "blue");

	svg.selectAll("text3")
		.data(data)
		.enter()
		.append("text")
		.attr("width", 90)
		.attr("height", 15)
		.attr("x", function(d) {
			return d[1]/scale + 260 + factor;
		})
		.attr("y", function(d, i) {
			return 20 * i + 33;
		})
		.text(function(d) {
			return d[1]
		})
		.attr("fill", "rgba(150, 13, 13, 1)")
		.attr("font-family", "sans-serif");
}