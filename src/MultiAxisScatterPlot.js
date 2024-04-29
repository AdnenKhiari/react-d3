import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function MultiAxisScatterPlot({ data }) {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous SVG content

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 60, bottom: 50, left: 60 };

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d.btc_estimated_transaction_volume)])
      .range([margin.left, width - margin.right]);

    const yScaleDifficulty = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d.btc_difficulty)])
      .range([height - margin.bottom, margin.top]);

    const yScaleHashRate = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d.btc_hash_rate)])
      .range([height - margin.bottom, margin.top]);

    // Define axes
    const xAxis = d3.axisBottom(xScale).ticks(6);
    const yAxisLeft = d3.axisLeft(yScaleDifficulty);
    const yAxisRight = d3.axisRight(yScaleHashRate).ticks(6);

    // Append axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .append("text")
      .attr("fill", "black")
      .attr("x", width / 2)
      .attr("y", 40)
      .style("text-anchor", "middle")
      .text("Estimated Transaction Volume");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxisLeft)
      .append("text")
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .text("Difficulty");

    svg.append("g")
      .attr("transform", `translate(${width - margin.right},0)`)
      .call(yAxisRight)
      .append("text")
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("y", 50)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .text("Hash Rate");

    // Add points for Difficulty
    const dotsDifficulty = svg.append("g");
    dotsDifficulty.selectAll("dot")
      .data(data)
      .enter().append("circle")
        .attr("cx", d => xScale(d.btc_estimated_transaction_volume))
        .attr("cy", d => yScaleDifficulty(d.btc_difficulty))
        .attr("r", 5)
        .style("fill", "#4285F4");

    dotsDifficulty.selectAll("circle")
      .append("title")
        .text(d => `Difficulty: ${d.btc_difficulty}`);

    // Add points for Hash Rate
    const dotsHashRate = svg.append("g");
    dotsHashRate.selectAll("dot")
      .data(data)
      .enter().append("circle")
        .attr("cx", d => xScale(d.btc_estimated_transaction_volume))
        .attr("cy", d => yScaleHashRate(d.btc_hash_rate))
        .attr("r", 5)
        .style("fill", "#DB4437");

    dotsHashRate.selectAll("circle")
      .append("title")
        .text(d => `Hash Rate: ${d.btc_hash_rate}`);

  }, [data]); // Redraw when data changes

  return <svg ref={ref} width={800} height={400}></svg>;
}

export default MultiAxisScatterPlot;
