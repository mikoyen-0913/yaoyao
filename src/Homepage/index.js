import React from "react";
import "./HomePage.css";
import redbeanImg from "./redbean.jpg"; // 圖片放在同資料夾

const HomePage = () => {
  return (
    <div className="homepage-container">
      <h2 className="welcome-text">歡迎 XXX</h2>

      <div className="button-group">
        <button className="nav-button">顯示訂單</button>
        <button className="nav-button">查看庫存</button>
        <button className="nav-button">查看營業狀態</button>
      </div>

      <div className="image-box">
        <img src={redbeanImg} alt="紅豆餅" className="hero-image" />
      </div>
    </div>
  );
};

export default HomePage;
