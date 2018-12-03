year = 1990;
country = "Global";

// Load data (asynchronously)
d3_queue
    .queue()
    .defer(
        d3.csv,
        "./data/incidence-of-major-depression-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-dysthmia-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-schizophrenia-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-bipolar-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-anxiety-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-anorexia-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-bulimia-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-substance-use-ihme.csv",  
    )
    .await(ready);

var width = 500,
    height = 300,
    legendWidth = 299.9;

d3.selectAll("#svg-treemap").remove();
d3.selectAll(".legend").remove();

var graph = d3.select(".canvas").append("svg")
    .attr("id", "svg-treemap")
    .attr("width", width)
    .attr("height", height)
    .append("g");

var tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

var legend = d3.select(".canvas").append("div")
    .attr("class", "legend")
    .style("width", legendWidth + "px")
    .append("svg")
    .attr("width", legendWidth)
    .attr("id", "legend");

//set color
var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
    color = d3.scaleOrdinal(d3.schemePastel1.map(fader)),
    format = d3.format(",d");

//set treemap
var treemap = d3.treemap()
    .tile(d3.treemapResquarify)
    .size([width, height])
    .round(false)
    .paddingInner(1);

function ready(error, dep, dys, sch, bip, anx, anr, bul, sub) {
    if (error) throw error;

    var d1 = new Array(8);
    for(var i = 0; i<dep.length; i++){
        if((dep[i].Location == country) && (dep[i].Year == year)){
            d1[0] = parseFloat(dep[i].Value).toFixed(2);
            d1[1] = parseFloat(dys[i].Value).toFixed(2);
            d1[2] = parseFloat(sch[i].Value).toFixed(2);
            d1[3] = parseFloat(bip[i].Value).toFixed(2);
            d1[4] = parseFloat(anx[i].Value).toFixed(2);
            d1[5] = parseFloat(anr[i].Value).toFixed(2);
            d1[6] = parseFloat(bul[i].Value).toFixed(2);
            d1[7] = parseFloat(sub[i].Value).toFixed(2);
            // console.log(i);
        }
    }
    // console.log(country);
    // console.log(year);
    data = {
        "name": "Mental Health",
        "children": [
            {
                "name": "Desordens Mentais", "children": [
                    {
                        name: "Depressão",
                        "category": "Desordens Mentais",
                        "value": d1[0]
                    },
                    {
                        name: "Distimia",
                        "category": "Desordens Mentais",
                        "value": d1[1]
                    },
                    {
                        name: "Esquizofrenia",
                        "category": "Desordens Mentais",
                        "value": d1[2]
                    }
                    ,
                    {
                        name: "Transtorno Bipolar",
                        "category": "Desordens Mentais",
                        "value": d1[3]
                    }
                    ,
                    {
                        name: "Ansiedade",
                        "category": "Desordens Mentais",
                        "value": d1[4]
                    }
                ]
            },
            {
                "name": "Desordens Alimentares", "children": [
                    {
                        name: "Anorexia",
                        "category": "Desordens Alimentares",
                        "value": d1[5]
                    },
                    {
                        name: "Bulimia",
                        "category": "Desordens Alimentares",
                        "value": d1[6]
                    }
                ]
            },
            {
                "name": "Uso de Substâncias", "children": [
                    {
                        name: "Álcool e Outras Drogas",
                        "category": "Uso de Substâncias",
                        "value": d1[7]
                    }
                ]
            },
        ]
    }

    // console.log(dado);  
// console.log(data);  
var root = d3.hierarchy(data)
     .eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; d.data.id = d.data.id.replace(/\s/g, '-');})
     .sum(function(d){return d.value})
     .sort(function(a, b) {return b.height - a.height || b.value - a.value;});
  
     
  treemap(root);
  
  //get all categories
  var categories = root.leaves().map(function(nodes){
    return nodes.data.category;
  });
  categories = categories.filter(function(category, index, self){
    return self.indexOf(category) === index;
  });
  
  //draw treemap
  var cell = graph.selectAll("g")
    .data(root.leaves())
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });
  
  //draw cells
  var tile = cell.append("rect")
      .attr("id", function(d) { return d.data.id; })
      .attr("class", "tile")
      .attr("data-name", function(d) {return d.data.name})
      .attr("data-category", function(d){return d.data.category})
      .attr("data-value", function(d){return d.data.value})
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
      .attr("fill", function(d) { return color(d.parent.data.name); });
      //draw tooltip
    cell.on("mousemove", function(d){
        tooltip.style("opacity", .9)
          .html(
            'Name: ' + d.data.name + 
            '<br>Category: ' + d.data.category + 
            '<br>Value: ' + d.data.value
          )
          .attr("data-value", d.data.value)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 18) + "px");
      })
      .on("mouseout", function(d){
        tooltip.style("opacity", 0);
      });
  
  cell.append("clipPath")
      .attr("id", function(d) { return "clip-" + d.data.id; })
    .append("use")
      .attr("xlink:href", function(d) { return "#" + d.data.id; });
  
  cell.append("text")
      .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
    .selectAll("tspan")
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
    .enter().append("tspan")
      .style("font-size", "10px")
      .attr("x", 4)
      .attr("y", function(d, i) { return 15 + i * 12; })
      .text(function(d) { return d; });
  
      const LEGEND_OFFSET = 10;
      const LEGEND_RECT_SIZE = 15;
      const LEGEND_H_SPACING = 150;
      const LEGEND_V_SPACING = 10;
      const LEGEND_TEXT_X_INDENT = 3;
      var elementPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);
      var paddingLeft = Math.floor((legendWidth - LEGEND_H_SPACING*(elementPerRow - 1) - 60)/2); 
      
      var legendElem = legend.selectAll("g")
        .data(categories)
        .enter().append("g")
        .attr("transform", function(d, i){
          return "translate(" + ((i%elementPerRow) * LEGEND_H_SPACING +paddingLeft) + ", " + ((Math.floor(i/elementPerRow))*(LEGEND_RECT_SIZE + LEGEND_V_SPACING)) + ")";
        });
  
  legendElem.append("rect")
    .attr("width", LEGEND_RECT_SIZE)
    .attr("height", LEGEND_RECT_SIZE)
    .attr("class", "legend-item")
    .attr("fill", function(d){return color(d);});
  
  legendElem.append("text")
    .attr("x", LEGEND_RECT_SIZE + LEGEND_TEXT_X_INDENT)
    .attr("y", LEGEND_RECT_SIZE)
    .text(function(d){return d})
    .attr("dy", -2)
};

function updateTreemap(y, c){
    year = y;
    country = c;
    d3_queue
    .queue()
    .defer(
        d3.csv,
        "./data/incidence-of-major-depression-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-dysthmia-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-schizophrenia-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-bipolar-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-anxiety-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-anorexia-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-bulimia-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-substance-use-ihme.csv",  
    )
    .await(ready);
}