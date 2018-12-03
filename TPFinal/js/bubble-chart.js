// inspired by: https://www.lutzroeder.com/blog/2013-02-23-wealth-of-tech-companies/
/*
    Bubble Chart
    y : happiness
    x: prevalence
    size: deaths
    color: incidence
*/

option = 1;

//top 10 & middle 10(70~80) & bottom 10
countries = ["China", "Indonesia", "Australia", "Togo", "Liberia", "Guinea", "Norway", "Denmark", "Sweden", "Iceland", "Switzerland", "Finland", 
"Azerbaijan", "Croatia", "Estonia", "New Zealand", "Canada", "Netherlands", "Jamaica", "Jordan", "Paraguay", "Syria", "Turkey","Yemen", 
"Philippines", "Burundi", "Madagascar", "Rwanda", "Tanzania", "Benin"];

// Load data (asynchronously)
d3_queue
    .queue()
    .defer(
        d3.csv,
        "./data/world-happiness-report-2015-kaggle.csv" //y axis
    )
    .defer(
        d3.csv,
        "./data/world-happiness-report-2016-kaggle.csv" //y axis
    )
    .defer(
        d3.csv,
        "./data/world-happiness-report-2017-kaggle.csv" //y axis
    )
    .defer(
        d3.csv,
        "./data/prevalence-of-mental-disorders-ihme.csv" //x axis
    )
    .defer(
        d3.csv,
        "./data/prevalence-of-substance-use-disorders-ihme.csv" //x axis
    )
    .defer(
        d3.csv,
        "./data/prevalence-of-self-harm-ihme.csv" //x axis
    )
    .defer(
        d3.csv,
        "./data/deaths-by-mental-disorders-ihme.csv", // size of bubble
    )
    .defer(
        d3.csv,
        "./data/deaths-by-substance-use-ihme.csv", // size of bubble
    )
    .defer(
        d3.csv,
        "./data/deaths-by-self-harm-ihme.csv", // size of bubble
    )
    .defer(
        d3.csv,
        "./data/incidence-of-mental-disorders-ihme.csv", // size of bubble
    )
    .defer(
        d3.csv,
        "./data/incidence-of-substance-use-ihme.csv", // size of bubble
    )
    .defer(
        d3.csv,
        "./data/incidence-of-self-harm-ihme.csv", // size of bubble
    )
    .await(update);


