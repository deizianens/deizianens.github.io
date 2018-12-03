var selectedCountry = "Brazil", selectedDisorder = "Depression";
var graphData = new Array(27);

d3.queue()
  .defer(
        d3.csv, "./data/prevalence-by-mental-and-substance-use-disorder.csv")
  .await(ready);

function ready(error, data){
  if(error) throw error;

  var i, j = 0, dataLength = data.length;
  /*
  --->>>  IT'S A FEATURE MODE ON  <<<---
  */
  if(selectedDisorder == "Depression"){
    for(i = 0; i < dataLength; i++){
      if(selectedCountry == data[i].Entity){
        graphData[j] = {
          "Year": data[i].Year,
          Disorder: data[i].Depression
        };
        j++;
      }
    }
  }else if(selectedDisorder == "Bipolar"){
    for(i = 0; i < dataLength; i++){
      if(selectedCountry == data[i].Entity){
        graphData[j] = {
          "Year": data[i].Year,
          Disorder: data[i].Bipolar
        };
        j++;
      }
    }
  }else if(selectedDisorder == "Schizophrenia"){
    for(i = 0; i < dataLength; i++){
      if(selectedCountry == data[i].Entity){
        graphData[j] = {
          "Year": data[i].Year,
          Disorder: data[i].Schizophrenia
        };
        j++;
      }
    }
  }else if(selectedDisorder == "Eating"){
    for(i = 0; i < dataLength; i++){
      if(selectedCountry == data[i].Entity){
        graphData[j] = {
          "Year": data[i].Year,
          Disorder: data[i].Eating
        };
        j++;
      }
    }
  }else if(selectedDisorder == "Anxiety"){
    for(i = 0; i < dataLength; i++){
      if(selectedCountry == data[i].Entity){
        graphData[j] = {
          "Year": data[i].Year,
          Disorder: data[i].Anxiety
        };
        j++;
      }
    }
  }else if(selectedDisorder == "Drug"){
    for(i = 0; i < dataLength; i++){
      if(selectedCountry == data[i].Entity){
        graphData[j] = {
          "Year": data[i].Year,
          Disorder: data[i].Drug
        };
        j++;
      }
    }
  }else if(selectedDisorder == "Alcohol"){
    for(i = 0; i < dataLength; i++){
      if(selectedCountry == data[i].Entity){
        graphData[j] = {
          "Year": data[i].Year,
          Disorder: data[i].Alcohol
        };
        j++;
      }
    }
  }
  /*
    --->>>  IT'S A FEATURE MODE OFF  <<<---
  */

  drawChart(graphData);
}


//callback function
function drawChart(data){
  var svgWidth = 1000, svgHeight = 500;
  var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
  };
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  d3.selectAll("#line-chart").remove();

  var svg = d3.select("#svgcontainer")
    .append("svg")
    .attr("id", "line-chart")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  //group element to hold the line chart, axis, and labels
  var g = svg.append("g")
      .attr("transform",
         "translate(" + margin.left + "," + margin.top + ")"
  );
  var parseTime = d3.timeParse("%Y");
  data.forEach(function(d) {
    d.Year = parseTime(d.Year);
  });
  var scaleX =  d3.scaleTime()
                  .domain([new Date(1990, 0, 1), new Date(2016, 0, 1)])
                  .rangeRound([0,width]);

  var scaleY = d3.scaleLinear()
      .domain([0, 10])
      .range([height, 0]);
  var xAxisTranslate = height;
  var xAxis = d3.axisBottom().scale(scaleX);

  g.append("g").attr("transform", "translate(0," + xAxisTranslate +")")
    .call(xAxis.ticks(d3.timeYear));
  var yAxis = d3.axisLeft().scale(scaleY);
  g.append("g").attr("transform", "translate(0, 0)").call(yAxis).append("text")
   .attr("fill", "#000")
   .attr("transform", "rotate(-90)")
   .attr("y", 6)
   .attr("dy", "0.71em")
   .attr("text-anchor", "end")
   .text("Percentage (%)");

  // d3's line generator
  var lineFunction = d3.line()
    .x(function(data) { return scaleX(data.Year); })
    .y(function(data){ return scaleY(data.Disorder); })
    .curve(d3.curveMonotoneX) // apply smoothing to the line

  g.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", lineFunction);

    /*  PAREI AQUI
        falta colocar os valores dos pontos proximo do "mouseover"
   */
  // create a tooltip
  var Tooltip = d3.select("#svgcontainer")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    Tooltip.style("opacity", 1)
  }
  var mousemove = function(d) {
    Tooltip
      .html("Exact value: " + d.Disorder)
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function(d) {
    Tooltip.style("opacity", 0)
  }

  // Add the points
  svg
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", "myCircle")
      .attr("cx", function(d) { return scaleX(d.Year) } )
      .attr("cy", function(d) { return scaleY(d.Disorder) } )
      .attr("r", 5)
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 3)
      .attr("fill", "white")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)

}

// country, disorder
function setCountryLine(c, d){
  selectedCountry = c;
  selectedDisorder = d;
  document.getElementById("country-title").innerHTML = c;

  d3.queue()
  .defer(
        d3.csv, "prevalence-by-mental-and-substance-use-disorder.csv")
  .await(ready);
}
