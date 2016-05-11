function reading_level(data) {
	var margin = {top: 20, right: 20, bottom: 50, left: 65},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);


d3.select(".tooltip").remove();
var div = d3.select("body").append("div")	
	.attr("class", "tooltip")				
	.style("opacity", 0);

var xLabel = "subreddit";
var yLabel = "reading level";

var svg = d3.select("#main_viz").append("svg:svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

x.domain(data.map(function(d) { return d[0]; }));
y.domain([0, d3.max(data, function(d) { return d[1]; })]);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
  .append("text")
    .attr("x", width / 2)
    .attr("y",  40)
    .text(xLabel);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text(yLabel);

svg.selectAll(".bar")
    .data(data)
  .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d[1]); })
    .attr("height", function(d) { return height - y(d[1]); })
  .on("mousemove", function(d) {
	div.transition()
		.style("opacity", .8);
	div.html(xLabel + ": " + d[0] + "<br/>" + yLabel + ": " + d[1])
		.style("left", (d3.event.pageX) + "px")
		.style("top", (d3.event.pageY - 35) + "px");
	})
    .on("mouseout", function(d) {
	div.transition()
		.style("opacity", 0);
});
}