import React, { useState } from "react";
import "./index.css";
import AddToInventoryModal from "../components/AddToInventoryModal";

const BusinessStatus = () => {
  const [chart, setChart] = useState("week");
  const [showRestockModal, setShowRestockModal] = useState(false);

  const API_URL = "http://127.0.0.1:5000";

  const handleRestockSubmit = async (restockData) => {
    try {
      for (const id in restockData) {
        const amount = Number(restockData[id].restock);
        if (amount <= 0) continue;

        const response = await fetch(`${API_URL}/update_ingredient/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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

  const getChartImage = () => {
    if (chart === "week") return "./chart-week.png";
    if (chart === "14days") return "./chart-14days.png";
    if (chart === "month") return "./chart-month.png";
  };

  return (
    <div className="homepage-container">
      {/* 回首頁按鈕 */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px", marginRight: "20px" }}>
        <button className="go-home-button" onClick={() => window.location.href = "/home"}>回首頁</button>
      </div>

      {/* 提醒框 */}
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

      {/* 營業狀態 */}
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

      {/* 今日營業總覽 */}
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
            <tr><td>原味紅豆餅</td><td>100個</td><td>1500元</td></tr>
            <tr><td>奶油餅</td><td>45個</td><td>675元</td></tr>
            <tr><td>巧克力餅</td><td>60個</td><td>1200元</td></tr>
          </tbody>
        </table>
      </div>

      {/* 彈窗元件 */}
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
