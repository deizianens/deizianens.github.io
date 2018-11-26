var country = "Global";
var graphData = new Array(27); //27 years (1990 - 2017)

// Load data (asynchronously)
d3_queue
    .queue()
    .defer(
        d3.csv,
        "./data/incidence-of-mental-disorders-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-substance-use-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-self-harm-ihme.csv", 
    )
    .await(ready);

    
function ready(error, ment, sub, harm){
    if (error) throw error;
    var j = 0;

    for(var i = 0; i<ment.length; i++){
        if(country == ment[i].Location){
            graphData[j] = {
                    "date": ment[i].Year,
                    "mentalDisorders": parseInt(ment[i].Value),
                    "substanceUse": parseInt(sub[i].Value),
                    "selfHarm": parseInt(harm[i].Value) 
            } 
            j++;  
        }
    }
    
    // console.log(graphData);
    totalCallsGraph(graphData);
}

function totalCallsGraph(data) {

    var margin = {top: 50, right: 30, bottom: 50, left: 50},
        width = 1100 - margin.left - margin.right,
        height = 340 - margin.top - margin.bottom;

    var n = 32;

    var	x = d3.scaleLinear()
        .domain([1, n - 1])
        .range([0, width]);
    var	y = d3.scaleLinear().range([height, 0]);

    var	xAxis = d3.axisBottom().scale(x)
        .ticks(30)
        .tickFormat(d3.format("d"));

    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(5)
        .tickSizeInner(-width)
        .tickSizeOuter(0)
        .tickPadding(10)
        .tickFormat(d3.format(".0s"));

    // var	yAxis = d3.svg.axis().scale(y)
    //     .orient("left").ticks(5).outerTickSize(1);

    var	valueline = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.mentalDisorders); });

    var	valueline2 = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.substanceUse); });
    
    var	valueline3 = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.selfHarm); });

    //Initiate the area line function
    var areaFunction1 = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function (d) {
            return x(d.date);
        })
        .y0(height)
        .y1(function (d) {
            return y(d.mentalDisorders);
        });

    var areaFunction2 = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function (d) {
            return x(d.date);
        })
        .y0(height)
        .y1(function (d) {
            return y(d.substanceUse);
        });
    
    var areaFunction3 = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function (d) {
            return x(d.date);
        })
        .y0(height)
        .y1(function (d) {
            return y(d.selfHarm);
        });
    d3.selectAll("#svg-linechart").remove();

    //Add the svg canvas for the line chart
    var	svg = d3.select("#totalCalls")
        .append("svg")
        .attr("id", "svg-linechart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Define the gradient below the line chart
    var areaGradient1 = svg.append('defs')
        .append("linearGradient")
        .attr('id', 'areaGradient1')
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");

    var areaGradient2 = svg.append('defs')
        .append("linearGradient")
        .attr('id', 'areaGradient2')
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    
    var areaGradient3 = svg.append('defs')
        .append("linearGradient")
        .attr('id', 'areaGradient3')
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");


    //Append the first stop - the color at the top
    areaGradient1.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#7fcdbb")
        .attr("stop-opacity", 0.4);

    //Append the second stop - white transparant almost at the end
    areaGradient1.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#7fcdbb")
        .attr("stop-opacity", 0);

    //Append the first stop - the color at the top
    areaGradient2.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#e9a3c9")
        .attr("stop-opacity", 0.4);

    //Append the second stop - white transparant almost at the end
    areaGradient2.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#e9a3c9")
        .attr("stop-opacity", 0);

    //Append the first stop - the color at the top
    areaGradient3.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#2c7fb8")
        .attr("stop-opacity", 0.4);

    //Append the second stop - white transparant almost at the end
    areaGradient3.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#2c7fb8")
        .attr("stop-opacity", 0);

// Get the data
    data.forEach(function(d) {
        d.date = +d.date;
        d.mentalDisorders = +d.mentalDisorders;
        d.substanceUse = +d.substanceUse;
        d.selfHarm = +d.selfHarm;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return Math.max(d.mentalDisorders, d.substanceUse, d.selfHarm); })]);

    svg.append("path")		// Add the valueline path.
        .attr("class", "line")
        .attr("d", valueline(data));

    svg.append("path")		// Add the valueline2 path.
        .attr("class", "line")
        .style("stroke", "#e9a3c9")
        .attr("d", valueline2(data));
    
    svg.append("path")		// Add the valueline4 path.
        .attr("class", "line")
        .style("stroke", "#2c7fb8")
        .attr("d", valueline3(data));

    //Draw the underlying area chart filled with the gradient
    svg.append("path")
        .attr("class", "area")
        .style("fill", "url(#areaGradient1)")
        .attr("d", areaFunction1(data));

    svg.append("path")
        .attr("class", "area")
        .style("fill", "url(#areaGradient2)")
        .attr("d", areaFunction2(data));
    
    svg.append("path")
        .attr("class", "area")
        .style("fill", "url(#areaGradient3)")
        .attr("d", areaFunction3(data));



    //Create the chart

    svg.append("g")			// Add the X Axis
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("transform", "translate(364,14)")
        .attr("y", "2em")
        .style("text-anchor", "middle")
        .text("Years");

    svg.append("g")			// Add the Y Axis
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", "-1.5em")
        .attr("y", "-6em")
        .style("text-anchor", "end")
        .text("Incidence per 100k");


    // gridlines in y axis function
    function make_y_gridlines() {
        return d3.axisBottom().scale(y)
            .ticks(5)
    }

    // // add the Y gridlines
    // svg.append("g")
    //     .attr("class", "gridline")
    //     .call(make_y_gridlines()
    //         .tickSize(-width)
    //         .tickFormat(d3.format(".0s"))
    //     )


    function tooltipCalls(dots,calls,linedots) {
        var tooltip = d3.select("#totalCalls").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        svg.selectAll("." + dots)
            .data(data, function (d) {
                return d.date;
            })
            .enter().append("circle")
            .attr("class", "lineDots " + linedots)
            .attr("r", 3)
            .attr("cx", function (d) {
                return x(d.date);
            })
            .attr("cy", function (d) {
                return y(d[calls]);
            })
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltip.html("<span>" + d[calls] + " /100k" + "</span>")
                    .style("left", (d3.event.pageX - 25) + "px")
                    .style("top", (d3.event.pageY - 38) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }

    tooltipCalls("incominglineDots","mentalDisorders","lineDotsIncoming");
    tooltipCalls("outgoinglineDots","substanceUse","lineDotsOutgoing");
    tooltipCalls("selfHarmlineDots","selfHarm","lineDotsSelfHarm");
}

function setCountryLine(c){
    country = c;
    document.getElementById("country-title").innerHTML = c;
    // Load data (asynchronously)
    d3_queue
    .queue()
    .defer(
        d3.csv,
        "./data/incidence-of-mental-disorders-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-substance-use-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-self-harm-ihme.csv", 
    )
    .await(ready);
}