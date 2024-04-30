import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './salesregion.css'

function SalesByRegion({ data, selectedRegion, setSelectedRegion }) {
    const ref = useRef();
    const tooltipRef = useRef();

    useEffect(() => {
        const svg = d3.select(ref.current);
        const tooltip = d3.select(tooltipRef.current);
        svg.selectAll("*").remove(); 

        const margin = { top: 60, right: 20, bottom: 30, left: 150 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const salesByRegion = d3.rollups(data, v => d3.sum(v, d => d.Sales), d => d.Region)
            .map(([Region, Sales]) => ({ Region, Sales }))
            .sort((a, b) => b.Sales - a.Sales);

        const y = d3.scaleBand()
            .range([0, height])
            .domain(salesByRegion.map(d => d.Region))
            .padding(0.1);

        const x = d3.scaleLinear()
            .domain([0, d3.max(salesByRegion, d => d.Sales)])
            .nice()
            .range([0, width]);

        const yAxis = g => g.call(d3.axisLeft(y).tickSizeOuter(0));
        const xAxis = g => g.attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format("~s")));

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("text").attr("x", width / 2 + margin.left).attr("y", 30).attr("text-anchor", "middle").attr("class", "chart-title").text("Sales by Region");

        g.selectAll("rect")
            .data(salesByRegion)
            .enter().append("rect")
            .attr("class", d => d.Region === selectedRegion ? "chart-bar-selected" : "chart-bar")
            .attr("y", d => y(d.Region))
            .attr("height", y.bandwidth())
            .attr("x", 0)
            .attr("width", d => x(d.Sales))
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible").text(`Sales: $${d.Sales}`).style("left", `${event.pageX}px`).style("top", `${event.pageY - 28}px`);
            })
            .on("mouseout", () => tooltip.style("visibility", "hidden"))
            .on("click", (event, d) => {
                setSelectedRegion(d.Region === selectedRegion ? null : d.Region);
            });

        g.append("g").call(yAxis);
        g.append("g").call(xAxis);

    }, [data, selectedRegion, setSelectedRegion]); 

    return (
        <div>
            <svg ref={ref} width={800} height={400} className="sales-by-region-svg"></svg>
            <div ref={tooltipRef} className="tooltip"></div>
            {selectedRegion && <p>Selected Region: {selectedRegion}</p>}
        </div>
    );
}

export default SalesByRegion;
