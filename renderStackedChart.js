/* 
A javascript function that can be used to render a stacked chart on a webpage. The stack will be generated in the output based on columns used after the first column.

Sample function call :
renderStackedChart("../test/chartData.tsv", "#chartDiv", "Player", "Games Played")

Sample input file (Tab separated) :

PLAYER	WON	LOST
Yogi	9	2
Steve	3	7
Mark	3	2
Bill	7	3

*/

function renderStackedChart(datafile, id_selector, xaxis, yaxis) {
    //setting margin for the graph
    var margin = {
            top: 30,
            right: 20,
            bottom: 30,
            left: 80
        },
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // setting  x and y axis attributes
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .6, .3);

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    // specifying color range to be used for each stack layer
    var color = d3.scale.ordinal()
        .range(["#b38751", "#8c6a3f", "#664d2e", "#40301d"]);

    // initializing the svg
    var svg = d3.select(id_selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // reading the tsv
    d3.tsv(datafile, function (error, data) {
        console.log(data);
        var labelVar = xaxis;
        var varNames = d3.keys(data[0]).filter(function (key) {
            return key !== labelVar;
        });
        color.domain(varNames);

        data.forEach(function (d) {
            var y0 = 0;
            // d is the data object that is used to refer to the mapping values
            // d.mapping is an array of objects containing sets of data
            d.mapping = varNames.map(function (labelValue) {
                return {
                    labelValue: labelValue,
                    label: d[labelVar],
                    y0: y0,
                    y1: y0 += +d[labelValue]
                };
            });
            d.total = d.mapping[d.mapping.length - 1].y1;
        });

        x.domain(data.map(function (d) {
            return d.marketplace;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.total;
        })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("y", -7)
            .attr("x", width + 90)
            .attr("dy", "2em")
            .style("text-anchor", "end")
            .style("font-size", "14px")
            .text(xaxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(yaxis);

        var selection = svg.selectAll(".series")
            .data(data)
            .enter().append("g")
            .attr("class", "series")
            .attr("transform", function (d) {
                return "translate(" + x(d.marketplace) + ",0)";
            });

        selection.selectAll("rect")
            .data(function (d) {
                return d.mapping;
            })
            .enter().append("rect")
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
                return y(d.y1);
            })
            .attr("height", function (d) {
                return y(d.y0) - y(d.y1);
            })
            .style("fill", function (d) {
                return color(d.labelValue);
            })
            .style("stroke", "grey")
            .on("mouseover", function (d) {
                showPopover.call(this, d);
            })
            .on("mouseout", function (d) {
                removePopovers();
            })

        var legend = svg.selectAll(".legend")
            .data(varNames.slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(55," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("x", width - 60)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color)
            .style("stroke", "grey");

        legend.append("text")
            .attr("x", width - 25)
            .attr("y", 6)
            .attr("dy", ".6em")
            .style("text-anchor", "start")
            .style("font-size", "14px")
            .text(function (d) {
                return d;
            });

        function removePopovers() {
            $('.popover').each(function () {
                $(this).remove();
            });
        }

        function showPopover(d) {
            $(this).popover({
                title: d.labelValue,
                placement: 'auto top',
                container: 'body',
                trigger: 'manual',
                html: true,
                content: function () {
                    return xaxis + ": " + d.label +
                        "<br/>" + yaxis + ": " + d3.format(",")(d.value ? d.value : d.y1 - d.y0);
                }
            });
            $(this).popover('show')
        }
    });
}
