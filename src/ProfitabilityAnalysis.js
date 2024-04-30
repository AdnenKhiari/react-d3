import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

function ProfitabilityAnalysis({ data, selectedCategory, setSelectedCategory }) {
  const ref = useRef();
  const [nestedData, setNestedData] = useState(null);

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); 

    const width = 800;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 40;

    let filteredData = data;
    if (selectedCategory) {
      filteredData = data.filter(d => d.Category === selectedCategory);
    }

    const groupByCategory = d3.group(filteredData, d => d.Category);
    const nestedDataArray = Array.from(groupByCategory, ([category, values]) => ({
      Category: category,
      TotalSales: d3.sum(values, d => d.Sales),
      SubCategories: d3.group(values, d => d["Sub-Category"])
    }));

    setNestedData(nestedDataArray);

    const pie = d3.pie()
      .value(d => d.TotalSales)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);

    const arcLabel = d3.arc().innerRadius(radius * 0.8).outerRadius(radius * 0.8);

    const color = d3.scaleOrdinal(["#ff8c00", "#ffa500", "#ff7f50", "#ff6347", "#ff4500"]); // Different shades of orange

    svg.attr("width", width)
       .attr("height", height)
       .style("background-color", "black")  
       .append("g")
       .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const path = svg.select("g").selectAll("path")
      .data(pie(selectedCategory ? Array.from(nestedDataArray.find(d => d.Category === selectedCategory).SubCategories, ([subCategory, values]) => ({ Category: subCategory, TotalSales: d3.sum(values, d => d.Sales) })) : nestedDataArray))
      .enter().append("path")
        .attr("fill", (d, i) => color(i))
        .attr("d", arc)
        .attr("stroke", "white")  
        .attr("stroke-width", 2)
        .append("title")  
        .text(d => `${d.data.Category}: $${d.data.TotalSales.toLocaleString()}`);

    svg.select("g").selectAll("path")
      .on("click", (event, d) => {
        if (!selectedCategory) {
          setSelectedCategory(d.data.Category);
        } else {
          setSelectedCategory(null);
        }
      });

    svg.select("g").selectAll("text")
      .data(pie(selectedCategory ? Array.from(nestedDataArray.find(d => d.Category === selectedCategory).SubCategories, ([subCategory, values]) => ({ Category: subCategory, TotalSales: d3.sum(values, d => d.Sales) })) : nestedDataArray))
      .enter().append("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(d => d.data.Category)
        .style("fill", "whitesmoke")
        .style("font-size", "12px");

    svg.select("g").append("text")
      .attr("text-anchor", "middle")
      .attr("y", 10)
      .style("font-size", "16px")
      .style("fill", "whitesmoke")
      .text(selectedCategory ? `Sub-Categories in ${selectedCategory}` : "Sales by Category");

  }, [data, selectedCategory, setSelectedCategory]);

  return <svg ref={ref}></svg>;
}

export default ProfitabilityAnalysis;
