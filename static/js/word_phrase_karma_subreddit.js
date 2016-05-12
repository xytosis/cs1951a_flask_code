function word_phrase_karma_subreddit (data) {

	

	rvalues = [];
	for (var i = 0; i < data.length; i++) {
		rvalues.push(data[i][1])
	}
	var max_value = Math.max.apply(Math, rvalues);
	var scale = $("#visualization").width()/10 - max_value;
	var svg = d3.select("#main_viz")
		.append("svg")
		.attr("width", $("#visualization").width())
		.attr("height", 1000);

	var color = d3.scale.linear()
	    .domain([-1, 5])
	    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
	    .interpolate(d3.interpolateHcl);

	svg.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", function(d, i) {
			return i * scale + max_value*10;
		})
		.attr("cy", function(d, i) {
			return i * 100 + max_value*10;
		})
		.attr("r", function(d) {
			return d[1] * 10;
		})
		.attr("fill", function(d, i) {
			return color(i);
		})
		.attr("class", "circ")
		.attr("name", function(d) {
			return d[0];
		});

	$( ".circ" ).mousemove(function(event) {
		var xcoord = event.pageX;
		var ycoord = event.pageY;
		var tool = $("#main_tooltip");
		var name = $(this).attr("name");
		tool.text(name + "\nAverage Karma: " + ($(this).attr("r")/10).toString().substring(0, 4));
		tool.css({top:ycoord - 100 , left:xcoord - 300}).show();
	});
	$(".circ").mouseout(function() {
		$("#main_tooltip").hide();
	});

}