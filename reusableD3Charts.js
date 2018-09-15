function renderMultiLineChart(inputCSVData, chartDiv, xAxisLabel, yAxisLabel, graphCadence){

  var margin = {top: 20, right: 100, bottom: 80, left: 100},
      width = 640 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
  
  var parseDate = function(dateString){
    if(graphCadence == "Monthly"){
      var date = new Date(dateString);
      date.setDate(date.getDate()+1);
      return date;
    }
    return d3.timeParse("%m/%d/%y")(dateString);
  }
  
  var x = d3.scaleUtc()
      .range([0, width]);
  
  var y = d3.scaleLinear()
      .range([height, 0]);
  
  var color = d3.scaleOrdinal(d3.schemeCategory20);
  
  switch(graphCadence) {
      case "Daily":
          var xAxis  = d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat("%m/%d"))
          break;
      case "Weekly":
          var xAxis  = d3.axisBottom(x).ticks(d3.timeSaturday.every(1)).tickFormat(d3.timeFormat("%m/%d"))
          break;
      case "Weekly-sat":
          var xAxis  = d3.axisBottom(x).ticks(d3.timeSaturday.every(1)).tickFormat(d3.timeFormat("%m/%d"))
          break;
      case "Weekly-sun":
          var xAxis  = d3.axisBottom(x).ticks(d3.timeSunday.every(1)).tickFormat(d3.timeFormat("%m/%d"))
          break;
      case "Weekly-mon":
          var xAxis  = d3.axisBottom(x).ticks(d3.timeMonday.every(1)).tickFormat(d3.timeFormat("%m/%d"))
          break;
      case "Weekly-tue":
          var xAxis  = d3.axisBottom(x).ticks(d3.timeTuesday.every(1)).tickFormat(d3.timeFormat("%m/%d"))
          break;
      case "Weekly-wed":
          var xAxis  = d3.axisBottom(x).ticks(d3.timeWednesday.every(1)).tickFormat(d3.timeFormat("%m/%d"))
          break;
      case "Weekly-thu":
          var xAxis  = d3.axisBottom(x).ticks(d3.timeThursday.every(1)).tickFormat(d3.timeFormat("%m/%d"))
          break;
      case "Weekly-fri":
          var xAxis  = d3.axisBottom(x).ticks(d3.timeFriday.every(1)).tickFormat(d3.timeFormat("%m/%d"))
          break;
      case "Monthly":
          var xAxis  = d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.utcFormat("%m/%d"))
          break;
  }
  
  var yAxis = d3.axisLeft(y);
  
  var line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.count); })
  
  var div = d3.select(chartDiv).append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  
  var svg = d3.select(chartDiv).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //https://pharos-rest-service-iad.iad.proxy.amazon.com/s3/tool.csv
  d3.csv(inputCSVData, function(error, data) {
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));
  
    //var cutoffDate = new Date();
    //cutoffDate.setDate(cutoffDate.getDate() - 42);
              
    //var dates = getDates(cutoffDate,new Date())

    //data = filterJSON(data, 'date', dates);

    data.forEach(function(d) {
      //console.log(d);
      d.date = parseDate(d.date);
    });
  
    var datapoints = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {date: d.date, count: +d[name]};
        })
      };
    });
  
    x.domain(d3.extent(data, function(d) { return d.date; }));
  
    y.domain([
      d3.min(datapoints, function(c) { return d3.min(c.values, function(v) { return v.count; }); }),
      d3.max(datapoints, function(c) { return d3.max(c.values, function(v) { return v.count; }); })
    ]);
  
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")  
        .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .style("text-anchor", "end")
          .attr("transform", "rotate(-45)");
  
      // text label for the x axis
     svg.append("text")             
            .attr("transform",
                  "translate(" + (width + 5) + " ," + 
                                 (height + margin.top - 5) + ")")
            .style("text-anchor", "right").attr("font-size", "12px")
            .text(xAxisLabel);
  
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-4em")
        .attr("dx", "-10em")
        .attr("font-size", "12px")
        .style("text-anchor", "end")
        .style("fill", "black")    // set the line colour
        .text(yAxisLabel);
  
    var datapoint = svg.selectAll(".datapoint")
        .data(datapoints)
      .enter().append("g")
        .attr("class", "datapoint");
  
    datapoint.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); });
  
    j = -1;
    var formatTime = d3.timeFormat("%B %d, %Y");
    datapoint.selectAll("circle")
      .data(function(d){return d.values})
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("cx", function(d,i) { return x(d.date); })
      .attr("cy", function(d) { return y(d.count); })
      .on("mouseover", function(d) {
        console.log("---")
          console.log(svg)
          console.log("---")
           div.transition()
             .duration(20)
             .style("opacity", 1);
              div.html("<b>Date : "+formatTime(d.date)+"</b>" +"<br>"+ "<b>Count : "+d.count+"</b>")
              //.style("left", "120px")
              //.style("top", "30px");
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
           })
         .on("mouseout", function(d) {
           div.transition()
             .duration(500)
             .style("opacity", 0);
           })
      .style("fill", function(d,i) { if (i == 0) { j++ }; return color(datapoints[j].name); });
  
  var legendRectSize = 8;
  var legendSpacing = 140;
  var yL = 0;
  
  var legendHolder = svg.append('g')
    .attr('transform', "translate(" + (20) + ","+(height+margin.bottom-35)+")")
  
  var legend = legendHolder.selectAll('.legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr("transform", function (d, i) {
               if (i === 0) {
                  dataL = legendRectSize + legendSpacing

                  return "translate(0,0)"
              } else { 
               var newdataL = dataL
               dataL +=  legendRectSize + legendSpacing

               if(newdataL > width)
               {
                  yL = yL + 20;
                  newdataL = 0;
                  dataL = legendRectSize + legendSpacing;
               }

               console.log("newdataL " + newdataL);
               console.log("dataL " + dataL);

               return "translate(" + (newdataL) +","+ yL +")";
             }
          });
  
  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', color)
    .style('stroke', color);
  
  legend.append('text')
    .attr('x', legendRectSize + 5)
    .attr('y', legendRectSize)
    .text(function(d) { return d; });
  
  
  });
  }
  
  function filterJSON(json, key, value) {
    var result = [];
    json.forEach(function(val,idx,arr){
      if(value.includes(val[key])){
        result.push(val)
      }
    })
    return result;
  }
  
  Date.prototype.addDays = function(days) {
      var date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
  }
  
  function getDates(startDate, stopDate) {
      var dateArray = new Array();
      var currentDate = startDate;
      while (currentDate <= stopDate) {
          dateArray.push(new Date (currentDate).toLocaleString('en-US', {day:"2-digit" ,month:"2-digit",year:"2-digit"}).split(",")[0]);
          currentDate = currentDate.addDays(1);
      }
      return dateArray;
  }
  
  function renderTable(inputCSVData, chartDiv){
      d3.text(inputCSVData, function(data) {
          var parsedCSV = d3.csvParseRows(data);
          console.log(parsedCSV);
          var container = d3.select(chartDiv)
              .append("table").attr("border","2").attr("th","").attr("font-weight","bold")
  
              .selectAll("tr")
                  .data(parsedCSV).enter()
                  .append("tr")
  
              .selectAll("td")
                  .data(function(d) { return d; }).enter()
                  .append("td")
                  .text(function(d) { return d; });
      });
  }
  
  function transpose(a) {
  
    // Calculate the width and height of the Array
    var w = a.length || 0;
    var h = a[0] instanceof Array ? a[0].length : 0;
  
    // In case it is a zero matrix, no transpose routine needed.
    if(h === 0 || w === 0) { return []; }
  
    /**
     * @var {Number} i Counter
     * @var {Number} j Counter
     * @var {Array} t Transposed data is stored in this array.
     */
    var i, j, t = [];
  
    // Loop through every item in the outer array (height)
    for(i=0; i<h; i++) {
  
      // Insert a new row (array)
      t[i] = [];
  
      // Loop through every item per item in outer array (width)
      for(j=0; j<w; j++) {
  
        // Save transposed data.
        t[i][j] = a[j][i];
      }
    }
  
    return t;
  }
  
  function renderTransposedTable(inputCSVData, chartDiv){
      d3.text(inputCSVData, function(data) {
          var parsedCSV = d3.csvParseRows(data);
          //console.log(parsedCSV);
          var container = d3.select(chartDiv)
              .append("table").attr("border","2").attr("th","").attr("font-weight","bold")
  
              .selectAll("tr")
                  .data(transpose(parsedCSV)).enter()
                  .append("tr")
  
              .selectAll("td")
                  .data(function(d) { return d; }).enter()
                  .append("td")
                  .text(function(d) { return d; });
      });
  }
  
  function renderTableJson(inputJSONData, chartDiv, headers) {
    d3.json(inputJSONData, function (error,data) {
  
      function tabulate(data, columns) {
        var table = d3.select(chartDiv).attr("border","2")
        var thead = table.append('thead')
        var tbody = table.append('tbody');
  
        // append the header row
        thead.append('tr')
          .selectAll('th')
          .data(columns).enter()
          .append('th')
            .text(function (column) { return column; });
  
        // create a row for each object in the data
        var rows = tbody.selectAll('tr')
          .data(data)
          .enter()
          .append('tr');
  
        // create a cell in each row for each column
        var cells = rows.selectAll('td')
          .data(function (row) {
            return columns.map(function (column) {
              return {column: column, value: row[column]};
            });
          })
          .enter()
          .append('td')
            .text(function (d) { return d.value; });
  
        return table;
      }
  
      // render the table(s)
  
      "response" in data ? tabulate(data.response, headers): tabulate(data, headers)
  
    });
  }


