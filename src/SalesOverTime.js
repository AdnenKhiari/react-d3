import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './salesovertime.css'

function SalesOverTime({ data }) {
  const ref = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    const tooltip = d3.select(tooltipRef.current);
    const containerWidth = ref.current.clientWidth;
    svg.selectAll("*").remove(); 

    const margin = { top: 50, right: 30, bottom: 50, left: 80 };
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    data.sort((a, b) => a['Order Date'] - b['Order Date']);
    const salesByMonth = d3.rollups(data, v => d3.sum(v, d => d.Sales), d => d3.timeMonth(d['Order Date']))
      .map(([time, sales]) => ({ time, sales }));

    const x = d3.scaleTime().domain(d3.extent(salesByMonth, d => d.time)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(salesByMonth, d => d.sales)]).range([height, 0]);

    const xAxis = g => g.attr("transform", `translate(${margin.left},${height + margin.top})`).call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));
    const yAxis = g => g.attr("transform", `translate(${margin.left},${margin.top})`).call(d3.axisLeft(y));

    const line = d3.line().x(d => x(d.time)).y(d => y(d.sales));

    // Add the tooltip container to the SVG
    svg.append("g").selectAll("circle")
      .data(salesByMonth)
      .enter().append("circle")
      .attr("cx", d => x(d.time) + margin.left)
      .attr("cy", d => y(d.sales) + margin.top)
      .attr("r", 5)
      .attr("fill", "whitesmoke")
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
               .text(`$${d.sales}`)
               .style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    svg.append("text")
      .attr("x", (width / 2) + margin.left)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("class", "chart-title")
      .text("Sales Over Time");

    svg.append("g").attr("class", "axis").call(xAxis);
    svg.append("g").attr("class", "axis").call(yAxis);
    svg.append("path")
      .datum(salesByMonth)
      .attr("class", "line-path")
      .attr("fill", "none")
      .attr("d", line)
      .attr("transform", `translate(${margin.left},${margin.top})`);
  }, [data]);

  return (
    <div>
      <svg ref={ref} height={400} className="sales-over-time-svg"></svg>
      <div ref={tooltipRef} className="tooltip"></div>
    </div>
  );
}

export default SalesOverTime;
