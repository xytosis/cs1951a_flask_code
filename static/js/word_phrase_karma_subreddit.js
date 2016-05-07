function word_phrase_karma_subreddit (data) {

	console.log(data);
	
	var svg = d3.select("#main_viz")
		.append("svg")
		.attr("width", 2000)
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
			return i * 120 + 400;
		})
		.attr("cy", 400)
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
		tool.css({top:ycoord + 1 , left:xcoord + 1}).show();
	});
	$(".circ").mouseout(function() {
		$("#main_tooltip").hide();
	});

}