function renderStackedBarChartWithTimeSlider(datafile, chartDiv, xAxisLabel, yAxisLabel, graphCadence){
    var margin = { top: 20, right: 20, bottom: 90, left: 100},
        margin2 = { top: 330, right: 20, bottom: 30, left: 100 },
        width = 550 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        height2 = 400 - margin2.top - margin2.bottom;

    var parseTime = d3.timeParse("%m/%d/%y");

    var x = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory20);


    switch(graphCadence) {
        case "Daily":
            var xAxis  = d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat("%m/%d"))
            break;
        case "Weekly":
            var xAxis  = d3.axisBottom(x).ticks(d3.timeSaturday.every(1)).tickFormat(d3.timeFormat("%m/%d"))
            break;
        case "Monthly":
            var xAxis  = d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.utcFormat("%m/%d"))
            break;
    }
  

    var xAxis2 = d3.axisBottom(x2).tickSize(0),
        yAxis = d3.axisLeft(y).tickSize(0);


    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    var chart = d3.select(chartDiv).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    chart.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    // text label for the x axis
    chart.append("text")             
        .attr("transform",
              "translate(" + (width + 50) + " ," + 
                             (height + margin.top + 15) + ")")
        .style("text-anchor", "right").attr("font-size", "10px")
        .text(xAxisLabel);

    chart.append("g")
        .attr("class", "axis axis--y")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "5em")
        .attr("dx", "-10em")
        .attr("font-size", "12px")
        .style("text-anchor", "end")
        .style("fill", "black")    // set the line colour
        .text(yAxisLabel);

  
    var focus = chart.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = chart.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    d3.csv(datafile, function (d, i, columns) {
        for (i = 1, t = 0; i < columns.length; ++i) 
        t += d[columns[i]] = +d[columns[i]];
        d.total = t;
        return d;
    }, function (error, data) {
        if (error) throw error;
        var numberofRows = data.length
        data.forEach(function (d) {
            d.date = parseTime(d.date);
        });
          
        var xMin = d3.min(data, function (d) { return d.date; }),
            xMax = d3.max(data, function (d) { return d.date; }),
            yMax = d3.max(data, function (d) { return d.total; }),
            keys = data.columns.slice(1),
            data = d3.stack().keys(keys)(data);
            
        x.domain([xMin, xMax.setDate(xMax.getDate() - 3)]);
        y.domain([0, yMax]);
        x2.domain(x.domain());
        y2.domain(y.domain())
        z.domain(keys);

        var tooltip = chart.append("g")
            .attr("class", "tooltip")
            .style("display", "none");

        tooltip.append("rect")
            .attr("width", 60)
            .attr("height", 20)
            .attr("fill", "white")
            .style("opacity", 0.5);

        tooltip.append("text")
            .attr("x", 30)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

        var messages = focus.append("g");
        messages.attr("clip-path", "url(#clip)");
        messages.selectAll("message")
            .data(data)
            .enter().append("g")
            .attr("fill", function (d) { return z(d.key); })
            .selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("x", function (d) { return x(d.data.date); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", 15)
            .on("mouseover", function () { tooltip.style("display", null); })
            .on("mouseout", function () { tooltip.style("display", "none"); })
            .on("mousemove", function (d) {
                var xPosition = d3.mouse(this)[0] + 70;
                var yPosition = d3.mouse(this)[1] - 5;
                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                tooltip.select("text").text(d[1] - d[0]);
            });

        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "1em")
            .attr("transform", "translate(26," + 0 + ")")
        
        focus.selectAll("line")
             .attr("transform", "translate(0," + 0 + ")")

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis)

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, [width - ((width/numberofRows) * 6.2), width]);

        var legend = chart.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 8)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice())
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(0," + i * 15 + ")"; });

        legend.append("rect")
            .attr("x", width + 80)
            .attr("y", margin.top)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width + 100)
            .attr("y", margin.top + 10)
            .style("text-anchor", "start")
            .text(function (d) { return d; });

    });

    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
        var s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));

        focus.selectAll("rect")
            .attr("x", function (d) { return x(d.data.date); })

        focus.select(".axis--x").call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "1em")
            .attr("transform", "translate(26," + 0 + ")")
            

        focus.selectAll("line")
             .attr("transform", "translate(7," + 0 + ")")
     
    }

    chart.attr("width", width + 200);
}

