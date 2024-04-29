import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './pie.css'

function PieChart({ data, attribute }) {
  const ref = useRef();
  const tooltipRef = useRef();  // Ref for the tooltip

  useEffect(() => {
    if (!data.length) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();  // Clear previous SVG content

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const color = d3.scaleOrdinal(["#FF6347", "#FFA500", "#FFD700", "#4682B4", "#1E90FF"]); // Tailored color scheme

    const pieData = Array.from(d3.group(data, d => d[attribute]), ([key, value]) => ({
      key: key,
      value: value.length
    }));

    const tooltip = d3.select(tooltipRef.current);

    svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
      .selectAll("path")
      .data(pie(pieData))
      .enter().append("path")
        .attr("fill", (d, i) => color(i))
        .attr("d", arc)
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
                 .text(`${d.data.key}: ${d.data.value}`)
                 .style("left", `${event.pageX}px`)
                 .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });

    // Adding chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)  // Adjust position as needed
      .attr("class", "chart-title")
      .text("Distribution by " + attribute);

  }, [data, attribute]);

  return (
    <>
      <svg ref={ref} className="pie-chart-svg"></svg>
      <div ref={tooltipRef} className="tooltip"></div>
    </>
  );
}

export default PieChart;
