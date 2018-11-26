var year = 1990;
var country = "Brazil";
var dataMapF = new Array();
var dataMapM = new Array();
var dataMapB = new Array();

function updateLol(){
d3_queue
    .queue()
    .defer(
        d3.csv,
        "./data/suicide-female-ihme.csv",
        function (d) {
            if (d.Year == year)
                dataMapF.push(
                    [d.Location,
                    parseFloat(d.Value)]
                );
        }
    )
    .defer(
        d3.csv,
        "./data/suicide-male-ihme.csv",
        function (d) {
            if (d.Year == year)
                dataMapM.push(
                    [d.Location,
                    parseFloat(d.Value)]
                );
        }
    )
    .defer(
        d3.csv,
        "./data/suicide-death-rates-wid.csv",
        function (d) {
            if (d.Year == year)
                dataMapB.push(
                    [d.Entity,
                    parseFloat(d.Deaths)]
                );
        }
    )
    
    .await(ready_lol);
}

updateLol();

function ready_lol(error) {
    if (error) throw error;
    d3.selectAll("#lolli").remove();
    var j = 0;
    var data = new Array();
    //order both sexes by value
    dataMapB.sort(function (a, b) {
        return b[1] - a[1];
    })
    dataMapB = dataMapB.slice(0, 10);
    console.log(dataMapB);
    //get all the data together
    for (var i = 0; i < dataMapF.length && j < dataMapB.length; i++) {
        if (dataMapB[j][0] == dataMapF[i][0]) {
            data.push([dataMapB[j][0], dataMapB[j][1], dataMapF[i][1], dataMapM[i][1]]) //Female and Male files are equal in country order
            j++;
            i = -1;
        }
    }

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 560 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("id", "lolli")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-top", 40)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // Add X axis
    var x = d3.scaleLinear()
        .domain([1, 180])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .attr("class", "lol-x-axis");

    // Y axis
    var y = d3.scaleBand()
        .range([0, height])
        .domain(data.map(function (d) { return d[0]; }))
        .padding(1);
    svg.append("g")
        .call(d3.axisLeft(y))
        .attr("class", "lol-y-axis");

    // Lines
    svg.selectAll("myline")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", function (d) { return x(d[2]); })
        .attr("x2", function (d) { return x(d[3]); })
        .attr("y1", function (d) { return y(d[0]); })
        .attr("y2", function (d) { return y(d[0]); })
        .attr("stroke", "#C6E0D9")
        .attr("stroke-width", "1px")

    // Circles of variable 1
    svg.selectAll("mycircle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d[2]); })
        .attr("cy", function (d) { return y(d[0]); })
        .attr("r", "6")
        .style("fill", "#69b3a2")
        .append("title")
        .text(function(d) {
            return d[0] + " (Mulheres):\n" + parseFloat(d[2]).toFixed(2) + " suicídios por 100k pessoas no ano "+ year;
        })

    // Circles of variable 2
    svg.selectAll("mycircle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d[3]); })
        .attr("cy", function (d) { return y(d[0]); })
        .attr("r", "6")
        .style("fill", "#4C4082")
        .append("title")
			.text(function(d) {
				return d[0] + " (Homens):\n " + parseFloat(d[3]).toFixed(2) + " suicídios por 100k pessoas no ano "+ year;
		})
        
}

function setYearLol(y){
    year = y;
    // updateLol();
}