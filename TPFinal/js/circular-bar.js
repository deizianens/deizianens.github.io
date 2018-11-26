var year = 2015;
var num=3;
var countries = ["China", "Indonesia", "Japan", "Australia", "Germany", "Argentina", "United States", "Uganda", "Mexico", "Brazil",
    "South Africa", "Senegal", "Nigeria", "Norway", "Denmark", "Sweden", "Iceland", "Switzerland", "Finland", "Hungary",
    "Poland", "Serbia", "Belarus", "Russia", "New Zealand", "Canada", "Chile", "Uruguay", "Belgium", "France",
    "Greece", "Ireland", "Israel", "Italy", "Netherlands", "Portugal", "Spain", "United Kingdom", "Bolivia", "Ecuador",
    "Haiti", "Jamaica", "India", "Colombia", "Costa Rica", "Venezuela", "Afghanistan", "Iraq", "Iran", "Paraguay",
    "Syria"];

// set the dimensions and margins of the graph
var margin = { top: 100, right: 0, bottom: 0, left: 0 },
    width = 960 - margin.left - margin.right,
    height = 960 - margin.top - margin.bottom,
    innerRadius = 200,
    outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border

var a1 = new Array();
var a2 = new Array();
var a3 = new Array();
var a4 = new Array();

function update(){
    d3_queue
    .queue()
    .defer(
        d3.csv,
        "./data/prevalence-of-mental-disorders-ihme.csv",
        function (d) {
            for (var i = 0; i < countries.length; i++) {
                if (d.Location == countries[i]) {
                    if (d.Year == year) {

                        a1.push(
                            [d.Location,
                            (d.Value)]
                        );
                        break;
                    }
                }
            }
        }
    )
    .defer(
        d3.csv,
        "./data/world-happiness-report-2015-kaggle.csv",
        function (d) {
            for (var i = 0; i < countries.length; i++) {
                if (d.Location == countries[i]) {
                    if (d.Year == year) {
                        a2.push(
                            [d.Location,
                            (d.Value)]
                        );
                        break;
                    }
                }
            }
        }
    )
    .defer(
        d3.csv,
        "./data/world-happiness-report-2016-kaggle.csv",
        function (d) {
            for (var i = 0; i < countries.length; i++) {
                if (d.Location == countries[i]) {
                    if (d.Year == year) {
                        a3.push(
                            [d.Location,
                            (d.Value)]
                        );
                        break;
                    }
                }
            }
        }
    )
    .defer(
        d3.csv,
        "./data/world-happiness-report-2017-kaggle.csv",
        function (d) {
            for (var i = 0; i < countries.length; i++) {
                if (d.Location == countries[i]) {
                    if (d.Year == year) {
                        a4.push(
                            [d.Location,
                            (d.Value)]
                        );
                        break;
                    }
                }
            }
        }
    )
    .await(ready);

}

update();

function ready(error) {
    if (error) throw error;

    if (year == 2015) {
        data = a2;
    }
    else if (year == 2016) {
        data = a3;
    }
    else {
        data = a4;
    }

    d3.selectAll(".bar_circle").remove();
    d3.selectAll(".tooltip-cb").remove();
    // console.log(a1);
    // sort in alphabetical order
    a1.sort(function (a, b) { return d3.ascending(a[0], b[0]) })
    data.sort(function (a, b) { return d3.ascending(a[0], b[0]) })

    data = join(a1, data);
    // sort in decreasing order by happiness
    data.sort(function (a, b) { return d3.descending(a[num], b[num]) })
// append the svg object
var svg = d3.select("#circular_bar")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "bar_circle")
    .append("g")
    .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");
 
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 1)
  }
    // X scale: common for 2 data series
    var x = d3.scaleBand()
        .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0)                  // This does nothing
        .domain(data.map(function (d) { return d[0]; })); // The domain of the X axis is the list of states.

    // Y scale outer variable
    var y = d3.scaleRadial()
        .range([innerRadius, outerRadius])   // Domain will be define later.
        .domain([0, 8]); // Domain of Y is from 0 to the max seen in the data

    // Second barplot Scales
    var ybis = d3.scaleRadial()
        .range([innerRadius, 5])
        .domain([9000, 20000]);

    // Add the bars
    svg.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("fill", "#69b3a2")
        .attr("class", "yo")
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(function (d) { return y(d[3]); })
            .startAngle(function (d) { return x(d[0]); })
            .endAngle(function (d) { return x(d[0]) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))
            .on("mouseover", function(d) {
                Tooltip
                  .style("opacity", 1)
                  .html(d[0] + "<br>" + Number(d[3]).toLocaleString('pt-BR'))
                  .style("left", (d3.mouse(this)[0]+400) + "px")
                .style("top", (d3.mouse(this)[1]-500) + "px")
                d3.select(this)
                  .style("stroke", "black")
                  .style("opacity", 0.7)
              })
            // fade out tooltip on mouse out
            .on("mouseout", mouseleave);

    // Add the labels
    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("text-anchor", function (d) { return (x(d[0]) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
        .attr("transform", function (d) { return "rotate(" + ((x(d[0]) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d[3]) + 10) + ",0)"; })
        .append("text")
        .text(function (d) { return (d[0]) })
        .attr("transform", function (d) { return (x(d[0]) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
        .style("font-size", "11px")
        .attr("alignment-baseline", "middle")

    // Add the second serie
    svg.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("fill", "#EC6142")
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(function (d) { return ybis(0) })
            .outerRadius(function (d) { return ybis(d[1]); })
            .startAngle(function (d) { return x(d[0]); })
            .endAngle(function (d) { return x(d[0]) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))
        .on("mouseover", function(d) {
            Tooltip
              .style("opacity", 1)
              .html(d[0] + "<br>" + Number(d[1]).toLocaleString('pt-BR'))
              .style("left", (d3.mouse(this)[0]+400) + "px")
              .style("top", (d3.mouse(this)[1]-500) + "px")
            d3.select(this)
              .style("stroke", "black")
              .style("opacity", 0.7)
          })
        // fade out tooltip on mouse out
        .on("mouseout", mouseleave);

        // create a tooltip
  var Tooltip = d3.select("#circular_bar")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip-cb")
    .style("background-color", "#DDEDF3")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "relative")


}

d3.select(".custom-select2")
	.on("change", function(d) {
		index = this.value;
		setYearCB();
    })

function join(a, b) {
    aux = new Array();
    for (var i = 0; i < a.length; i++) {
        aux.push(a[i].concat(b[i]));
    }
    return aux;
}

function changeOrder(n){
    num = n;
    eraseArray();
    update();
}

function setYearCB(y){
    year = d3.select("#customDropdown2")
        .select("select")
        .property("value")
        eraseArray();
        update();
}

function eraseArray(){
    a1.splice(0,a1.length);
    a2.splice(0,a2.length);
    a3.splice(0,a3.length);
    a4.splice(0,a4.length);
}