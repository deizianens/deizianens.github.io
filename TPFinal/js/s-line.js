var countries = new Array();
const numYears = 27;
const MAX_COUNTRIES = 196;

var margin = {
    top: 20,
    right: 80,
    bottom: 30,
    left: 50
},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var x = d3.scaleTime()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

var xAxis = d3.axisBottom()
    .scale(x)
    .tickFormat(d3.format("d"));

var yAxis = d3.axisLeft()
    .scale(y)

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function (d) {
        return x(d.date);
    })
    .y(function (d) {
        return y(d.rate);
    });

var svg = d3.select("#s-line").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3_queue
    .queue()
    .defer(
        d3.csv,
        "./data/suicide-death-rates-wid.csv",
    )
    .await(ready_line);

function ready_line(error, d) {
    if (error) throw error;
    // var data = d3.tsvParse(myData);
    var data = new Array();
    var yearsArray = new Array();
    var values = new Array();
    var numCountries = 6;

    //order array by year (increasing order)
    d.sort(function (a, b) {
        return a.Year - b.Year;
    })
    
    for(var i = 1990; i<2017; i++){
        yearsArray.push(i);
    } 


    for(var i = 0; i<numCountries; i++){
        countries.push(d[i].Entity);
    } 

    for(var i = 0; i<numYears; i++){
        data.push(d.slice((i*MAX_COUNTRIES), (i*MAX_COUNTRIES)+numCountries));
    }

    for(var j = 0; j<numCountries; j++){
        for(var i = 0; i<numYears; i++){
            values.push(data[i][j].Deaths);
        }
    }

    color.domain(countries);

    var j = -1;
    var cities = color.domain().map(function (name) {
        return {
            name: name,
            values: yearsArray.map(function (d, i) {
                j++;
                return {
                    date: d,
                    rate: parseFloat(values[j])
                };
            })
        };
    });

    // console.log(cities);

    x.domain(d3.extent(yearsArray));

    y.domain([
        d3.min(cities, function (c) {
            return d3.min(c.values, function (v) {
                return v.rate;
            });
        }),
        d3.max(cities, function (c) {
            return d3.max(c.values, function (v) {
                return v.rate;
            });
        })
    ]);

    var legend = svg.selectAll('g')
        .data(cities)
        .enter()
        .append('g')
        .attr('class', 'legend');

    legend.append('rect')
        .attr('x', width - 20)
        .attr('y', function (d, i) {
            return i * 20;
        })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function (d) {
            return color(d.name);
        });

    legend.append('text')
        .attr('x', width - 8)
        .attr('y', function (d, i) {
            return (i * 20) + 9;
        })
        .text(function (d) {
            return d.name;
        })
        .style("fill", "#C6E0D9");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("fill", "#C6E0D9")
        .text("Taxa de suicídio");


    var city = svg.selectAll(".city")
        .data(cities)
        .enter().append("g")
        .attr("class", "city");

    city.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) {
            return color(d.name);
        });

    city.append("text")
        .datum(function (d) {
            return {
                name: d.name,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("transform", function (d) {
            return "translate(" + x(d.value.date) + "," + y(d.value.rate) + ")";
        })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function (d) {
            return d.name;
        });

    var mouseG = svg.append("g")
        .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line")
        .style("stroke", "#C6E0D9")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(cities)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
        .attr("r", 7)
        .style("stroke", function (d) {
            return color(d.name);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    mousePerLine.append("text")
        .attr("transform", "translate(10,3)")
        .style("fill", "#C6E0D9");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('width', width) // can't catch mouse events on a g element
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function () { // on mouse out hide line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");
        })
        .on('mouseover', function () { // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "1");
        })
        .on('mousemove', function () { // mouse moving over canvas
            var mouse = d3.mouse(this);
            d3.select(".mouse-line")
                .attr("d", function () {
                    var d = "M" + mouse[0] + "," + height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                });

            d3.selectAll(".mouse-per-line")
                .attr("transform", function (d, i) {
                   
                    var xDate = x.invert(mouse[0]),
                        bisect = d3.bisector(function (d) { return d.date; }).right;
                    idx = bisect(d.values, xDate);

                    var beginning = 0,
                        end = lines[i].getTotalLength(),
                        target = null;

                    while (true) {
                        target = Math.floor((beginning + end) / 2);
                        pos = lines[i].getPointAtLength(target);
                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0]) end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                    }

                    d3.select(this).select('text')
                        .text(y.invert(pos.y).toFixed(2));

                    return "translate(" + mouse[0] + "," + pos.y + ")";
                });
        });
}