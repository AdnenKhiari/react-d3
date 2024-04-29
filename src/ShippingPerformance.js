import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function ShippingPerformance({ data }) {
  const ref = useRef();

  useEffect(() => {
    if (!data.length) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous SVG content

    const margin = { top: 20, right: 120, bottom: 70, left: 40 }; // Adjust right margin to make space for legend
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Calculate 'Days Late'
    data.forEach(d => {
      d['Days Late'] = Math.round((d['Ship Date'] - d['Order Date']) / (1000 * 3600 * 24));
    });

    // Group and stack data
    const shipModes = Array.from(new Set(data.map(d => d['Ship Mode'])));
    const groupData = d3.rollups(data, v => v.length, d => d['Days Late'], d => d['Ship Mode'])
      .map(([day, modes]) => ({
        day,
        modes: Array.from(modes, ([mode, count]) => ({ mode, count }))
      }));

    const stack = d3.stack()
      .keys(shipModes)
      .value((d, key) => d.modes.find(m => m.mode === key)?.count || 0);

    const stackedData = stack(groupData);

    // Scales
    const x = d3.scaleBand()
      .domain(groupData.map(d => d.day))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(shipModes);

    // Axes
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("fill", "#000")
      .attr("x", width / 2)
      .attr("y", 50)
      .style("text-anchor", "middle")
      .text("Days Late");

    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .style("text-anchor", "end")
      .text("Number of Orders");

    // Draw bars
    g.selectAll(".stack")
      .data(stackedData)
      .enter().append("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
          .attr("x", d => x(d.data.day))
          .attr("y", d => y(d[1]))
          .attr("height", d => y(d[0]) - y(d[1]))
          .attr("width", x.bandwidth());

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + margin.left + 20}, ${margin.top})`)
      .attr("text-anchor", "start")
      .selectAll("g")
      .data(shipModes)
      .enter().append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legend.append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", color);

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .text(d => d);

  }, [data]);

  return <svg ref={ref} width={920} height={480}></svg>; // Adjust width to accommodate legend
}

export default ShippingPerformance;