function renderNormalizedStackedBarChartWithTimeSlider(datafile, chartDiv, xAxisLabel, yAxisLabel, graphCadence){
    var margin = { top: 20, right: 20, bottom: 90, left: 100},
        margin2 = { top: 330, right: 20, bottom: 30, left: 100 },
        width = 550 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        height2 = 400 - margin2.top - margin2.bottom;

    var parseTime = d3.timeParse("%m/%d/%y");

    var x = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory20);


    switch(graphCadence) {
        case "Daily":
            var xAxis  = d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat("%m/%d"))
            break;
        case "Weekly":
            var xAxis  = d3.axisBottom(x).ticks(d3.timeSaturday.every(1)).tickFormat(d3.timeFormat("%m/%d"))
            break;
        case "Monthly":
            var xAxis  = d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.utcFormat("%m/%d"))
            break;
    }
    
    var xAxis2 = d3.axisBottom(x2).tickSize(0),
        yAxis = d3.axisLeft(y)
                  .tickSize(0)
                  .tickFormat(d3.format(".0%"));
    
    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    var chart = d3.select(chartDiv).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    chart.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    // text label for the x axis
    chart.append("text")             
        .attr("transform",
              "translate(" + (width + 50) + "," + 
                             (height + margin.top + 15) + ")")
        .style("text-anchor", "right").attr("font-size", "10px")
        .text(xAxisLabel);

    chart.append("g")
        .attr("class", "axis axis--y")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "5em")
        .attr("dx", "-10em")
        .attr("font-size", "12px")
        .style("text-anchor", "end")
        .style("fill", "black")    // set the line colour
        .text(yAxisLabel);

    var focus = chart.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = chart.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    d3.csv(datafile, function (d, i, columns) {
        for (i = 1, t = 0; i < columns.length; ++i) 
        t += d[columns[i]] = +d[columns[i]];
        d.total = t;
        return d;
    }, function (error, data) {
        if (error) throw error;
        var numberofRows = data.length
        data.forEach(function (d) {
            d.date = parseTime(d.date); 
        });

        var keys = data.columns.slice(1);
        
        var xMin = d3.min(data, function (d) { return d.date; }),
            xMax = d3.max(data, function (d) { return d.date; }),
            yMax = d3.max(data, function (d) { return d.total; }),
            data = d3.stack()
                        .offset(d3.stackOffsetExpand)
                        .keys(keys)(data);
    

        x.domain([xMin, xMax.setDate(xMax.getDate() - 3)]);
        x2.domain(x.domain());
        y2.domain(y.domain());
        z.domain(keys);
        var formatPercent = d3.format(",.2%");

        var tooltip = chart.append("g")
            .attr("class", "tooltip")
            .style("display", "none");

        tooltip.append("rect")
            .attr("width", 60)
            .attr("height", 20)
            .attr("fill", "white")
            .style("opacity", 0.5);

        tooltip.append("text")
            .attr("x", 30)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")

        var messages = focus.append("g");
        messages.attr("clip-path", "url(#clip)");
        messages.selectAll("message")
            .data(data)
            .enter().append("g")
            .attr("fill", function (d) { return z(d.key); })
            .selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("x", function (d) { return x(d.data.date); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", 15)
            .on("mouseover", function () { tooltip.style("display", null); })
            .on("mouseout", function () { tooltip.style("display", "none"); })
            .on("mousemove", function (d) {
                var xPosition = d3.mouse(this)[0] + 70;
                var yPosition = d3.mouse(this)[1] - 5;
                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                tooltip.select("text").text(formatPercent(d[1] - d[0]));
            });

        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "1em")
            .attr("transform", "translate(26," + 0 + ")")
        
        focus.selectAll("line")
             .attr("transform", "translate(7," + 0 + ")")

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, [width - ((width/numberofRows) * 6.2), width]);

        var legend = chart.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 8)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(0," + i * 15 + ")"; });

        legend.append("rect")
            .attr("x", width + 80)
            .attr("y", margin.top)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width + 100)
            .attr("y", margin.top + 10)
            .style("text-anchor", "start")
            .text(function (d) { return d; });

    });

    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
        var s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));

        focus.selectAll("rect")
            .attr("x", function (d) { return x(d.data.date); })

        focus.select(".axis--x").call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "1em")
            .attr("transform", "translate(26," + 0 + ")")

        focus.selectAll("line")
             .attr("transform", "translate(7," + 0 + ")")
     }

    chart.attr("width", width + 200);
}