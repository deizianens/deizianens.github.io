var year = 1990;
var countryMapping;
var flag = 0;

/**
 * Loads the countries mapping.
 */
d3.csv("./data/wikipedia-iso-country-codes.csv", function (er, d) {
    countryMapping = d;
});

// loads country code for map construction
var getAlpha3CodeFor = function (country_name) {
    for (var i = 0, len = countryMapping.length; i < len; i++) {
        if (countryMapping[i]["English short name lower case"] === country_name)
            return countryMapping[i]["Alpha-3 code"];
    }
};

var getCountryNameFromAlpha3 = function (country_name){
    for (var i = 0, len = countryMapping.length; i < len; i++) {
        if (countryMapping[i]["Alpha-3 code"] === country_name)
            return countryMapping[i]["English short name lower case"];
        if (countryMapping[i]["English short name lower case"] === country_name)
            return countryMapping[i]["English short name lower case"];
    }
}

function convertNametoAlpha3code(name) {
    return getAlpha3CodeFor(name);
}

function divideBy1k(val){
    return val/1000;
}

d3.selectAll("#cloroplethMap").remove();
var mental = d3.map();
var svgmental;


    var width = 500,
        height = 300,
        centered;

// else{
//     var width = 860,
//     height = 550,
//     centered;
// }

var projection = d3
    .geoMercator()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2]);

var path = d3.geoPath().projection(projection);


    var x = d3
        .scaleLinear()
        .domain([2, 10])
        .rangeRound([100, 400]);

// else{
//     var x = d3
//         .scaleLinear()
//         .domain([1, 10])
//         .rangeRound([600, 860]);
// }
var colorPurples = d3
    .scaleThreshold()
    .domain(d3.range(0, 9))
    .range(d3.schemePiYG[9]);

svgmental = d3
    .select(".Map")
    .append("svg")
    .attr("id", "cloroplethMap")
    .attr("width", width)
    .style("border-style", "solid")
    .style("border-width", 1)
    .style("margin-left", 0)
    .attr("height", height);

var tip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

svgmental
    .append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var gCountry = svgmental.append("g");

// Load data (asynchronously)
d3_queue
    .queue()
    .defer(
        d3.json,
        "https://enjalot.github.io/wwsd/data/world/world-110m.geojson"
    )
    .defer(
        d3.csv,
        "./data/incidence-of-mental-disorders-ihme.csv",
        function (d) {
            if(d.Year == year)
            mental.set(
                convertNametoAlpha3code(d.Location),
                divideBy1k(d.Value)
            );
        }
    )
    .await(ready);

// console.log(mental);

function ready(error, country) {
    if (error) throw error;
    // clicked = 0;
    // console.log(country);
    // console.log(mental.get('BRA'));
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
        .attr("stroke", "black")
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
    x = width / 2;
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
            -x +
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
    var colorLabel = svgmental
        .append("g")
        .attr("class", "key")
        .attr("transform", "translate(150,250)");

    colorLabel
        .selectAll("rect")
        .data(
            colorPurples.range().map(function (d) {
                d = colorPurples.invertExtent(d);
                if (d[0] == null) d[0] = x.domain()[0];
                if (d[1] == null) d[1] = x.domain()[1];
                return d;
            })
        )
        .enter()
        .append("rect")
        .attr("height", 8)
        .attr("x", function (d) {
            return x(d[0]);
        })
        .attr("width", function (d) {
            if (x(d[1]) - x(d[0]) >= 0) {
                return x(d[1]) - x(d[0]);
            }
        })
        .attr("fill", function (d) {
            return colorPurples(d[0]);
        });

    colorLabel
        .append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(year + " Incidence of Mental Disorders");

    colorLabel
        .call(
            d3
                .axisBottom(x)
                .tickSize(13)
                .tickFormat(function (x, i) {
                    return x;
                })
                .tickValues(colorPurples.domain())
        )
        .select(".domain")
        .remove();
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function setYearMap(y){
    year = y;
    if (flag == 0){
        // Load data (asynchronously)
        d3_queue
            .queue()
            .defer(
                d3.json,
                "https://enjalot.github.io/wwsd/data/world/world-110m.geojson"
            )
            .defer(
                d3.csv,
                "./data/incidence-of-mental-disorders-ihme.csv",
                function (d) {
                    if(d.Year == year)
                    mental.set(
                        convertNametoAlpha3code(d.Location),
                        divideBy1k(d.Value)
                    );
                }
            )
            .await(ready);

    }
}
