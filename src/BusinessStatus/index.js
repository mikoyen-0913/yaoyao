// BusinessStatus.js
import React, { useState, useEffect } from "react";
import "./index.css";
import AddToInventoryModal from "../components/AddToInventoryModal";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, LabelList
} from 'recharts';

const API_URL = "http://127.0.0.1:5000";
const BAR_COLOR = "#2f8ac6";
const LINE_COLOR = "#ff6666";

const BusinessStatus = () => {
  const [chart, setChart] = useState("week");
  const [salesData, setSalesData] = useState([]);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [shortages, setShortages] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // 取得銷售資料
  const fetchSalesSummary = (days) => {
    fetch(`${API_URL}/get_sales_summary?days=${days}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.summary)) {
          setSalesData(
            data.summary.map((d) => ({
              ...d,
              label: `$${d.total}`,
              shortDate: new Date(d.date).toLocaleDateString("zh-TW", {
                month: "numeric",
                day: "numeric",
              }),
            }))
          );
        }
      })
      .catch((err) => console.error("載入銷售資料失敗", err));
  };

  useEffect(() => {
    fetchSalesSummary(chart === "week" ? 7 : chart === "14days" ? 14 : 30);
  }, [chart, token]);

  // 取得缺料
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/check_inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const shortagesObj = data.shortage_report || {};
        const filtered = {};
        Object.entries(shortagesObj).forEach(([key, value]) => {
          if (value.status === "缺料") {
            filtered[key] = value;
          }
        });
        setShortages(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("取得缺料資訊失敗", err);
        setLoading(false);
      });
  }, [token]);

  // 取得已完成訂單
  useEffect(() => {
    fetch(`${API_URL}/get_completed_orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCompletedOrders(data.orders || []))
      .catch((err) => console.error("讀取已完成訂單失敗", err));
  }, [token]);

  // 補貨送出
  const handleRestockSubmit = async (restockData) => {
    try {
      const newShortages = { ...shortages };
      for (const id in restockData) {
        const amount = Number(restockData[id].restock);
        if (amount <= 0) continue;

        const response = await fetch(`${API_URL}/update_ingredient/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: restockData[id].current + amount,
          }),
        });

        if (response.ok) {
          delete newShortages[id];
        } else {
          console.error(`更新 ${restockData[id].name} 失敗`);
        }
      }

      setShortages(newShortages);
      alert("庫存已更新！");
    } catch (err) {
      console.error("補貨失敗", err);
      alert("補貨過程發生錯誤");
    } finally {
      setShowRestockModal(false);
    }
  };

  return (
    <div className="homepage-container">
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px", marginRight: "50px" }}>
        <button className="go-home-button" onClick={() => window.location.href = "/home"}>回首頁</button>
      </div>

      {/* 🔴 缺料提醒 */}
      {loading ? (
        <div className="loading-spinner"></div>
      ) : Object.keys(shortages).length > 0 ? (
        <div className="alert-box">
          <strong className="alert-title">提醒！</strong><br />
          {Object.entries(shortages).map(([name, detail], index) => {
            console.log("🔥 每筆資料：", name, detail);
            const value = detail.shortage;
            const originalUnit = detail.unit || "";
            let displayValue = value;
            let displayUnit = originalUnit;

            if (originalUnit === "克" && value >= 1000) {
              displayValue = value / 1000;
              displayUnit = "公斤";
            } else if (originalUnit === "毫升" && value >= 1000) {
              displayValue = value / 1000;
              displayUnit = "公升";
            }

            return (
              <div key={index}>
                {name} 庫存告急！請盡速叫貨 {displayValue.toFixed(1)} {displayUnit}
              </div>
            );
          })}
          <div className="alert-button-container">
            <button className="nav-button" onClick={() => setShowRestockModal(true)}>
              已叫貨，幫我新增到庫存
            </button>
          </div>
        </div>
      ) : (
        <div className="alert-box" style={{ backgroundColor: "#eaffea", borderColor: "#57d357" }}>
          <strong style={{ fontSize: "24px", color: "#228B22" }}>✅ 原料充足，不需補貨！</strong>
        </div>
      )}

      {/* 📈 銷售圖表 */}
      <div className="status-section">
        <h2 className="section-title">查看營業狀態</h2>
        <div className="chart-container" style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="90%" height="100%">
            <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortDate" />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const barData = payload.find(item =>
                      item.dataKey === "total" && item.color === BAR_COLOR
                    );
                    if (!barData) return null;
                    return (
                      <div style={{ background: "#fff", border: "1px solid #ccc", padding: 10 }}>
                        <p>{label}</p>
                        <p style={{ color: BAR_COLOR }}>total：${barData.value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total" fill={BAR_COLOR}>
                {chart !== "month" && (
                  <LabelList dataKey="label" position="top" />
                )}
              </Bar>
              <Line type="linear" dataKey="total" stroke={LINE_COLOR} strokeWidth={2} dot={true} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="button-group">
          <button className="nav-button" onClick={() => setChart("week")}>7天</button>
          <button className="nav-button" onClick={() => setChart("14days")}>14天</button>
          <button className="nav-button" onClick={() => setChart("month")}>30天</button>
        </div>
      </div>

      {/* 🟢 今日營業總覽 */}
      <div className="summary-section">
        <h2 className="section-title">今日營業總覽</h2>
        {(() => {
          const salesByFlavor = {};
          let totalAmount = 0;

          completedOrders.forEach((order) => {
            const completeDate = new Date(order.completed_at);
            const today = new Date();
            const isToday =
              completeDate.getFullYear() === today.getFullYear() &&
              completeDate.getMonth() === today.getMonth() &&
              completeDate.getDate() === today.getDate();

            if (!isToday) return;

            totalAmount += order.total_price;

            order.items.forEach((item) => {
              const name = item.menu_name;
              const quantity = item.quantity;
              const unit_price = item.unit_price || 0;

              if (!salesByFlavor[name]) {
                salesByFlavor[name] = { quantity: 0, total: 0 };
              }

              salesByFlavor[name].quantity += quantity;
              salesByFlavor[name].total += unit_price * quantity;
            });
          });

          return (
            <>
              <div className="sales-amount">
                今日銷售額：
                <span className="sales-amount-number">${totalAmount}</span>
              </div>
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>口味</th>
                    <th>銷售數量</th>
                    <th>總金額</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(salesByFlavor).map(([name, data]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{data.quantity}個</td>
                      <td>${data.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          );
        })()}
      </div>

      {/* 🟣 今日已完成訂單 */}
      <div className="summary-section">
        <h2 className="section-title">今日已完成訂單</h2>
        {completedOrders.length === 0 ? (
          <p>尚無完成訂單紀錄。</p>
        ) : (
          <table className="sales-table">
            <thead>
              <tr>
                <th>餐點內容</th>
                <th>訂購時間</th>
                <th>完成時間</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              {completedOrders
                .filter((order) => {
                  if (!order.completed_at) return false;
                  const completeDate = new Date(order.completed_at);
                  const today = new Date();
                  return (
                    completeDate.getFullYear() === today.getFullYear() &&
                    completeDate.getMonth() === today.getMonth() &&
                    completeDate.getDate() === today.getDate()
                  );
                })
                .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
                .map((order) => {
                  const formatTime = (str) => {
                    if (!str) return "—";
                    const d = new Date(str);
                    const hh = String(d.getHours()).padStart(2, "0");
                    const mm = String(d.getMinutes()).padStart(2, "0");
                    return `${hh}:${mm}`;
                  };

                  return (
                    <tr key={order.id}>
                      <td>
                        {order.items.map((item, index) => (
                          <div key={index}>{item.menu_name} × {item.quantity}</div>
                        ))}
                      </td>
                      <td>{formatTime(order.created_at)}</td>
                      <td>{formatTime(order.completed_at)}</td>
                      <td>${order.total_price}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>

      {/* 🔘 補貨視窗 */}
      {showRestockModal && (
        <AddToInventoryModal
          shortages={shortages}
          onSubmit={handleRestockSubmit}
          onClose={() => setShowRestockModal(false)}
        />
      )}
    </div>
  );
};

export default BusinessStatus;
