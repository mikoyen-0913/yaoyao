import React, { useEffect, useState } from "react";
import "./index.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import dayjs from "dayjs";

const API_URL = "http://127.0.0.1:5000";
const COLORS = ["#FF8042", "#0088FE", "#FFBB28", "#00C49F", "#A28EFF", "#FF6699", "#996633", "#CC0000"];

const BossBusinessStatus = () => {
  const [range, setRange] = useState("7days");
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM"));
  const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY"));
  const [chartData, setChartData] = useState([]);
  const [flavorMonth, setFlavorMonth] = useState(dayjs().format("YYYY-MM"));
  const [pieData, setPieData] = useState({});
  const token = localStorage.getItem("token");

  const fetchRevenue = async () => {
    let url = `${API_URL}/get_all_store_revenue?range=${range}`;
    if (range === "month") url += `&month=${selectedDate}`;
    if (range === "year") url += `&year=${selectedYear}`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        const formatted = [];
        const length = data[0]?.dates?.length || 0;

        for (let i = 0; i < length; i++) {
          const point = { date: data[0].dates[i] };
          data.forEach((store) => {
            point[store.store_name] = store.revenues[i];
          });
          formatted.push(point);
        }

        setChartData(formatted);
      }
    } catch (err) {
      console.error("載入營收資料失敗", err);
    }
  };

  const fetchFlavorSales = async () => {
    try {
      const res = await fetch(`${API_URL}/get_store_flavor_sales?month=${flavorMonth}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPieData(data);
    } catch (err) {
      console.error("載入圓餅圖資料失敗", err);
    }
  };

  useEffect(() => {
    fetchRevenue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, selectedDate, selectedYear]);

  useEffect(() => {
    fetchFlavorSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flavorMonth]);

  return (
    <div className="homepage-container">
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 30 }}>
        <button className="go-home-button" onClick={() => window.location.href = "/home"}>回首頁</button>
      </div>

      <div className="status-section">
        <h2 className="section-title">各分店營收趨勢圖</h2>

        <div className="button-group">
          <button className="nav-button" onClick={() => setRange("7days")}>近 7 天</button>
          <button className="nav-button" onClick={() => setRange("month")}>以月份顯示</button>
          <button className="nav-button" onClick={() => setRange("year")}>以年份顯示</button>
        </div>

        {range === "month" && (
          <input
            type="month"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ fontSize: 16, margin: "20px auto", display: "block" }}
          />
        )}

        {range === "year" && (
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            min="2020"
            max={dayjs().year()}
            style={{ fontSize: 16, margin: "20px auto", display: "block", width: 100 }}
          />
        )}

        <ResponsiveContainer width="95%" height={400}>
          <LineChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
            {chartData.length > 0 &&
              Object.keys(chartData[0])
                .filter((key) => key !== "date")
                .map((store, idx) => (
                  <Line
                    key={store}
                    type="linear"
                    dataKey={store}
                    stroke={`hsl(${(idx * 90) % 360}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="status-section">
        <h2 className="section-title">各分店口味銷量圖</h2>
        <input
          type="month"
          value={flavorMonth}
          onChange={(e) => setFlavorMonth(e.target.value)}
          style={{ fontSize: 16, margin: "10px auto", display: "block" }}
        />

        {Object.entries(pieData).map(([store, flavors]) => (
          <div key={store} style={{ marginBottom: "60px", textAlign: "center" }}>
            <h3>{store}</h3>
            <p>{flavorMonth.replace("-", "年")}月</p>
            <PieChart width={400} height={300}>
              <Pie
                data={flavors}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name} ${value}顆`}
                dataKey="value"
              >
                {flavors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BossBusinessStatus;
