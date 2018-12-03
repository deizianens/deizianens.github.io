// Load data (asynchronously)
//d3_queue
  d3.queue()
  .defer(
        d3.csv, "./data/prevalence-by-mental-and-substance-use-disorder.csv")
  .await(ready);

function ready(error, data){

  if(error) throw error;

  var countries = new Array();
  var j = 0;

  countries[0] = {
    "country": data[0].Entity
  };

  // counts how many countries are there
  for(var i = 1; i<data.length; i++){
    if(countries[j].country != data[i].Entity){
        countries[j+1] = {"country": data[i].Entity};
        j++;
    }
  }

  // create the drop down menu of countries
	var selector = d3.select("#customDropdown")
    .append("select")
    .attr("class", "custom-select")
    .attr("id", "country-selected")
    .selectAll("option")
    .data(countries)
    .enter().append("option")
    .text(function(d) { return d.country; })
    .attr("value", function (d) {
        return d.country;
    });

  // generate a random index value and set the selector to the city
	// at that index value in the data array
	var index = Math.round(Math.random() * data.length);
  d3.select(".custom-select").property("selectedIndex", index);

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
		var selectedDisorder = d3.select("#selectorDisorder")
						.select("select")
						.property("value")
    //console.log(selectedCountry,",", selectedDisorder,",");
    updateGraph(selectedCountry, selectedDisorder);
  }

  function updateGraph(pais, disorder){
    $.getScript("js/visualizacao.js",function(){
      setCountryLine(pais, disorder);
    });
  }
}
