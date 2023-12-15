var currentFolder = window.location.pathname;
console.log(currentFolder)

// Assuming the width and height for the SVG canvas are defined
var width = 500;
var height = 500;

var svg = d3.select("#plot").append("svg")
            .attr("width", width)
            .attr("height", height);

var projection = d3.geoMercator();
var path = d3.geoPath().projection(projection);

var zoom = d3.zoom()
    .scaleExtent([1, 8]) // Set the minimum and maximum scale extent
    .on('zoom', (event) => {
        svg.selectAll('path').attr('transform', event.transform);
        svg.selectAll('circle').attr('transform', event.transform);
        svg.selectAll('district-label').attr('transform', event.transform)
    });

// Load and visualize GeoJSON data
d3.json("https://raw.githubusercontent.com/ChanJin0801/NYC_Restaurant_Inspection/main/NYC_City_Council_Districts.geojson").then(function(geojsonData) {
    var districtData = geojsonData.features.map(function(d) {
        return {
            name: d.properties.name, // replace with actual property name for the district name
            coun_dist: d.properties.coun_dist // replace with the actual property name for the district number
        };
    });
    console.log(districtData)
    // Adjust the projection to fit the GeoJSON data
    projection.fitSize([width, height], geojsonData);
    console.log(geojsonData['features'])
    // Add district paths to the SVG
    svg.selectAll("path")
        .data(geojsonData.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "district")
        .on('click', function (event, d) {
            // Zoom logic on click
            d3.selectAll(".district-label")
              .style("visibility", "hidden")
            var bounds = path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = Math.max(2, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
                translate = [width / 2 - scale * x, height / 2 - scale * y];

            svg.transition()
                .duration(500) // Adjust duration as needed
                .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
        });
    svg.call(zoom);
    // Add labels for each district
    var labels = svg.selectAll(".district-label")
        .data(geojsonData.features)
        .enter().append("text")
        .attr("class", "district-label")
        .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
        .attr("dy", ".2em")
        .attr("visibility", "visible")
        .attr("text-anchor", "middle") // Centers text on its centroid
        .style("fill", "black") // Set text color to ensure visibility
        .text(function(d) { return d.properties.coun_dist; });


    // Apply the zoom behavior
    svg.call(zoom);
//////////////////////
    // Load and plot points from CSV
    d3.csv("https://raw.githubusercontent.com/ChanJin0801/NYC_Restaurant_Inspection/main/tidydata.csv").then(function(data) {

        data.forEach(function(d) {
            console.log(d.Grade)
            var coordinates = [+d.Longitude, +d.Latitude];
            var projected = projection(coordinates);

            // Append circles for each point
            var circle = svg.append("circle")
            .attr("cx", projected[0])
            .attr("cy", projected[1])
            .attr("r", 2)
            .style("fill", d.Grade.toLowerCase() === 'bad' ? "#ff0000" :
                           d.Grade.toLowerCase() === 'good' ? "#04ff00" : "#0000ff")
            .attr("class", "restaurant");

        // Add click event for tooltip on the circle
        circle.on('click', function(event) {
            // Position and show the tooltip
            event.stopPropagation();
            d3.select("#tooltip")
              .style("visibility", "visible")
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px")
              .html("Restaurant Name: " + d.Restaurant_Name + "<br/>" + "Critical_Flag_Proportion: " + Math.round(d.Critical_Flag_Proportion,2));
        });
        });
    });
}).catch(function(error) {
    console.error("Error loading the GeoJSON data: ", error);
});


svg.on('click', function() {
    d3.select("#tooltip").style("visibility", "hidden");
});


var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', (event) => {
        svg.selectAll('path').attr('transform', event.transform);
        svg.selectAll('circle').attr('transform', event.transform);
    });

// Apply the zoom behavior to the SVG
svg.call(zoom);

// Function to zoom the SVG
function zoomed(event) {
    svg.selectAll('path').attr('transform', event.transform);
    svg.selectAll('circle').attr('transform', event.transform);
}
// Connect zoom in and zoom out buttons
d3.select('#zoom_in').on('click', function() {
    d3.selectAll(".district-label")
              .style("visibility", "hidden")
    zoom.scaleBy(svg.transition().duration(200), 1.5); // 1.3 is the zoom-in scale factor
});

d3.select('#zoom_out').on('click', function() {

    svg.transition()
        .duration(500)
        .call(zoom.transform, d3.zoomIdentity)
        .on('end', function() { // For D3 v5 and earlier
           d3.selectAll(".district-label")
             .style("visibility", "visible");
       })
});

// Select the element and add the initial text
const comment = d3.select('#comment').text('Tutorial:');

// Append tspans for each line of the tutorial
comment.append('tspan')
  .attr('x', 0) // Adjust the x position as needed
  .attr('dy', '1em')
  .text("1. Click any district that interests you, then the map will zoom into that district");

// Add a blank line
comment.append('tspan')
  .attr('x', 0)
  .attr('dy', '1em')
  .text(""); // No text, just a space

comment.append('tspan')
  .attr('x', 0) // Adjust the x position as needed
  .attr('dy', '1em')
  .text("2. Click the green points which are the restaurants, the information will show the critical flag proportion and whether it's a good restaurant on sanitation or not");

// Add another blank line
comment.append('tspan')
  .attr('x', 0)
  .attr('dy', '1em')
  .text(""); // Again, no text, just a space

comment.append('tspan')
  .attr('x', 0) // Adjust the x position as needed
  .attr('dy', '1em')
  .text("3. 'Zoom out' is a button to return to the original view of the map");
