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

// ✅ 每種口味固定顏色
const FLAVOR_COLORS = {
  "OREO鮮奶油": "#A28EFF",
  "紅豆": "#FF3333",
  "奶油": "#FFDD55",
  "可可布朗尼": "#FF66A3",
  "巧克力": "#00C49F",
  "抹茶麻糬": "#99CC66",
  "黑芝麻鮮奶油": "#666666",
  "花生": "#FF9933",
  "紅豆麻糬": "#3399FF",
  "珍珠鮮奶油": "#66CCFF"
};

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
  }, [range, selectedDate, selectedYear]);

  useEffect(() => {
    fetchFlavorSales();
  }, [flavorMonth]);

  return (
    <div className="homepage-container">
      <div className="top-right-button">
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
            className="date-input"
            type="month"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        )}

        {range === "year" && (
          <input
            className="year-input"
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            min="2020"
            max={dayjs().year()}
          />
        )}

        <ResponsiveContainer width="95%" height={400}>
          <LineChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ right: 0, left: 'auto', marginRight: 500 }}
            />

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
          className="date-input"
          type="month"
          value={flavorMonth}
          onChange={(e) => setFlavorMonth(e.target.value)}
        />

        {Object.entries(pieData).map(([store, flavors]) => (
          <div key={store} className="pie-card">
            <h3>{store}</h3>
            <p>{flavorMonth.replace("-", "年")}月</p>
            <div className="pie-wrapper">
              <PieChart width={860} height={460}>
                <Pie
                  data={flavors}
                  cx="35%"
                  cy="50%"
                  outerRadius={180}
                  labelLine={false}
                  dataKey="value"
                >
                  {flavors.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={FLAVOR_COLORS[entry.name] || "#CCCCCC"}
                    />
                  ))}
                </Pie>

                {/* ✅ 自訂 Tooltip：顯示品名、顆數、百分比 */}
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const { name, value, percent } = payload[0];
                      return (
                        <div style={{
                          background: "white",
                          border: "1px solid #ccc",
                          padding: "10px",
                          borderRadius: "8px",
                          fontSize: "14px"
                        }}>
                          <div><strong>{name}</strong></div>
                          <div>銷售數量：{value} 顆</div>
                          <div>佔比：{(percent * 100).toFixed(1)}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  formatter={(value) => value}
                  wrapperStyle={{
                    transform: "translateX(-60px)",
                    fontSize: "16px",
                    lineHeight: "28px"
                  }}
                />
              </PieChart>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BossBusinessStatus;
