function topic_modeling(data, query) {

    var topics = [];
    for (var i = 0; i < data.length; i++) {
        topic = data[i];
        words = "";
        for (var j = 0; j < topic.length; j++) {
            words += (topic[j] + ", ");
            console.log(data[i][j])
        }
        words = words.substring(0, words.length - 2);
        topics.push({topic: "Topic " + (i + 1), words: words})
    }

    var spaceCircles = [1, 2, 3, 4, 5, 6];
    var distance = 300;
    var center = 500;
    var radius = 120;

    var svgContainer = d3.select("#main_viz").append("svg")
                                        .attr("width", 1000)
                                        .attr("height", 1000);

    var circles = svgContainer.selectAll("circle")
                              .data(spaceCircles)
                              .enter()
                              .append("circle");

    var circleAttributes = circles
                           .attr("cx", function (d) { 
                              var x_coordinate;
                              if (d === 1) { x_coordinate = center;
                              } else if (d === 2) { x_coordinate = center;
                              } else if (d === 3) { x_coordinate = center-distance*Math.cos(0.244);
                              } else if (d === 4) { x_coordinate = center+distance*Math.cos(0.244);
                              } else if (d === 5) { x_coordinate = center-distance*Math.cos(1.0821);
                              } else if (d === 6) { x_coordinate = center+distance*Math.cos(1.0821);
                              }
                              return x_coordinate;
                            })
                           .attr("cy", function (d) { 
                              var y_coordinate;
                              if (d === 1) { y_coordinate = center;
                              } else if (d === 2) { y_coordinate = center+distance;
                              } else if (d === 3) { y_coordinate = center+distance*Math.sin(0.244);
                              } else if (d === 4) { y_coordinate = center+distance*Math.sin(0.244);
                              } else if (d === 5) { y_coordinate = center-distance*Math.sin(1.0821);
                              } else if (d === 6) { y_coordinate = center-distance*Math.sin(1.0821);
                              }
                              return y_coordinate;
                            })
                           .attr("r", radius )
                           .style("fill", function(d) {
                             var returnColor;
                             if (d === 1) { returnColor = "#ff5700";
                             } else if (d === 2) { returnColor = "#ff8b60";
                             } else if (d === 3) { returnColor = "#c6c6c6"; 
                             } else if (d === 4) { returnColor = "#9494ff"; 
                             } else if (d === 5) { returnColor = "#eff7ff"; 
                             } else if (d === 6) { returnColor = "#cee3f8"; 
                             }
                             return returnColor;
                           });

    //Circle Data Set
    var circleData = [
      { "iftopic": "yes", "topicnumber": 1, "topic": query },
      { "iftopic": "yes", "topicnumber": 2, "topic": "Topic 1" },
      { "iftopic": "no", "topicnumber": 2, "topic": data[0][0] },
      { "iftopic": "no", "topicnumber": 2, "topic": data[0][1] },
      { "iftopic": "no", "topicnumber": 2, "topic": data[0][2] },
      { "iftopic": "no", "topicnumber": 2, "topic": data[0][3] },
      { "iftopic": "no", "topicnumber": 2, "topic": data[0][4] },
      { "iftopic": "yes", "topicnumber": 3, "topic": "Topic 2" },
      { "iftopic": "no", "topicnumber": 3, "topic": data[1][0] },
      { "iftopic": "no", "topicnumber": 3, "topic": data[1][1] },
      { "iftopic": "no", "topicnumber": 3, "topic": data[1][2] },
      { "iftopic": "no", "topicnumber": 3, "topic": data[1][3] },
      { "iftopic": "no", "topicnumber": 3, "topic": data[1][4] },
      { "iftopic": "yes", "topicnumber": 4, "topic": "Topic 3" },
      { "iftopic": "no", "topicnumber": 4, "topic": data[2][0] },
      { "iftopic": "no", "topicnumber": 4, "topic": data[2][1] },
      { "iftopic": "no", "topicnumber": 4, "topic": data[2][2] },
      { "iftopic": "no", "topicnumber": 4, "topic": data[2][3] },
      { "iftopic": "no", "topicnumber": 4, "topic": data[2][4] },
      { "iftopic": "yes", "topicnumber": 5, "topic": "Topic 4" },
      { "iftopic": "no", "topicnumber": 5, "topic": data[3][0] },
      { "iftopic": "no", "topicnumber": 5, "topic": data[3][1] },
      { "iftopic": "no", "topicnumber": 5, "topic": data[3][2] },
      { "iftopic": "no", "topicnumber": 5, "topic": data[3][3] },
      { "iftopic": "no", "topicnumber": 5, "topic": data[3][4] },
      { "iftopic": "yes", "topicnumber": 6, "topic": "Topic 5" },
      { "iftopic": "no", "topicnumber": 6, "topic": data[4][0] },
      { "iftopic": "no", "topicnumber": 6, "topic": data[4][1] },
      { "iftopic": "no", "topicnumber": 6, "topic": data[4][2] },
      { "iftopic": "no", "topicnumber": 6, "topic": data[4][3] },
      { "iftopic": "no", "topicnumber": 6, "topic": data[4][4] },];

    //Add the SVG Text Element to the svgContainer
    var text = svgContainer.selectAll("text")
                            .data(circleData)
                            .enter()
                            .append("text");

    //Add SVG Text Element Attributes
    var x_offset = 50;
    var y_offset = 80;
    var y_words_offset = 20;
    var two_counter = 1
    var three_counter = 1
    var four_counter = 1
    var five_counter = 1
    var six_counter = 1
    var textLabels = text
                     .attr("x", function(d) { 
                              var x_coordinate;
                              console.log(d.topicnumber)
                              if (d.topicnumber === 1) { x_coordinate = center-x_offset-25;
                              } else if (d.topicnumber === 2) { x_coordinate = center-x_offset;
                              } else if (d.topicnumber === 3) { x_coordinate = center-distance*Math.cos(0.244)-x_offset;
                              } else if (d.topicnumber === 4) { x_coordinate = center+distance*Math.cos(0.244)-x_offset;
                              } else if (d.topicnumber === 5) { x_coordinate = center-distance*Math.cos(1.0821)-x_offset;
                              } else if (d.topicnumber === 6) { x_coordinate = center+distance*Math.cos(1.0821)-x_offset;
                              }
                              return x_coordinate;
                            })
                     .attr("y", function(d) { 
                              var y_coordinate;
                              if (d.topicnumber === 1) { y_coordinate = center;
                              } else if (d.topicnumber === 2) {
                                if (d.iftopic === "yes") {
                                  y_coordinate = center+distance-y_offset;
                                }
                                else if (d.iftopic === "no") {
                                   y_coordinate = center+distance-y_offset+two_counter*20;
                                  two_counter += 1
                                }
                              } else if (d.topicnumber === 3) { 
                                if (d.iftopic === "yes") {
                                  y_coordinate = center+distance*Math.sin(0.244)-y_offset;
                                }
                                else if (d.iftopic === "no") {
                                   y_coordinate = center+distance*Math.sin(0.244)-y_offset+three_counter*20;
                                  three_counter += 1
                                }
                              } else if (d.topicnumber === 4) { 
                                if (d.iftopic === "yes") {
                                  y_coordinate = center+distance*Math.sin(0.244)-y_offset;
                                }
                                else if (d.iftopic === "no") {
                                   y_coordinate = center+distance*Math.sin(0.244)-y_offset+four_counter*20;
                                  four_counter += 1
                                }
                              } else if (d.topicnumber === 5) { 
                                if (d.iftopic === "yes") {
                                  y_coordinate = center-distance*Math.sin(1.0821)-y_offset;
                                }
                                else if (d.iftopic === "no") {
                                   y_coordinate = center-distance*Math.sin(1.0821)-y_offset+five_counter*20;
                                  five_counter += 1
                                }
                              } else if (d.topicnumber === 6) { 
                                if (d.iftopic === "yes") {
                                  y_coordinate = center-distance*Math.sin(1.0821)-y_offset;
                                }
                                else if (d.iftopic === "no") {
                                  y_coordinate = center-distance*Math.sin(1.0821)-y_offset+six_counter*20;
                                  six_counter += 1
                                }
                              }
                              return y_coordinate;
                            })
                     .text( function (d) { return d.topic })
                     .attr("font-family", "sans-serif")
                     .attr("font-size", "20px")
                     .attr("fill", "black");

    function length() {
        var fmt = d3.format('02d');
        return function(l) { return Math.floor(l / 60) + ':' + fmt(l % 60) + ''; };
    }
}
