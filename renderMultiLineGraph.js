/* 
A javascript function that can be used to render a multiline chart on a webpage. The lines will be generated in the output based on columns used after the first column.
This kind of a chart is useful for comparing and understanding trends over a period of time.

Sample function call :
renderMultiLineGraph("../test/chartData.tsv", "#chartDiv", "Date", "Interest")

Sample input file (Tab separated) :

Date	US	CA	UK	DE	IT	ES	FR	MX	JP
14-MAY-16	22	34	54	0	0	1	2	0	0
15-MAY-16	8	4	23	0	0	0	0	0	45
16-MAY-16	1	6	76	1	0	0	0	4	0
17-MAY-16	91	87	23	58	0	56	8	5	0
18-MAY-16	74	43	4	17	0	28	16	43	10
19-MAY-16	70	3	7	19	0	0	1	65	7
20-MAY-16	10	2	43	2	0	0	0	12	0
21-MAY-16	36	43	67	2	0	0	1	98	12
22-MAY-16	10	21	12	0	0	0	0	32	0

*/

function renderMultiLineGraph(datafile, id_selector, xaxis, yaxis) {
    var margin = {
            top: 30,
            right: 20,
            bottom: 30,
            left: 80
        },
        width = 900 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .x(function (d) {
            return x(d.label) + x.rangeBand() / 2;
        })
        .y(function (d) {
            return y(d.value);
        });

    var color = d3.scale.ordinal()
        .range(["#001c9c", "#94FFB5", "#808080", "#9c8305", "#426600", "#F0A3FF", "#FFCC99", "#9DCC00", "#FF0010", "#FFFF80"]);

    var svg = d3.select(id_selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv(datafile, function (error, data) {

        var labelVar = xaxis;
        var varNames = d3.keys(data[0]).filter(function (key) {
            return key !== labelVar;
        });
        color.domain(varNames);

        var seriesData = varNames.map(function (name) {
            return {
                name: name,
                values: data.map(function (d) {
                    return {
                        name: name,
                        label: d[labelVar],
                        value: +d[name]
                    };
                })
            };
        });

        x.domain(data.map(function (d) {
            return d.run_date;
        }));
        y.domain([
          d3.min(seriesData, function (c) {
                return d3.min(c.values, function (d) {
                    return d.value;
                });
            }),
          d3.max(seriesData, function (c) {
                return d3.max(c.values, function (d) {
                    return d.value;
                });
            })
        ]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(yaxis);

        var series = svg.selectAll(".series")
            .data(seriesData)
            .enter().append("g")
            .attr("class", "series");

        series.append("path")
            .attr("class", "line")
            .attr("d", function (d) {
                return line(d.values);
            })
            .style("stroke", function (d) {
                return color(d.name);
            })
            .style("stroke-width", "4px")
            .style("fill", "none")

        series.selectAll(".point")
            .data(function (d) {
                return d.values;
            })
            .enter().append("circle")
            .attr("class", "point")
            .attr("cx", function (d) {
                return x(d.label) + x.rangeBand() / 2;
            })
            .attr("cy", function (d) {
                return y(d.value);
            })
            .attr("r", "5px")
            .style("fill", function (d) {
                return color(d.name);
            })
            .style("stroke", "grey")
            .style("stroke-width", "2px")
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
                title: d.name,
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
