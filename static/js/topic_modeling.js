function topic_modeling(data) {

    var topics = [];
    for (var i = 0; i < data.length; i++) {
        topic = data[i];
        words = "";
        for (var j = 0; j < topic.length; j++) {
            words += (topic[j] + ", ");
        }
        words = words.substring(0, words.length - 2);
        console.log(words)
        topics.push({topic: "Topic " + (i + 1), words: words})
    }

    // column definitions
    var columns = [
        { head: 'Topic', cl: 'title', html: ƒ('topic') },
        { head: 'Words', cl: 'center', html: ƒ('words') },
    ];

    // create table
    d3.select(".topictable").remove();
    var table = d3.select("#main_viz")
        .append('table')
        .attr("class", "topictable");

    // create table header
    table.append('thead').append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .attr('class', ƒ('cl'))
        .text(ƒ('head'));

    // create table body
    table.append('tbody')
        .selectAll('tr')
        .data(topics).enter()
        .append('tr')
        .selectAll('td')
        .data(function(row, i) {
            return columns.map(function(c) {
                // compute cell values for this specific row
                var cell = {};
                d3.keys(c).forEach(function(k) {
                    cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
                });
                return cell;
            });
        }).enter()
        .append('td')
        .html(ƒ('html'))
        .attr('class', ƒ('cl'));

    function length() {
        var fmt = d3.format('02d');
        return function(l) { return Math.floor(l / 60) + ':' + fmt(l % 60) + ''; };
    }
}