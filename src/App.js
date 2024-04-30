import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import SalesOverTime from "./SalesOverTime";
import SalesByRegion from "./SalesByRegion";
import ProfitabilityAnalysis from "./ProfitabilityAnalysis";
import ShippingPerformance from "./ShippingPerformance";
import { Range } from "react-range";
import './App.css'; // Assuming styles are in App.css

function App() {
  const [data, setData] = useState([]);
  const [ogdata, setOgData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [yearRange, setYearRange] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [regions, setRegions] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    d3.csv("./Global_Superstore2.csv").then((data) => {
      data.forEach((d) => {
        const ddorder = d["Order Date"].split("-");
        d["Order Date"] = new Date(ddorder[2], ddorder[1] - 1, ddorder[0]);
        const ddship = d["Ship Date"].split("-");

        d["Ship Date"] = new Date(ddship[2], ddship[1] - 1, ddship[0]);
      });
          // Extract unique regions and categories
    const regionSet = new Set(data.map(item => item.Region));
    const categorySet = new Set(data.map(item => item.Category));
    setRegions([...regionSet]);
    setCategories([...categorySet]);
      setOgData(data);
    });


  }, []);
  
  useEffect(() => {
    let filteredData = ogdata;
    if (yearRange) {
      filteredData = filteredData.filter(
        (d) =>
          d["Order Date"] >= yearRange[0] && d["Order Date"] <= yearRange[1]
      );
    }
    if (selectedCategory) {
      filteredData = filteredData.filter(
        (d) => d.Category === selectedCategory
      );
    }
    if (selectedRegion) {
      filteredData = filteredData.filter((d) => d.Region === selectedRegion);
    }
    setData(filteredData);
  }, [ogdata, yearRange, selectedCategory, selectedRegion]);
  
  return (
    <div className="app-container">
      <h1>Global Superstore Dashboard</h1>
      <div className="filters">
        <div className="filter">
          <label>Region: </label>
          <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
            <option value="">All Regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label>Category: </label>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="charts">
        <div>
          <SalesOverTime data={data} />
          <SliderComponent setYearRange={setYearRange} />
        </div>

        <SalesByRegion data={data} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
        <ProfitabilityAnalysis data={data} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
        <ShippingPerformance data={data} />
      </div>
    </div>
  );
}

const SliderComponent = ({ setYearRange }) => {
  const minDate = new Date("2011-01-01").getTime();
  const maxDate = new Date("2014-12-31").getTime();

  const [dateRange, setDateRange] = useState([minDate, maxDate]);

  const handleChange = (values) => {
    setDateRange(values);
    setYearRange([new Date(values[0]), new Date(values[1])]);
  };

  return (
    <div className="slider-container">
      <Range
        step={86400000}
        min={minDate}
        max={maxDate}
        values={dateRange}
        onChange={handleChange}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: "6px",
              width: "100%",
              backgroundColor: "black",
              borderRadius: "3px",
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: "16px",
              width: "16px",
              borderRadius: "50%",
              backgroundColor: "orange",
              boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.75)",
              cursor: "pointer",
            }}
          />
        )}
      />
      <p className="date-range">
        Selected Date Range: {new Date(dateRange[0]).toDateString()} -{" "}
        {new Date(dateRange[1]).toDateString()}
      </p>
    </div>
  );
};

export default App;
