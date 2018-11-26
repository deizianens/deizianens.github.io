var country = "Brazil";
var yearDonut = 1990;

function update(){
// d3.selectAll(".pie").remove();
d3_queue
    .queue()
    .defer(
        d3.csv,
        "./data/suicide-death-rate-by-age-wid.csv"
    )
    .await(ready_donut);
}

update();

function ready_donut(error, data) {
    if (error) throw error;
    
    d3.selectAll(".pie").remove();

    var idx = -1;
    // find country index on array
    for(var i = 0; i<data.length; i++){
        if(data[i].Entity == country){
            if(data[i].Year == yearDonut){
                idx = i;
            }
        }
    }
    // console.log(idx);
    bakeDonut(data[idx]);
}

function bakeDonut(d) {
  
    document.getElementById("country-name-h3").innerHTML = country +", "+yearDonut;
    let sum = parseFloat(d.SeventyPlus) + parseFloat(d.FiftyToSixtyNine) + parseFloat(d.FifteenToFourtyNine) + parseFloat(d.FiveToFourteen); 
    console.log(d.SeventyPlus +" "+ d.FifteenToFourtyNine +" "+ d.Entity);
    const pieData = [
        {name: 'Age: 70+', value: parseFloat((d.SeventyPlus*100)/sum).toFixed(1), color: '#225ea8'},
        {name: 'Age: 50-69', value: parseFloat((d.FiftyToSixtyNine*100)/sum).toFixed(1), color: '#41b6c4'},
        {name: 'Age: 15-49', value: parseFloat((d.FifteenToFourtyNine*100)/sum).toFixed(1), color: '#a1dab4'},
        {name: 'Age: 5-14', value: parseFloat((d.FiveToFourteen*100)/sum).toFixed(1), color: '#ffffcc'},
    ];

    
    let activeSegment;
    const data = pieData.sort( (a, b) => b['value'] - a['value']),
          viewWidth = 500,
          viewHeight = 300,
          svgWidth = viewHeight,
          svgHeight = viewHeight,
          thickness = 40,
          colorArray = data.map(k => k.color),
          el = d3.select('#donut'),
          radius = Math.min(svgWidth, svgHeight) / 2,
          color = d3.scaleOrdinal()
            .range(colorArray);
  
    const max = d3.max(pieData, (maxData) => maxData.value );
    // console.log(max);
    const svg = el.append('svg')
    .attr('viewBox', `0 0 ${viewWidth + thickness} ${viewHeight + thickness}`)
    .attr('class', 'pie')
    .attr('width', viewWidth)
    .attr('height', svgHeight);
  
    const g = svg.append('g')
    .attr('transform', `translate( ${ (svgWidth / 2) + (thickness / 2) }, ${ (svgHeight / 2) + (thickness / 2)})`);
  
    const arc = d3.arc()
    .innerRadius(radius - thickness)
    .outerRadius(radius);
  
    const arcHover = d3.arc()
    .innerRadius(radius - ( thickness + 5 ))
    .outerRadius(radius + 8);
  
    const pie = d3.pie()
    .value(function(pieData) { return pieData.value; })
    .sort(null);
  
  
    const path = g.selectAll('path')
    .attr('class', 'data-path')
    .data(pie(data))
    .enter()
    .append('g')
    .attr('class', 'data-group')
    .each(function(pathData, i) {
      const group = d3.select(this)
  
      group.append('text')
        .text(`${pathData.data.value}%`)
        .attr('class', 'data-text data-text__value')
        .attr('text-anchor', 'middle')
        .attr('dy', '.2rem')
  
      group.append('text')
        .text(`${pathData.data.name}`)
        .attr('class', 'data-text data-text__name')
        .attr('text-anchor', 'middle')
        .attr('dy', '3.5rem')
        

      // Set default active segment
      if (pathData.value == max) {
        const textVal = d3.select(this).select('.data-text__value')
        .classed('data-text--show', true);
  
        const textName = d3.select(this).select('.data-text__name')
        .classed('data-text--show', true);
      }
  
    })
    .append('path')
    .attr('d', arc)
    .attr('fill', (fillData, i) => color(fillData.data.name))
    .attr('class', 'data-path')
    .on('mouseover', function() {
      const _thisPath = this,
            parentNode = _thisPath.parentNode;
  
      if (_thisPath != activeSegment) {
  
        activeSegment = _thisPath;
  
        const dataTexts = d3.selectAll('.data-text')
        .classed('data-text--show', false);
  
        const paths = d3.selectAll('.data-path')
        .transition()
        .duration(250)
        .attr('d', arc);
  
        d3.select(_thisPath)
          .transition()
          .duration(250)
          .attr('d', arcHover);
  
        const thisDataValue = d3.select(parentNode).select('.data-text__value')
        .classed('data-text--show', true);
        const thisDataText = d3.select(parentNode).select('.data-text__name')
        .classed('data-text--show', true);
      }
  
  
    })
    .each(function(v, i) {
      if (v.value === max) {
        const maxArc = d3.select(this)
        .attr('d', arcHover);
        activeSegment = this;
      }
      this._current = i;
    });
  
    const legendRectSize = 15;
    const legendSpacing = 10;
  
    const legend = svg.selectAll('.legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(legendData, i) {
      const itemHeight =    legendRectSize + legendSpacing;
      const offset =        legendRectSize * color.domain().length;
      const horz =          svgWidth + 80;
      const vert =          (i * itemHeight) + legendRectSize + (svgHeight - offset) / 2;
      return `translate(${horz}, ${vert})`;
    });
  
    legend.append('circle')
      .attr('r', legendRectSize / 2)
      .style('fill', color);
  
    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .attr('class', 'legend-text')
      .text( (legendData) => legendData )
  }
  
  function setYearDonut(y){
      yearDonut = y;
      // update();
  }

  function setCountryDonut(c){
    country = c;
    console.log(c);
}