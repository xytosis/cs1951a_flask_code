
function freq_by_subreddit(data) {


	var margin = { top: 50, right: 0, bottom: 100, left: 30 },
      width = 1000 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom


	function get_value(single_json) {
		return single_json[Object.keys(single_json)[0]];
	}

	function get_key(single_json) {
		return Object.keys(single_json)[0];
	}


	function getRandomColor() {
	    var letters = '0123456789ABCDEF'.split('');
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 16)];
	    }
	    return color;
	}

	var w = 1000,
	h = 1000;
	var canvas = d3.select("#main_viz")
	      .append("svg:svg")
	      .attr("width", w)
	      .attr("height", h);


	function draw_stuff() {

		newdata = []

		for (var i = 0; i < data.length; i++) {
			newdata.push({"name":data[i][0], "size":data[i][1]})
		}

	    var data2 = {
	      name : "root",
	      children : newdata
	    }
	    
	    var nodes = d3.layout.pack()
	      .value(function(d) { return d.size; })
	      .size([w, h])
	      .nodes(data2);
	    
	    // Get rid of root node
	    nodes.shift();
	    var newcan = canvas.selectAll("circles")
	        .data(nodes)
	      .enter().append("a")
	      .attr("xlink:href", function(d) {
	      	return "https://reddit.com/r/" + d["name"];
	      })
	      .attr("target", "_blank");

	    newcan.append("svg:circle")
	        .attr("cx", function(d) { return d.x; })
	        .attr("cy", function(d) { return d.y; })
	        .attr("r", function(d) { return d.r; })
	        .attr("fill", function() {
	        	return getRandomColor();
	        })
	        .attr("name", function(d) {
	        	return d["name"];
	        })
	        .attr("percent", function(d) {
	        	return d["size"]/10000;
	        })
	        .attr("class", "circ");
	}


	function tooltip_function() {
		$( ".circ" ).mousemove(function(event) {
			var xcoord = event.pageX;
			var ycoord = event.pageY;
			var tool = $("#main_tooltip");
			var name = $(this).attr("name");
			var color = $(this).attr("fill");
			var percent = (+$(this).attr("percent") * 100) + "%";
			tool.text(name + "\npercent of word/phrase:" + percent.substring(0, 4));
			tool.css({top:ycoord - 100 , left:xcoord - 440}).show();
		});
		$(".circ").mouseout(function() {
			$("#main_tooltip").hide();
		});
	}

	draw_stuff();
	tooltip_function();
	
}