import React, { useState } from "react";
import "./index.css";

const BusinessStatus = () => {
  const [chart, setChart] = useState("week"); // 預設顯示一周

  const getChartImage = () => {
    if (chart === "week") {
      return "./chart-week.png"; // 放一周的圖
    } else if (chart === "14days") {
      return "./chart-14days.png"; // 放14天的圖
    } else if (chart === "month") {
      return "./chart-month.png"; // 放一個月的圖
    }
  };

  return (
    <div className="homepage-container">
      {/* 提醒框 */}
      <div className="alert-box">
        <strong className="alert-title">提醒！</strong><br />
        雞蛋庫存告急！請盡速叫貨2箱<br />
        紅豆庫存告急！請盡速叫貨5KG<br />
        麵粉將於<span className="alert-date">2025/4/1</span>到期！請盡速使用完畢
        <div className="alert-button-container">
          <button className="nav-button">已叫貨，幫我新增到庫存</button>
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
        <div className="sales-amount">今日銷售額：<span className="sales-amount-number">$8000</span></div>

        <table className="sales-table">
          <thead>
            <tr>
              <th>口味</th>
              <th>銷售數量</th>
              <th>總金額</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>原味紅豆餅</td>
              <td>100個</td>
              <td>1500元</td>
            </tr>
            <tr>
              <td>奶油餅</td>
              <td>45個</td>
              <td>675元</td>
            </tr>
            <tr>
              <td>巧克力餅</td>
              <td>60個</td>
              <td>1200元</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusinessStatus;
