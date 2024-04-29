import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function DataViz({ data, attribute, yearRange }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear SVG content

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const filteredData = data.filter(d => 
      d.date.getFullYear() >= yearRange[0] && d.date.getFullYear() <= yearRange[1]
    );
    const xScale = d3.scaleTime()
      .domain(d3.extent(filteredData, d => d.date))
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => +d[attribute])])
      .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    const line = d3.line()
      .defined(d => !isNaN(d[attribute]))
      .x(d => xScale(d.date))
      .y(d => yScale(+d[attribute]));

    svg.append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

  }, [data, attribute, yearRange]);

  return <svg ref={svgRef} width={800} height={400} />;
}

export function GetTimeSeries({data}){
    const svgRef = useRef();

    useEffect(() => {
      if (!data.length) return;
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clear SVG content before redrawing
  
      const width = 800;
      const height = 400;
      const margin = { top: 20, right: 30, bottom: 30, left: 60 };
  
      // Filtering null or undefined prices and logging data
      const filteredData = data.filter(d => d.btc_market_price != null && d.btc_market_price !== '');
      console.log("Filtered Data:", filteredData);
  
      const xScale = d3.scaleTime()
        .domain(d3.extent(filteredData, d => d.date))
        .range([margin.left, width - margin.right]);
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => +d.btc_market_price)])
        .range([height - margin.bottom, margin.top]);
  
      console.log("Domain X:", xScale.domain());
      console.log("Domain Y:", yScale.domain());
  
      const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
      const yAxis = d3.axisLeft(yScale);
  
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("x", width - margin.right)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Date");
  
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .style("text-anchor", "end")
        .text("Market Price (USD)");
  
      const line = d3.line()
        .defined(d => !isNaN(d.btc_market_price))
        .x(d => xScale(d.date))
        .y(d => yScale(+d.btc_market_price))
        .curve(d3.curveMonotoneX); // This makes the line chart smoother
  
      svg.append("path")
        .datum(filteredData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);
  
      console.log("SVG Path:", svg.select("path").attr("d")); // Check if the path "d" attribute is set
  
    }, [data]);
  
    return <svg ref={svgRef} width={800} height={400} />;
}

export default DataViz;
