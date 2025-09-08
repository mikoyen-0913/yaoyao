// src/pages/BusinessStatus.js
import React, { useState, useEffect } from "react";
import "./index.css";
import AddToInventoryModal from "../components/AddToInventoryModal";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, LabelList
} from "recharts";
import { apiBaseUrl } from "../settings"; // ✅ 改用環境變數

const BAR_COLOR = "#2f8ac6";
const LINE_COLOR = "#ff6666";

const BusinessStatus = () => {
  const [chart, setChart] = useState("week");
  const [salesData, setSalesData] = useState([]);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [shortages, setShortages] = useState({});
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchSalesSummary = (days) => {
    fetch(`${apiBaseUrl}/get_sales_summary?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBaseUrl}/check_inventory`, {
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
          if (value.status === "缺料") filtered[key] = value;
        });
        setShortages(filtered);

        const soon = (data.expiring_soon && Array.isArray(data.expiring_soon.items))
          ? data.expiring_soon.items
          : [];
        soon.sort((a, b) => Number(a.days_left) - Number(b.days_left) || a.ingredient.localeCompare(b.ingredient));
        setExpiringSoon(soon);

        setLoading(false);
      })
      .catch((err) => {
        console.error("取得缺料/即將過期資訊失敗", err);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetch(`${apiBaseUrl}/get_completed_orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCompletedOrders(data.orders || []))
      .catch((err) => console.error("讀取已完成訂單失敗", err));
  }, [token]);

  const formatAmount = (n) => {
    const v = Math.round(Number(n || 0) * 10) / 10;
    return Number.isInteger(v) ? v.toString() : v.toFixed(1);
    };

  const convertAmountAndUnit = (value, unit) => {
    let displayValue = Number(value || 0);
    let displayUnit = unit || "";
    if (displayUnit === "克" && displayValue >= 1000) {
      displayValue = displayValue / 1000;
      displayUnit = "公斤";
    } else if (displayUnit === "毫升" && displayValue >= 1000) {
      displayValue = displayValue / 1000;
      displayUnit = "公升";
    }
    return { displayValue, displayUnit };
  };

  const handleRestockSubmit = async (restockData) => {
    try {
      const newShortages = { ...shortages };
      for (const id in restockData) {
        const amount = Number(restockData[id].restock);
        if (amount <= 0) continue;

        const response = await fetch(`${apiBaseUrl}/update_ingredient/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: restockData[id].current + amount,
          }),
        });

        if (response.ok) delete newShortages[id];
        else console.error(`更新 ${restockData[id].name} 失敗`);
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
        <button className="go-home-button" onClick={() => (window.location.href = "/home")}>回首頁</button>
      </div>

      {/* 缺料提醒 */}
      {loading ? (
        <div className="loading-spinner"></div>
      ) : Object.keys(shortages).length > 0 ? (
        <div className="alert-box">
          <strong className="alert-title">提醒！</strong>
          <p className="alert-subtitle">以下食材庫存告急！請盡速叫貨!</p>
          <ul className="alert-list">
            {Object.entries(shortages).map(([name, detail]) => {
              const value = Number(detail.shortage || 0);
              const { displayValue, displayUnit } = convertAmountAndUnit(value, detail.unit || "");
              return (
                <li key={name} className="alert-item">
                  <span className="item-name">{name}</span>
                  <span className="item-amt">
                    <b className="amt">{formatAmount(displayValue)}</b>
                    <span className="unit">{displayUnit}</span>
                  </span>
                </li>
              );
            })}
          </ul>
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

      {/* 即將到期 / 已過期 */}
      {!loading && expiringSoon.length > 0 && (
        <div className="alert-box" style={{ backgroundColor: "#fff6e5", borderColor: "#f0ad4e", marginTop: "18px" }}>
          <strong className="alert-title" style={{ color: "#b36b00" }}>提醒！</strong>
          <p className="alert-subtitle">以下食材即將到期 / 已過期，請盡速使用或下架！</p>
          <ul className="alert-list">
            {expiringSoon.map((item, idx) => {
              const { displayValue, displayUnit } = convertAmountAndUnit(item.available, item.unit || "");
              const isExpired = Number(item.days_left) < 0;
              const days = Math.abs(Number(item.days_left));
              return (
                <li key={`${item.ingredient}-${idx}`} className="alert-item">
                  <span className="item-name">
                    {item.ingredient}
                    <span style={{ fontSize: 14, color: isExpired ? "#b22222" : "#b36b00", marginLeft: 8 }}>
                      {isExpired ? `（已過期 ${days} 天）` : `（${days} 天後到期）`}
                    </span>
                  </span>
                  <span className="item-amt">
                    <b className="amt">{formatAmount(displayValue)}</b>
                    <span className="unit">{displayUnit}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 銷售圖表 */}
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
                    const barData = payload.find((item) => item.dataKey === "total" && item.color === "#2f8ac6");
                    if (!barData) return null;
                    return (
                      <div style={{ background: "#fff", border: "1px solid #ccc", padding: 10 }}>
                        <p>{label}</p>
                        <p style={{ color: "#2f8ac6" }}>total：${barData.value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total" fill={BAR_COLOR}>
                {chart !== "month" && <LabelList dataKey="label" position="top" />}
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

      {/* 今日營業總覽 */}
      <div className="summary-section">
        <h2 className="section-title">今日營業總覽</h2>
        {(() => {
          const salesByFlavor = {};
          let totalAmount = 0;

          completedOrders.forEach((order) => {
            const d = new Date(order.completed_at);
            const t = new Date();
            const isToday = d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
            if (!isToday) return;

            totalAmount += order.total_price;
            order.items.forEach((item) => {
              const name = item.menu_name;
              const quantity = item.quantity;
              const unit_price = item.unit_price || 0;

              if (!salesByFlavor[name]) salesByFlavor[name] = { quantity: 0, total: 0 };
              salesByFlavor[name].quantity += quantity;
              salesByFlavor[name].total += unit_price * quantity;
            });
          });

          return (
            <>
              <div className="sales-amount">
                今日銷售額：<span className="sales-amount-number">${totalAmount}</span>
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

      {/* 今日已完成訂單 */}
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
                  const d = new Date(order.completed_at);
                  const t = new Date();
                  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
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
                      <td>{order.items.map((item, i) => (<div key={i}>{item.menu_name} × {item.quantity}</div>))}</td>
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

      {/* 補貨視窗 */}
      {showRestockModal && (
        <AddToInventoryModal
          shortages={shortages}
          onClose={() => setShowRestockModal(false)}
        />
      )}
    </div>
  );
};

export default BusinessStatus;
