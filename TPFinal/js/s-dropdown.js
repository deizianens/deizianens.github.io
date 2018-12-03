// Load data (asynchronously)
d3_queue
    .queue()
    .defer(
        d3.csv,
        "./data/suicide-female-ihme.csv", 
    )
    .await(ready_drop);

function ready_drop(error, data){
    if(error) throw error;
   
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
		update_drop();
    })

    d3.select(".custom-select2")
	.on("change", function(d) {
		index = this.value;
		update_drop();
    })

    d3.select(".custom-select3")
	.on("change", function(d) {
		index = this.value;
		update_drop2();
    })
    
    // update the paragraph text to match the selection made by the user
	function update_drop(){
		var selectedCountry = d3.select("#customDropdown")
            .select("select")
            .property("value")
        var selectedYear = d3.select("#customDropdown2")
            .select("select")
            .property("value")
        
        var selectedYear2 = d3.select("#customDropdown3")
            .select("select")
            .property("value")

        // console.log(selectedYear, selectedCountry);
        updateGraph(selectedYear, selectedCountry, selectedYear2);
    }

    function update_drop2(){
        var selectedYear2 = d3.select("#customDropdown3")
            .select("select")
            .property("value")

        // console.log(selectedYear, selectedCountry);
        updateLol(selectedYear2);
    }
    
    function updateGraph(y, c, y2){
            $.getScript("js/donut-chart.js",function(){
                setYearDonut(y);
                setCountryDonut(c);
            });

    }

    function updateLol(y2){
        $.getScript("js/lollipop.js",function(){
            setYearLol(y2); 
        });
    }
    
}