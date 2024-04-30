import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './ShippingPerformance.css'; 

function ShippingPerformance({ data }) {
  const ref = useRef();

  useEffect(() => {
    if (!data.length) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); 

    const margin = { top: 40, right: 120, bottom: 70, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    data.forEach(d => {
      d['Days Late'] = Math.round((d['Ship Date'] - d['Order Date']) / (1000 * 3600 * 24));
    });

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

    const x = d3.scaleBand()
      .domain(groupData.map(d => d.day))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
      .range([height, 0]);

    const color = d3.scaleOrdinal(["#ff8c00", "#ffa500", "#ff7f50", "#ff6347", "#ff4500"])
      .domain(shipModes);

    svg.style("background-color", "black")
       .attr("width", 920)
       .attr("height", 480);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Title
    svg.append("text")
       .attr("x", 920 / 2)
       .attr("y", 20)
       .attr("text-anchor", "middle")
       .style("font-size", "16px")
       .style("fill", "whitesmoke")
       .text("Shipping Performance Analysis");

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("fill", "whitesmoke")
      .style("font-size", "12px");

    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("fill", "whitesmoke")
      .style("font-size", "12px");

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
      .style("fill", "whitesmoke")
      .style("font-size", "14px")
      .text(d => d);
  }, [data]);

  return <svg ref={ref}></svg>;
}

export default ShippingPerformance;
