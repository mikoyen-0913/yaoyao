import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LabelList
} from "recharts";
import "./index.css";
import StoreRevenueBarChart from "./StoreRevenueBarChart";
import StoreLocationMap from "./StoreLocationMap";
import { apiBaseUrl } from "../settings";

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

const STORE_COLOR_MAP = {
  "台北店": "#f9315cff",
  "測試店": "#36A2EB",
  "芝山店": "#FF9F40",
  "淡水店": "#b866ff"
};

const COLOR_POOL = [
  "#9966FF", "#00ff77", "#66C2A5", "#C94D7D", "#00B8D9",
  "#B3DE69", "#D17BAF", "#A984FF", "#FFA07A", "#DA70D6",
  "#CD5C5C", "#6495ED", "#FFD700", "#90EE90"
];

const assignedStoreColors = { ...STORE_COLOR_MAP };
const getColorForStore = (storeName) => {
  if (assignedStoreColors[storeName]) return assignedStoreColors[storeName];
  const usedColors = Object.values(assignedStoreColors);
  const availableColor = COLOR_POOL.find(c => !usedColors.includes(c));
  if (!availableColor) return "#CCCCCC";
  assignedStoreColors[storeName] = availableColor;
  return availableColor;
};

const BossBusinessStatus = () => {
  const [storeData, setStoreData] = useState([]);
  const [range, setRange] = useState("7days");
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM"));
  const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY"));
  const [chartData, setChartData] = useState([]);

  const [flavorMonth, setFlavorMonth] = useState(dayjs().format("YYYY-MM"));
  const [pieData, setPieData] = useState({});

  const [summary, setSummary] = useState({ total_sales: 0, total_orders: 0 });

  const [topMonth, setTopMonth] = useState(dayjs().format("YYYY-MM"));
  const [topFlavors, setTopFlavors] = useState([]);

  const [revenueMonth, setRevenueMonth] = useState(dayjs().format("YYYY-MM"));
  const [storeRevenueRank, setStoreRevenueRank] = useState([]);

  const token = localStorage.getItem("token");

  const fetchRevenue = async () => {
    let url = `${apiBaseUrl}/get_all_store_revenue?range=${range}`;
    if (range === "month") url += `&month=${selectedDate}`;
    if (range === "year") url += `&year=${selectedYear}`;

    try {
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data;
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
      const res = await axios.get(`${apiBaseUrl}/get_store_flavor_sales?month=${flavorMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPieData(res.data);
    } catch (err) {
      console.error("載入圓餅圖資料失敗", err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/get_summary_this_month`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(res.data);
    } catch (err) {
      console.error("載入本月總覽失敗", err);
    }
  };

  const fetchTopFlavors = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/get_top_flavors?month=${topMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopFlavors(res.data);
    } catch (err) {
      console.error("載入排行榜失敗", err);
    }
  };

  useEffect(() => {
    fetchRevenue();
    fetchSummary();
  }, [range, selectedDate, selectedYear]);

  useEffect(() => {
    fetchFlavorSales();
  }, [flavorMonth]);

  useEffect(() => {
    fetchTopFlavors();
  }, [topMonth]);

  useEffect(() => {
    const fetchStoreRevenueRank = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/get_store_revenue_rank?month=${revenueMonth}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStoreRevenueRank(res.data);
      } catch (err) {
        console.error("載入分店營收排行失敗", err);
      }
    };
    fetchStoreRevenueRank();
  }, [revenueMonth]);

  const fetchStoreLocations = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/get_store_locations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStoreData(res.data);
    } catch (err) {
      console.error("載入分店地圖失敗", err);
    }
  };

  useEffect(() => {
    fetchRevenue();
    fetchSummary();
    fetchStoreLocations();
  }, [range, selectedDate, selectedYear]);

  const storeNames = chartData.length > 0
    ? Object.keys(chartData[0]).filter(k => k !== "date")
    : [];

  return (
    <div className="homepage-container">
      <div className="top-right-button">
        <button className="go-home-button" onClick={() => window.location.href = "/home"}>回首頁</button>
      </div>

      <h2 className="section-title">本月營業總覽</h2>
      <div className="summary-section">
        <div className="sales-amount">
          總銷售金額：<span className="sales-amount-number">${summary.total_sales.toLocaleString()}</span>
        </div>
        <div className="sales-amount">
          總訂單數量：<span className="sales-amount-number">{summary.total_orders}</span> 筆
        </div>
      </div>

      <div className="chart-card">
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

        <div className="center-wrap">
          <div className="chart-wide">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 30, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                {chartData.length > 0 &&
                  storeNames.map((store) => (
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
        </div>

        <div className="store-legend">
          {storeNames.map((name) => (
            <div className="legend-item" key={name}>
              <span className="legend-color" style={{ backgroundColor: getColorForStore(name) }} />
              <span className="legend-text">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-card">
        <h2 className="section-title">各分店口味銷量圖</h2>
        <input
          className="date-input"
          type="month"
          value={flavorMonth}
          onChange={(e) => setFlavorMonth(e.target.value)}
        />

        <div className="store-legend">
          {Object.keys(FLAVOR_COLORS).map((name) => (
            <div className="legend-item" key={name}>
              <span className="legend-color" style={{ backgroundColor: FLAVOR_COLORS[name] || "#CCCCCC" }} />
              <span className="legend-text">{name}</span>
            </div>
          ))}
        </div>

        <div className="pie-grid">
          {Object.entries(pieData).map(([store, flavors]) => {
            const total = flavors.reduce((sum, item) => sum + item.value, 0);
            const updatedFlavors = flavors.map(item => ({ ...item, total }));
            return (
              <div key={store} className="pie-card">
                <h3>{store}</h3>
                <p>{flavorMonth.replace("-", "年")}月</p>
                <div className="pie-wrapper">
                  <PieChart width={520} height={340}>
                    <Pie data={updatedFlavors} cx="50%" cy="50%" outerRadius={130} labelLine={false} dataKey="value">
                      {updatedFlavors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={FLAVOR_COLORS[entry.name] || "#CCCCCC"} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const { name, value, payload: originalPayload } = payload[0];
                          const t = originalPayload.total || 0;
                          const percent = t > 0 ? (value / t) * 100 : 0;
                          return (
                            <div style={{
                              background: "white",
                              border: "2px solid #333",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              fontSize: "14px",
                              fontWeight: 500,
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
                      wrapperStyle={{ zIndex: 9999, pointerEvents: "none" }}
                    />
                  </PieChart>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chart-card">
        <h2 className="section-title">全分店商品銷售排行榜</h2>
        <input
          className="date-input"
          type="month"
          value={topMonth}
          onChange={(e) => setTopMonth(e.target.value)}
        />
        <div className="center-wrap">
          <div className="chart-wider">
            <ResponsiveContainer width="100%" height={480}>
              <BarChart
                data={topFlavors}
                layout="vertical"
                margin={{ top: 20, right: 260, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={240} />
                <Tooltip formatter={(value) => `${value} 顆`} />
                <Bar dataKey="value" fill="#a47551">
                  <LabelList dataKey="value" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="side-by-side-section">
        <StoreRevenueBarChart />
        <StoreLocationMap storeLocations={storeData} />
      </div>
    </div>
  );
};

export default BossBusinessStatus;
