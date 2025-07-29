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

// ✅ 預先定義已知分店對應顏色（可擴充）
const STORE_COLOR_MAP = {
  "台北店": "#f9315cff",
  "測試店": "#36A2EB",
  "高雄店": "#4BC0C0",
  "新竹店": "#FFCE56"
};

// ✅ 額外備用顏色池（避免重複）
const COLOR_POOL = [
  "#9966FF", "#FF9F40", "#66C2A5", "#C94D7D",
  "#00B8D9", "#B3DE69", "#D17BAF", "#A984FF", "#FFA07A",
  "#DA70D6", "#CD5C5C", "#6495ED", "#FFD700", "#90EE90"
];

// ✅ 實際分配顏色的對照表（不可重複）
const assignedStoreColors = { ...STORE_COLOR_MAP };

const getColorForStore = (storeName) => {
  if (assignedStoreColors[storeName]) return assignedStoreColors[storeName];

  const usedColors = Object.values(assignedStoreColors);
  const availableColor = COLOR_POOL.find(c => !usedColors.includes(c));

  if (!availableColor) {
    console.warn("⚠️ 顏色不足，請擴充 COLOR_POOL！");
    return "#CCCCCC";
  }

  assignedStoreColors[storeName] = availableColor;
  return availableColor;
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
                .map((store) => (
                  <Line
                    key={store}
                    type="linear"
                    dataKey={store}
                    stroke={getColorForStore(store)}
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

        {Object.entries(pieData).map(([store, flavors]) => {
          const total = flavors.reduce((sum, item) => sum + item.value, 0);
          const updatedFlavors = flavors.map(item => ({ ...item, total }));

          return (
            <div key={store} className="pie-card">
              <h3>{store}</h3>
              <p>{flavorMonth.replace("-", "年")}月</p>
              <div className="pie-wrapper">
                <PieChart width={960} height={540}>
                  <Pie
                    data={updatedFlavors}
                    cx="45%"
                    cy="50%"
                    outerRadius={230}
                    labelLine={false}
                    dataKey="value"
                  >
                    {updatedFlavors.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={FLAVOR_COLORS[entry.name] || "#CCCCCC"}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const { name, value, payload: originalPayload } = payload[0];
                        const total = originalPayload.total || 0;
                        const percent = total > 0 ? (value / total) * 100 : 0;

                        return (
                          <div style={{
                            background: "white",
                            border: "2px solid #333",
                            padding: "16px 20px",
                            borderRadius: "12px",
                            fontSize: "18px",
                            fontWeight: "500",
                            zIndex: 9999,
                            pointerEvents: "none",
                            color: "#333",
                            boxShadow: "2px 2px 8px rgba(0,0,0,0.15)"
                          }}>
                            <div><strong>{name}</strong></div>
                            <div>銷售數量：{value} 顆</div>
                            <div>佔比：{percent.toFixed(1)}%</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    wrapperStyle={{
                      zIndex: 9999,
                      pointerEvents: "none"
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
          );
        })}
      </div>
    </div>
  );
};

export default BossBusinessStatus;
