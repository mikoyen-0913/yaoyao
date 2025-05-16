import React, { useState, useEffect } from "react";
import "./index.css";
import AddToInventoryModal from "../components/AddToInventoryModal";

import chartWeek from "./chart-week.png";
import chart14days from "./chart-14days.png";
import chartMonth from "./chart-month.png";

const API_URL = "http://127.0.0.1:5000";

const BusinessStatus = () => {
  const [chart, setChart] = useState("week");
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [completedOrders, setCompletedOrders] = useState([]);

  const token = localStorage.getItem("token"); // ✅ 取得 token

  const getChartImage = () => {
    if (chart === "week") return chartWeek;
    if (chart === "14days") return chart14days;
    if (chart === "month") return chartMonth;
  };

  const handleRestockSubmit = async (restockData) => {
    try {
      for (const id in restockData) {
        const amount = Number(restockData[id].restock);
        if (amount <= 0) continue;

        const response = await fetch(`${API_URL}/update_ingredient/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // ✅ 加入 token
          },
          body: JSON.stringify({
            quantity: restockData[id].current + amount,
          }),
        });

        if (!response.ok) {
          console.error(`更新 ${restockData[id].name} 失敗`);
        }
      }

      alert("庫存已更新！");
    } catch (err) {
      console.error("補貨失敗", err);
      alert("補貨過程發生錯誤");
    } finally {
      setShowRestockModal(false);
    }
  };

  // ✅ 取得已完成訂單（加上 token）
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

  return (
    <div className="homepage-container">
      {/* 🔵 回首頁按鈕 */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px", marginRight: "50px" }}>
        <button className="go-home-button" onClick={() => window.location.href = "/home"}>
          回首頁
        </button>
      </div>

      {/* 🔴 庫存提醒框 */}
      <div className="alert-box">
        <strong className="alert-title">提醒！</strong><br />
        雞蛋庫存告急！請盡速叫貨2箱<br />
        紅豆庫存告急！請盡速叫貨5KG<br />
        麵粉將於<span className="alert-date">2025/4/1</span>到期！請盡速使用完畢
        <div className="alert-button-container">
          <button className="nav-button" onClick={() => setShowRestockModal(true)}>
            已叫貨，幫我新增到庫存
          </button>
        </div>
      </div>

      {/* 🟡 營業狀態圖表 */}
      <div className="status-section">
        <h2 className="section-title">查看營業狀態</h2>
        <div className="chart-container">
          <img src={getChartImage()} alt="營業狀態圖表" className="chart-image" />
        </div>
        <div className="button-group">
          <button className="nav-button" onClick={() => setChart("week")}>一周</button>
          <button className="nav-button" onClick={() => setChart("14days")}>14天</button>
          <button className="nav-button" onClick={() => setChart("month")}>一個月</button>
        </div>
      </div>

      {/* 🟢 今日總覽區塊 */}
      <div className="summary-section">
        <h2 className="section-title">今日營業總覽</h2>
        <div className="sales-amount">
          今日銷售額：<span className="sales-amount-number">$8000</span>
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
            <tr><td>原味紅豆餅</td><td>100個</td><td>$1500</td></tr>
            <tr><td>奶油餅</td><td>45個</td><td>$675</td></tr>
            <tr><td>巧克力餅</td><td>60個</td><td>$1200</td></tr>
          </tbody>
        </table>
      </div>

      {/* 🟣 已完成訂單區塊 */}
{/* 🟣 已完成訂單區塊 */}
<div className="summary-section">
  <h2 className="section-title">已完成訂單</h2>
  {completedOrders.length === 0 ? (
    <p>尚無完成訂單紀錄。</p>
  ) : (
    <table className="sales-table">
      <thead>
        <tr>
          <th className="col-wide">餐點內容</th>
          <th className="col-wide">完成時間</th>
          <th className="col-narrow">金額</th>
        </tr>
      </thead>
      <tbody>
        {completedOrders.map((order) => (
          <tr key={order.id}>
            <td>
              {order.items.map((item, idx) => (
                <div key={idx}>{item.menu_name} x{item.quantity}</div>
              ))}
            </td>
            <td>
              {order.completed_at && order.completed_at.seconds
                ? new Date(order.completed_at.seconds * 1000).toLocaleString()
                : "------"}
            </td>
            <td>${order.total_price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>




      {/* 🔘 補貨視窗 */}
      {showRestockModal && (
        <AddToInventoryModal
          onClose={() => setShowRestockModal(false)}
          onSubmit={handleRestockSubmit}
        />
      )}
    </div>
  );
};

export default BusinessStatus;