function MotionChart(element) {
    this._selection = {};
    this._radiusScale = d3.scaleSqrt();
    this._element = d3.select(element);
    this.reset();
};
MotionChart.prototype.reset = function () {
    this.stopTransition();
    this._element.selectAll("*").remove();
    this._margin = { top: 5, right: 20, bottom: 80, left: 40 };
    var size = this._element.attr("viewBox").split(" ").slice(2);
    this._elementWidth = parseFloat(size[0]);
    this._elementHeight = parseFloat(size[1]);
    this._diagramWidth = this._elementWidth - this._margin.right - this._margin.left;
    this._diagramHeight = this._elementHeight - this._margin.top - this._margin.bottom;
    this.scale(d3.scaleLinear(), d3.scaleLinear(), null);
};
MotionChart.prototype.data = function(dataSource, label, x, y, radius, color) {
    this._dataSource = JSON.parse(JSON.stringify(dataSource));
    this._labelData = label;
    this._xData = x;
    this._yData = y;
    this._radiusData = radius;
    this._colorData = color;
}
MotionChart.prototype.time = function(start, end) {
    this._startTime = start;
    this._endTime = end;
}
MotionChart.prototype.scale = function(x, y, color) {
    this._xScale = x;
    this._xAxis = d3.axisBottom().scale(this._xScale);
    this._yScale = y;
    this._yAxis = d3.axisLeft().scale(this._yScale);
    if (color) {
        this._colorScale = color;
    }
};
MotionChart.prototype.select = function (label) {
    this._selection[label] = true;
};
MotionChart.prototype.startTransition = function () {
    if (!this._diagram) {
        this.draw();
    }
    this._timeSliderPlayButton.style("display", "none");
    this._timeSliderHead.style("display", "block");
    var startTime = this._startTime.getTime();
    var endTime = this._endTime.getTime();
    var currentTime = this._currentTime.getTime();
    var duration = ((endTime - currentTime) * 20000) / (endTime - startTime);
    var timeInterpolator = d3.interpolate(this._currentTime, this._endTime);
    var self = this;
    this._diagram.transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .tween("date", function () {
            return function (t) {
                self.update(new Date(timeInterpolator(t)));
            };
        })
        .on("end", function () { 
            self.stopTransition(); 
        });
};
MotionChart.prototype.stopTransition = function () {
    if (this._diagram) {
        this._diagram.transition().duration(0);
    }
};
MotionChart.prototype.draw = function () {
    this.createScales();
    this.createColorAxis();
    this.createRadiusAxis();
    this.createTimeSlider();
    this._diagram = this._element.append("g").attr("transform", "translate(" + this._margin.left + "," + this._margin.top + ")");
    this.createRules();
    this.createItems();
};
MotionChart.prototype.createScales = function () {
    var maxRadius = 20;
    var maxLabelWidth = 40;
    var xDomain = this.computeDomain(this._xData);
    var yDomain = this.computeDomain(this._yData);
    this._radiusDomain = this.computeDomain(this._radiusData);
    this._colorDomain = this.computeDomain(this._colorData);
    this.computeTimeDomain();
    var xScale = this._xScale.domain(xDomain).range([1.5 * maxRadius, this._diagramWidth - (1.5 * maxRadius) - maxLabelWidth]);
    this._xScale = this._xScale.domain([xScale.invert(0), xScale.invert(this._diagramWidth)]).range([0, this._diagramWidth]).clamp(true);
    var yScale = this._yScale.domain(yDomain).range([1.5 * maxRadius, this._diagramHeight - (1.5 * maxRadius)]);
    this._yScale = this._yScale.domain([yScale.invert(0), yScale.invert(this._diagramHeight)]).range([this._diagramHeight, 0]).clamp(true);
    this._radiusScale = this._radiusScale.domain([0, this._radiusDomain[1]]).range([2, maxRadius]).clamp(true);
    if (this._colorDomain) {
        var gradient = [
            { "stop": 0.0, "color": "#3e53ff" },
            { "stop": 0.33, "color": "#2ff076" },
            { "stop": 0.5, "color": "#d0ff2f" },
            { "stop": 0.66, "color": "#ffff2f" },
            { "stop": 1.0, "color": "#ff2f2f" }
        ];
        var linearGradient = this._element.append("defs").append("linearGradient").attr("id", "colorGradient").attr("x2", "1");
        gradient.forEach(function (d) { linearGradient.append("stop").attr("offset", d["stop"]).attr("stop-color", d["color"]); });
        var gradientStops = gradient.map(function (d) { return d["stop"]; });
        var gradientColors = gradient.map(function (d) { return d["color"]; });
        this._colorScale = d3.scaleLinear().domain(gradientStops.map(d3.scaleLinear().domain(this._colorDomain).invert)).range(gradientColors);
    }
    if (!this._colorScale) {
        this._colorScale = d3.scale.category10();
    }
};
MotionChart.prototype.createRules = function () {
    var rules = this._diagram.append("g").classed("rules", true);
    // x & y axis
    rules.append("g")
        .classed("axis", true)
        .attr("transform", "translate(0," + this._diagramHeight + ")")
        .call(this._xAxis.tickSize(2, 0, 2).tickFormat(d3.format(".0s")));
    rules.append("g").classed("axis", true)
        .call(this._yAxis.tickSize(2, 0, 2));
    // grid lines
    rules.append("g").classed("grid", true).attr("transform", "translate(0," + this._diagramHeight + ")")
        .call(this._xAxis.tickSize(-this._diagramHeight, 0, -this._diagramHeight).tickFormat(function (value) { return ""; }));
    rules.append("g").classed("grid", true)
        .call(this._yAxis.tickSize(-this._diagramWidth, 0, -this._diagramWidth).tickFormat(function (value) { return ""; }));
    rules.selectAll(".grid line")
        .filter(function (d) { return d == 0; })
        .classed("origin", true);
    // add axis labels
    rules.append("text").attr("text-anchor", "end").attr("x", this._diagramWidth - 3).attr("y", this._diagramHeight - 6).text(this._xData);
    rules.append("text").attr("text-anchor", "end").attr("x", "-3").attr("y", 11).attr("transform", "rotate(-90)").text(this._yData);
};
MotionChart.prototype.createColorAxis = function () {
    if (this._colorDomain) {
        var w = this._diagramWidth * 0.25;
        var x = this._margin.left;
        var y = this._elementHeight - 30;
        var colorScale = d3.scaleLinear().domain(this._colorDomain).range([0, w]);
        var colorTicks = [0, 0.5, 1].map(d3.scaleLinear().domain(this._colorDomain).invert);
        var colorAxis = d3.axisBottom().scale(colorScale).tickSize(2, 0, 2).tickValues(colorTicks);
        var g = this._element.append("g").attr("transform", "translate(" + x + "," + y + ")");
        g.append("g").classed("axis", true).attr("transform", "translate(0,9)").call(colorAxis);
        g.append("rect").attr("y", -3).attr("width", w).attr("height", 10).style("fill", "url(#colorGradient)");
        g.append("text").attr("text-anchor", "start").attr("dy", -8).text(this._colorData);
    }
};
MotionChart.prototype.createRadiusAxis = function () {
    var w = this._diagramWidth * 0.25;
    var x = this._margin.left + ((this._colorDomain) ? (0.32 * this._diagramWidth) : 0);
    var y = this._elementHeight - 30;
    var radiusScale = d3.scaleLinear().domain([0, this._radiusDomain[1]]).range([0, w]);
    var radiusTicks = [0, 0.5, 1].map(d3.scaleLinear().domain([0, this._radiusDomain[1]]).invert);
    var radiusAxis = d3.axisBottom().scale(radiusScale).tickSize(2, 0, 2).tickValues(radiusTicks);
    var g = this._element.append("g").attr("transform", "translate(" + x + "," + y + ")");
    g.append("g").classed("axis", true).attr("transform", "translate(0,9)").call(radiusAxis);
    for (var i = 0; i < 5; i++) {
        g.append("circle").attr("cx", (i * w) / 4).attr("cy", 2).attr("r", i + 1).style("fill", "#888");
    }
    g.append("text").attr("text-anchor", "start").attr("dy", -8).text(this._radiusData);
};
MotionChart.prototype.createTimeSlider = function () {
    var width = this._elementWidth;
    var w = this._diagramWidth * (this._colorDomain ? 0.32 : 0.64);
    var x = width - this._margin.right - w;
    var y = this._elementHeight - 30;
    this._timeScale = d3.scaleTime().domain([this._startTime, this._endTime]).range([0, w]).clamp(true);
    ;
    var ticks = this._colorDomain ? [0, 0.5, 1] : [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
    ticks = ticks.map(d3.scaleLinear().domain([this._startTime, this._endTime]).invert);
    var timeTicks = [];
    for (var i = 0; i < ticks.length; i++) {
        timeTicks[i] = new Date(ticks[i]);
    }
    var timeAxis = d3.axisBottom().scale(this._timeScale)
        .tickSize(11, 0, 11)
        .tickValues(timeTicks)
        .tickFormat(function (value) { return value.getFullYear(); });
    var g = this._element.append("g").classed("slider", true).attr("transform", "translate(" + x + "," + y + ")");
    var self = this;
    g.append("g").classed("axis", true).call(timeAxis);
    var rect = function () { return g.append("rect").attr("rx", 2).attr("ry", 2).attr("y", -1).attr("x", -3).attr("height", 6); };
    rect().classed("background", true).attr("width", w + 6);
    this._timeSlider = rect().classed("progress", true);
    rect().attr("width", w + 6).style("fill", "none").style("stroke", "#888");
    this._timeSliderPosition = g.append("g");
    this._timeSliderPosition.append("line").attr("y2", -8).style("stroke", "#888");
    this._timeSliderPosition.append("text").attr("y", -10).attr("text-anchor", "middle");
    this._timeSliderHead = g.append("g").attr("pointer-events", "all").attr("cursor", "ew-resize");
    this._timeSliderHead.append("circle").attr("cy", 2).attr("r", 4).style("fill", "none").style("stroke", "#888").style("stroke-width", "5.5px");
    this._timeSliderHead.append("circle").attr("cy", 2).attr("r", 20).style("fill", "none").style("opacity", 1);
    this._timeSliderHead.style("display", "none");
    this._timeSliderHead.call(d3.drag()
        .on("start", function () {
        self._timeSliderDragged = false;
    })
        .on("drag", function () {
        self._timeSliderDragged = true;
        self.stopTransition();
        var date = self._timeScale.invert(d3.event.x);
        self.update(date);
    })
        .on("end", function () {
        if (self._timeSliderDragged && (self._endTime.getTime() - self._currentTime.getTime()) > 0) {
            self._timeSliderPlayButton.style("display", "block");
            self._timeSliderHead.style("display", "none");
        }
    }));
    this._timeSliderPlayButton = g.append("g").attr("transform", "translate(0,2)").attr("pointer-events", "all").attr("cursor", "pointer");
    this._timeSliderPlayButton.append("circle").attr("cy", 0).attr("r", 6).classed('background', true).style("stroke", "#888");
    this._timeSliderPlayButton.append("circle").attr("cy", 0).attr("r", 20).style("fill", "none").style("opacity", 1);
    this._timeSliderPlayButton.append("polygon").attr("points", "-2,-3 -2,3 4,0").style("fill", "#888");
    this._timeSliderPlayButton
        .on("click", function () {
        self.startTransition();
    });
};
MotionChart.prototype.updateTimeSlider = function (date) {
    var x = this._timeScale(date);
    this._timeSlider.attr("width", x + 6);
    this._timeSliderHead.attr("transform", "translate(" + x + ",0)");
    this._timeSliderPosition.attr("transform", "translate(" + x + ",0)");
    this._timeSliderPosition.selectAll("text").text(date.getFullYear());
    this._timeSliderPlayButton.attr("transform", "translate(" + x + ",2)");
    if ((this._endTime.getTime() - date.getTime()) <= 0) {
        this._timeSliderHead.style("display", "block");
        this._timeSliderPlayButton.style("display", "none");
    }
};
MotionChart.prototype.createItems = function () {
    var self = this;
    this._items = this._diagram.append("g").selectAll(".item")
        .data(this._dataSource)
        .enter()
        .append("g")
        .classed("element", true)
        .each(function (item) {
            var label = item[self._labelData];
            var g = d3.select(this);
            g.classed("selection", self._selection[label]);
            g.append("text").classed("label", true).attr("y", 1).text(label);
            g.append("circle");
        })
        .on("click", function () {
            d3.select(this).classed("selection", !d3.select(this).classed("selection"));
        });
    this.update(this._startTime);
};
MotionChart.prototype.computeDomain = function (axis) {
    var self = this;
    var hasValue = true;
    self._dataSource.forEach(function (item) {
        if (!(item[axis] instanceof Array) || (typeof item[axis] == "number")) {
            console.log("UGH");
        }
        hasValue = hasValue && (item[axis] instanceof Array) || (typeof item[axis] == "number");
    });
    if (!hasValue) {
        return null;
    }

    var min, max;
    if(axis == "Prevalence of Mental Disorders"){
        min = 10000;
        max = 16500;
    }
    else if(axis == "Happiness Score"){
        min = 3;
        max = 8;
    }
    else if(axis == "Deaths by Mental Disorders"){
        min = 0;
        max = 0.1;
    }
    else if(axis == "Incidence of Mental Disorders"){
        min = 4000;
        max = 6000;
    }
    else{
        min = d3.min(this._dataSource, function (item) { return (typeof item[axis] == "number") ? item[axis] : d3.min(item[axis], function (pair) { return pair[1]; }); });
        max = d3.max(this._dataSource, function (item) { return (typeof item[axis] == "number") ? item[axis] : d3.max(item[axis], function (pair) { return pair[1]; }); });
    }
    // console.log(min);
    self._dataSource.forEach(function (item) {
        // Convert time series into a multi-value D3 scale and cache time range.
        if (item[axis] instanceof Array) {
            var dates = item[axis].map(function (d) { return d[0]; }).map(function (date) { return self.createDate(date); });
            var values = item[axis].map(function (d) { return d[1]; });
            if (self._endTime && dates[dates.length - 1] < self._endTime) {
                dates.push(self._endTime);
                values.push(values[values.length - 1]);
            }
            item[axis] = d3.scaleTime().domain(dates).range(values);
            item[axis]["__min"] = dates[0];
            item[axis]["__max"] = dates[dates.length - 1];
        }
    });
    return [min, max];
};
MotionChart.prototype.createDate = function (date) {
    if (typeof date == "number") {
        return new Date(date, 0, 1);
    }
    if (typeof date == "string") {
        return new Date(date);
    }
    return date;
};
MotionChart.prototype.computeTimeDomain = function () {
    var self = this;
    var startTime = this._startTime;
    var endTime = this._endTime;
    var axes = [self._xData, self._yData, self._radiusData, self._colorData];
    axes.forEach(function (axis) {
        self._dataSource.forEach(function (item) {
            var data = item[axis];
            if (!(typeof data == "number") && !(typeof data == "string")) {
                data.domain().forEach(function (value) {
                    if (!self._startTime && (!startTime || startTime > value)) {
                        startTime = value;
                    }
                    if (!self._endTime && (!endTime || endTime < value)) {
                        endTime = value;
                    }
                });
            }
        });
    });
    this._startTime = startTime;
    this._endTime = endTime;
};
MotionChart.prototype.hasValue = function (item, axis, date) {
    var data = item[axis];
    if ((typeof data == "number") || (typeof data == "string")) {
        return true;
    }
    return (date >= data["__min"] && date <= data["__max"]);
};
MotionChart.prototype.computeValue = function (item, axis, date) {
    var data = item[axis];
    if (!!data && data.constructor && data.call && data.apply) {
        return data(date);
    }
    return data;
};
MotionChart.prototype.update = function (date) {
    this._currentTime = date;
    this.updateTimeSlider(date);
    var self = this;
    this._items.each(function (data) {
        if (self.hasValue(data, self._xData, date) &&
            self.hasValue(data, self._yData, date) &&
            self.hasValue(data, self._radiusData, date)) {
            var x = self._xScale(self.computeValue(data, self._xData, date));
            var y = self._yScale(self.computeValue(data, self._yData, date));
            var r = self.computeValue(data, self._radiusData, date);
            var radius = self._radiusScale((r < 0) ? 0 : r);
            var color = self.hasValue(data, self._colorData, date) ? self._colorScale(self.computeValue(data, self._colorData, date)) : "#fff";
            var textPosition = 1 + (1.1 * radius);
            d3.select(this).style("display", "block");
            d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
            d3.select(this).selectAll("circle").attr("r", radius).style("fill", color);
            d3.select(this).selectAll("text").attr("transform", "translate(" + textPosition + ",0)");
        }
        else {
            d3.select(this).style("display", "none");
        }
    });
    this._items.sort(function (a, b) {
        return b[self._radiusData] - a[self._radiusData];
    });
};


function update(error, h1, h2, h3, p1, p2, p3, d1, d2, d3, i1, i2, i3) {
    if (error) throw error;
    var selector = document.getElementById("selector");
    var chart = new MotionChart(document.getElementById("chart"));

    var d1f = new Array(); //y axis (happiness score)
    var d2f = new Array(); //size of bubble (deaths)
    var d3f = new Array(); //x axis  (prevalence)
    var d4f = new Array(); //color  (incidence)
    
    var numYears = 3;
    var j = 0;
    //keep only the countries and years of interest
    function keepIt(y){
        for(var i = 0; i<countries.length; i++){
            if(y.Location == countries[i]){
                return ((y.Year == 2017 || y.Year == 2016 || y.Year == 2015));
            }
        }
        return false;
    }

    //transform it in array form
    function formatThing(x){
        return [x.Year, parseFloat(x.Value)];
    }

    // puts happiness array in the same format as other files
    function formatThing2(d){
        var aux = new Array();
        var flag = 1;
        for(var i = 0; i<d.length; i++){
            if(d[i].Location == countries[j]){
                aux.push([d[i].Year, parseFloat(d[i].Value)]);
                i = (flag*20)-1;
                flag++;
                if (flag == 4){
                    flag = 1;
                    j++;
                    i = -1;
                }
               
                if(j==countries.length){
                    return aux;
                }
            }
        }
    }
    
    d1f = h1.concat(h2, h3);
    if(option==1){
        d2f = d1.filter(keepIt);
        d3f = p1.filter(keepIt);
        d4f = i1.filter(keepIt);
    }else if(option==2){
        d2f = d2.filter(keepIt);
        d3f = p2.filter(keepIt);
        d4f = i2.filter(keepIt);
    }
    else{
        d2f = d3.filter(keepIt);
        d3f = p3.filter(keepIt);
        d4f = i3.filter(keepIt);
    }

    d1f = d1f.filter(keepIt);
    d1f = formatThing2(d1f);
    // console.log(d2f);
    d2f = d2f.map(formatThing);
    d3f = d3f.map(formatThing);
    d4f = d4f.map(formatThing);
    // console.log(d1f);
    axis_name = ["Mental Disorders", "Substance Use", "Self Harm"]

    var data_all = [];
    
    for(var i = 0; i < countries.length; i++){
        data_all[i] = {
            "Name": countries[i],
            "Prevalence of Mental Disorders": d3f.slice((numYears*i), (numYears*(i+1))),
            "Happiness Score": d1f.slice((numYears*i), (numYears*(i+1))),
            "Deaths by Mental Disorders": d2f.slice((numYears*i), (numYears*(i+1))),
            "Incidence of Mental Disorders": d4f.slice((numYears*i), (numYears*(i+1)))
        }
    }
    
    // var data = data_all.slice(50, 100);
    var data = data_all
    // console.log(data);

    var axes = selector.options[selector.selectedIndex].value.split(",").map(function (text) { return text.trim(); });
    chart.reset();
    chart.data(data, "Name", axes[0], axes[1], axes[2], axes[3]);
    chart.time(new Date("2015/12/31"), new Date("2017/12/31"));
    chart.select("New Zealand");
    chart.select("Sweden");
    chart.select("Switzerland");
    chart.select("Netherlands");
    chart.select("Israel");
    chart.select("Haiti");
    chart.select("Uganda");
    chart.select("Costa Rica");
    chart.select("Portugal");
    chart.select("India");
    chart.draw();
    chart.startTransition();
}

update();
selector.addEventListener("change", function() {
    update();
});