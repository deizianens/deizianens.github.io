var countryMapping;
MIN_YEAR = 1990;
MAX_YEAR = 2017
var path, 
    currentYear = "1990",
    playing = false,
    slider,
    years = [];


for(var i=MIN_YEAR; i<MAX_YEAR; i++){
    years.push(i);
 }    

d3.selectAll("#cloroplethMap").remove();
var mental = d3.map();
var svgmap;

var width = 1110,
    height = 650,
    centered;


var projection = d3
    .geoMercator()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2]);

var path = d3.geoPath().projection(projection);


var x_map = d3
    .scaleLinear()
    .domain([1, 30])
    .rangeRound([600, 860]);


var colorPurples = d3
    .scaleThreshold()
    .domain(d3.range(0, 36, 4))
    .range(d3.schemeGreens[9]);

svgmap = d3
    .select(".Map")
    .append("svg")
    .attr("id", "cloroplethMap")
    .attr("width", width)
    // .style("border-style", "solid")
    // .style("border-width", 1)
    .style("margin-left", 0)
    .attr("height", height);

var tip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

svgmap
    .append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var gCountry = svgmap.append("g");
addSlider();

d3_queue
    .queue()
    .defer(
        d3.json,
        "https://enjalot.github.io/wwsd/data/world/world-110m.geojson"
    )
    .defer(
        d3.csv,
        "./data/suicide-death-rates-wid.csv",
        function (d) {
            if(d.Year == currentYear)
            mental.set(
                d.Code,
                d.Deaths
            );
        }
    )
    .await(ready);

function ready(error, country) {
    if (error) throw error;

    gCountry
        .append("g")
        .attr("id", "countries")
        .selectAll("path")
        .data(country.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            return colorPurples(mental.get(d.id));
        })
        .attr("fill-opacity", 1)
        .attr("stroke", "#34495e")
        .on("click", clicked)
        .on("mouseover", function (d) {
            if (mental.get(d.id)) {
                var currentState = this;
                d3
                    .select(this)
                    .style('fill-opacity', .7);
                tip
                    .transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tip
                    .text(
                        d.properties.name + "\n" + round(mental.get(d.id), 2) + " / 100k"
                    )
                    .style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + "px");
            }
        })

        // fade out tooltip on mouse out
        .on("mouseout", function (d) {
            var currentState = this;
            d3
                .select(this)
                .style('fill-opacity', 1);
            tip
                .transition()
                .duration(50)
                .style("opacity", 0);
        });

    makeLables();
}

function clickedin(d) {
    
}

function clickedout(d, x, y, k) {
    x_map= width / 2;
    y = height / 2;
    k = 1;
    centered = null;
    move(d, x, y, k);
}

function move(d, x, y, k) {
    gCountry.selectAll("path").classed(
        "activeCount",
        centered &&
        function (d) {
            return d === centered;
        }
    );

    gCountry
        .transition()
        .duration(750)
        .attr(
            "transform",
            "translate(" +
            width / 2 +
            "," +
            height / 2 +
            ")scale(" +
            k +
            ")translate(" +
            -x+
            "," +
            -y +
            ")"
        )
        .style("stroke-width", 1.5 / k + "px");
}

function clicked(d, x, y, k) {
    var x, y, k;

    if (d && centered !== d) {
        clickedin(d, x, y, k);
    } else {
        clickedout(d, x, y, k);
    }
}

