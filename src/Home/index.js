import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import redbeanImg from "./redbean.jpg";

const Home = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || '使用者';
  const storeName = localStorage.getItem('store_name') || '商店';
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('store_name');
    navigate('/'); // ✅ 導回登入頁
  };

  return (
    <div className="homepage-container">
      {/* ✅ 右上角使用者區塊 */}
      <div className="user-menu">
        <button className="user-button" onClick={() => setShowMenu(!showMenu)}>
          {username} ⌄
        </button>
        {showMenu && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={handleLogout}>登出</button>
          </div>
        )}
      </div>

      <h2 className="welcome-text">歡迎來到 {storeName}</h2>


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
