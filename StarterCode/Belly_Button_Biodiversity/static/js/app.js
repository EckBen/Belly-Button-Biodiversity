function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  d3.json(`/metadata/${sample}`).then(function(data) {
    console.log(data);
    
    // Use d3 to select the panel with id of `#sample-metadata`
    var panel = d3.select('#sample-metadata');

    // Use `.html("") to clear any existing metadata
    panel.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(data).forEach(([key, value]) => panel.append('p').text(`${key}:${value}`));
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);

  });
}

function buildCharts(sample) {
  console.log(sample);
  
  // Grab json data for graphing
  d3.json(`/samples/${sample}`).then(function(data) {
    console.log(data);
    var bacteria = []

    // Convert data for sorting and slicing
    for (let i = 0; i < data.sample_values.length; i++) {
      var bacterium = {
        sample_values: data.sample_values[i],
        otu_ids: data.otu_ids[i],
        otu_labels: data.otu_labels[i]
      };
      bacteria.push(bacterium);
    };
    var slicedBacteria = bacteria.sort((a, b) => b.sample_values - a.sample_values).slice(0,10);
    console.log(slicedBacteria);

    // Build pie chart and display to page
    var pieTrace = [{
      labels: slicedBacteria.map(bact => bact.otu_ids),
      values: slicedBacteria.map(bact => bact.sample_values),
      type: 'pie'
    }];
    console.log(pieTrace);

    var pieLayout = {
      title: 'Belly Button Bacteria Pie',
      hovertext: slicedBacteria.map(bact => bact.otu_labels)
    };

    Plotly.newPlot('pie', pieTrace, pieLayout);

    // Build bubble chart and display to page
    var bubbleTrace = [{
      x: bacteria.map(bact => bact.otu_ids),
      y: bacteria.map(bact => bact.sample_values),
      mode: 'markers',
      marker: {
        size: bacteria.map(bact => bact.sample_values),
        color: bacteria.map(bact => bact.otu_ids)
      },
      text: bacteria.map(bact => bact.otu_labels)
    }];

    var bubbleLayout = {
      title: 'Bubbles',
      showlegend: false
    };

    Plotly.newPlot('bubble', bubbleTrace, bubbleLayout);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
