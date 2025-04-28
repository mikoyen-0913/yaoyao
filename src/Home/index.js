import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ 導入 useNavigate
import "./index.css";
import redbeanImg from "./redbean.jpg";

const Home = () => {
  const navigate = useNavigate(); // ✅ 取得導航函式

  return (
    <div className="homepage-container">
      <h2 className="welcome-text">歡迎 XXX</h2>

      <div className="button-group">
        <button className="nav-button" onClick={() => navigate('/orders')}>顯示訂單</button>
        <button className="nav-button" onClick={() => navigate('/inventory')}>查看庫存</button>
        <button className="nav-button" onClick={() => navigate('/businessstatus')}>查看營業狀態</button>
      </div>

      <div className="image-box">
        <img src={redbeanImg} alt="紅豆餅" className="hero-image" />
      </div>
    </div>
  );
};

export default Home;
