var file = "none";

function setFile(f){
    file = f;
}

// Load data (asynchronously)
d3_queue
    .queue()
    .defer(
        d3.csv,
        "./data/suicide-female-ihme.csv", 
    )
    .defer(
        d3.csv,
        "./data/incidence-of-mental-disorders-ihme.csv", 
    )
    .await(ready_drop);

function ready_drop(error, d1, d2){
    if(error) throw error;
    var data;
    if(file == "donut"){
        data = d1;
    }
    else{
        data = d2;
    }
   
    var countries = new Array();
    var j = 0;
    countries[0] = {"country": data[0].Location};
    
    // counts how many countries are there
    for(var i = 1; i<data.length; i++){
        if(countries[j].country != data[i].Location){
            countries[j+1] = {"country": data[i].Location};
            j++;
            // console.log(j);
        }
    }

    // console.log(countries);
    // sort in alphabetical order
    countries.sort(function(a, b) {return d3.ascending(a.country,b.country)})

   // create the drop down menu of countries
	var selector = d3.select("#customDropdown")
    .append("select")
    .attr("class", "custom-select")
    .selectAll("option")
    .data(countries)
    .enter().append("option")
    .text(function(d) { return d.country; })
    .attr("value", function (d) {
        return d.country;
    });

    // generate a random index value and set the selector to the city
	// at that index value in the data array
    d3.select(".custom-select").property("selectedIndex", 24);
    
    // when the user selects a city, set the value of the index variable
	// and call the update(); function
	d3.select(".custom-select")
	.on("change", function(d) {
		index = this.value;
		update();
    })

    d3.select(".custom-select2")
	.on("change", function(d) {
		index = this.value;
		update();
    })
    
    // update the paragraph text to match the selection made by the user
	function update(){
		var selectedCountry = d3.select("#customDropdown")
            .select("select")
            .property("value")
        var selectedYear = d3.select("#customDropdown2")
            .select("select")
            .property("value")

        // console.log(selectedYear, selectedCountry);
        updateGraph(selectedYear, selectedCountry);
    }
    
    function updateGraph(y, c){
        console.log(file);
        if(file == "donut"){
            $.getScript("js/donut-chart.js",function(){
                setYearDonut(y);
                setCountryDonut(c);
            });
            $.getScript("js/lollipop.js",function(){
                setYearLol(y); //not working but who cares after all
            });
        }
        else{
            $.getScript("js/map.js",function(){
                setYearMap(y);
            });
            $.getScript("js/treemap.js",function(){
                updateTreemap(y,c);
            });
            $.getScript("js/line-chart.js",function(){
                setCountryLine(c);
            });
        }
    }

    
}