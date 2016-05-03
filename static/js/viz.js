var margin = { top: 50, right: 0, bottom: 100, left: 30 },
      width = 2000 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom


	function get_value(single_json) {
		return single_json[Object.keys(single_json)[0]];
	}

	function get_key(single_json) {
		return Object.keys(single_json)[0];
	}



	$.getJSON("data/all.json", function(data) {

		function getRandomColor() {
		    var letters = '0123456789ABCDEF'.split('');
		    var color = '#';
		    for (var i = 0; i < 6; i++ ) {
		        color += letters[Math.floor(Math.random() * 16)];
		    }
		    return color;
		}

		var w = 1500,
		h = 1200;
		var canvas = d3.select("#viz")
		      .append("svg:svg")
		      .attr("width", w)
		      .attr("height", h);


		function draw_stuff(inputs) {
			var year = $("input[name=year]:checked").val();
			var dataset = data[year];
			console.log(dataset)

		    var data2 = {
		      name : "root",
		      children : dataset
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
		      	return "https://reddit.com/r/" + d.name;
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
		        	return d.name;
		        })
		        .attr("percent", function(d) {
		        	return d.percent;
		        })
		        .attr("class", "circ");
		}

		function get_inputs() {
			
			$("input").click(function() {
				$("svg").empty();
				draw_stuff();
				tooltip_function();
			});
		}


		function tooltip_function() {
			$( ".circ" ).mousemove(function(event) {
				var xcoord = event.pageX;
				var ycoord = event.pageY;
				var tool = $("#tooltip");
				var name = $(this).attr("name");
				var color = $(this).attr("fill");
				var percent = (+$(this).attr("percent") * 100) + "%";
				tool.text(name + "\npercent of reddit:" + percent.substring(0, 4));
				tool.css({top:ycoord + 1 , left:xcoord + 1}).show();
			});
			$(".circ").mouseout(function() {
				$("#tooltip").hide();
			});
		}

		draw_stuff();
		get_inputs();
		tooltip_function();


	});