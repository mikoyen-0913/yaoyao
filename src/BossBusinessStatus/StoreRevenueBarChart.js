//StoreRevenueBarChart.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";

const API_URL = "http://127.0.0.1:5000";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#8BC34A"];

const StoreRevenueBarChart = () => {
  const [data, setData] = useState([]);
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/get_store_revenue_rank?month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("取得分店營收排行失敗", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month]);

  return (
    <div className="chart-card">
      <h2 className="section-title">分店營收排行榜</h2>
      <div className="summary-section">
        <label>選擇月份：</label>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 30, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="store_name" type="category" />
          <Tooltip formatter={(value) => [`${value} 元`, "營收"]} />
          <Bar dataKey="total_sales" fill="#FFA726">
            <LabelList dataKey="total_sales" position="right" formatter={(val) => `${val}元`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StoreRevenueBarChart;
