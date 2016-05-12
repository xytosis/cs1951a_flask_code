function linechart(data, time_month, time_year, xaxis, yaxis){
if (time_month){
  for (var i = 0, len = data.length; i < len; i++) {
    data[i][0] = d3.time.format("%Y-%m-%d").parse(data[i][0]);
  }  
}
if (time_year){
  for (var i = 0, len = data.length; i < len; i++) {
    data[i][0] = d3.time.format("%Y").parse(data[i][0]);
  }
}

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x 

if (time_month || time_year) {
  x = d3.time.scale()
    .range([0, width]);
}

else {
  x = d3.scale.linear()
  .range([0, width]);
}

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d[0]); })
    .y(function(d) { return y(d[1]); })
    .interpolate("basis");

var svg = d3.select("#main_viz").append("svg:svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

x.domain(d3.extent(data, function(d) { 
  return d[0]; }));
y.domain(d3.extent(data, function(d) { return d[1]; }));

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)
  .append("text")
    .attr("x", width / 2)
    .attr("y",  100)
  .text(xaxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text(yaxis);

svg.append("path")
  .datum(data)
  .attr("class", "line")
  .attr("d", line);

d3.select(".focus").remove();
var focus = svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

focus.append("circle")
    .attr("r", 4.5);

focus.append("text")
    .attr("x", 9)
    .attr("dy", ".35em");

bisectDate = d3.bisector(function(d) { return d[0]; }).left,

d3.select(".overlay").remove();
svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", function() { focus.style("display", null); })
    .on("mouseout", function() { focus.style("display", "none"); })
    .on("mousemove", function() {
  var x0 = x.invert(d3.mouse(this)[0]),
      i = bisectDate(data, x0, 1),
      d0 = data[i - 1],
      d1 = data[i],
      d = x0 - d0[1] > d1[1] - x0 ? d1 : d0;
  focus.attr("transform", "translate(" + x(d[0]) + "," + y(d[1]) + ")");
  focus.select("text").text(parseFloat(Math.round(d[1] * 100) / 100).toFixed(2));
});
}