function makeLables() {
    var colorLabel = svgmap
        .append("g")
        .attr("class", "key")
        .attr("transform", "translate(100,500)");

    colorLabel
        .selectAll("rect")
        .data(
            colorPurples.range().map(function (d) {
                d = colorPurples.invertExtent(d);
                if (d[0] == null) d[0] = x_map.domain()[0];
                if (d[1] == null) d[1] = x_map.domain()[1];
                return d;
            })
        )
        .enter()
        .append("rect")
        .attr("height", 8)
        .attr("x", function (d) {
            return x_map(d[0]);
        })
        .attr("width", function (d) {
            if (x_map(d[1]) - x_map(d[0]) >= 0) {
                return x_map(d[1]) - x_map(d[0]);
            }
        })
        .attr("fill", function (d) {
            return colorPurples(d[0]);
        })
       

    colorLabel
        .append("text")
        .attr("class", "caption")
        .attr("x", x_map.range()[0])
        .attr("y", -6)
        .attr("fill", "#e4f1fe")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(currentYear + " Suicide Rate");

    colorLabel
        .call(
            d3
                .axisBottom(x_map)
                .tickSize(13)
                .tickFormat(function (q, i) {
                    return q;
                })
                .tickValues(colorPurples.domain())
                
        )
                
        .select(".domain")
        .remove();
        
}

function removeLables(){
    d3.selectAll(".key").remove();
    
}
function animateMap() {
    var timer;
    d3.select('#play').on('click', function() {
        if (playing == false) {
            timer = setInterval(function() {
                if (currentYear < years[years.length-1]) {
                    currentYear = (parseInt(currentYear) + 1).toString()
                } else {
                    currentYear = years[0];
                }
                sequenceMap();
                slider.setValue(currentYear);
                d3.select("#year").text(currentYear);
            }, 1000);
            d3.select(this).select('image').attr("xlink:href", "https://image.flaticon.com/icons/svg/9/9959.svg");
            playing = true;
        } else {
            clearInterval(timer);
            d3.select(this).select('image').attr("xlink:href", "https://image.flaticon.com/icons/svg/26/26025.svg");
            playing = false;
        }
    });
}

function sequenceMap() {
    removeLables();
    d3_queue
    .queue()
    .defer(
        d3.json,
        "https://enjalot.github.io/wwsd/data/world/world-110m.geojson"
    )
    .defer(
        d3.csv,
        "./data/suicide-death-rates-wid.csv",
        function (d) {
            if(d.Year == currentYear)
            mental.set(
                d.Code,
                d.Deaths
            );
        }
    )
    .await(ready);
}

function addSlider() {
    // Add slider button
    var btn = svgmap.append("g").attr("class", "button").attr("id", "play")
        .attr("transform", "translate(10,595)")
        .attr("onmouseup", animateMap);
    btn.append("circle")
        // .attr("x", 20).attr("y", 1)
        .attr("cx", 42).attr("cy", 10)
        .attr("r", 25)
        .style("fill", "#1BBF96");
    btn.append("svg:image")
        .attr("x", 17)
        .attr("y", -15)
        .attr('width', 50)
        .attr('height', 50)
        .attr("xlink:href", "https://image.flaticon.com/icons/svg/26/26025.svg")
    
    // Initialize slider
    var formatter = d3.format("04d");
    var tickFormatter = function(d) {
        return formatter(d);
    }

    slider = d3.slider().min('1990').max('2016')
        .tickValues(['1990','1991', '1992', '1993', '1994', '1995', '1996', '1997', '1998', '1999', '2000',
                    '2001', '2002', '2003', '2004', '2005', '2006', '2007','2008', '2009', '2010', '2011',
                    '2012', '2013', '2014', '2015', '2016'])
        .stepValues(d3.range(1990,2016))
        .tickFormat(tickFormatter);

    svgmap.append("g")
        .attr("width", width-100)
        .attr("id", "slider")
        .attr("transform", "translate(100,575)");
    // Render the slider in the div
    d3.select('#slider').call(slider);
    var dragBehaviour = d3.drag();
    
    dragBehaviour.on("drag", function(d){
        var pos = d3.event.x;
        slider.move(pos+25);
        currentYear = slider.value();
        sequenceMap();
        d3.select("#year").text(currentYear);
    });

    svgmap.selectAll(".dragger").call(dragBehaviour);
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}


