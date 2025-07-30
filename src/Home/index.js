import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import redbeanImg from "./redbean.jpg";

const Home = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || '使用者';
  const storeName = localStorage.getItem('store_name') || '商店';
  const role = localStorage.getItem('role') || 'staff';
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
          {username}<span className="arrow">⌄</span>
        </button>

        {showMenu && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={handleLogout}>登出</button>
          </div>
        )}
      </div>

      {/* ✅ 大老闆顯示企業總覽，一般顯示店名 */}
      <h2 className="welcome-text">
        歡迎來到 {role === "superadmin" ? "企業總覽" : storeName}
      </h2>

      <div className="button-group">
        {role !== 'superadmin' && (
          <button className="nav-button" onClick={() => navigate('/orders')}>顯示訂單</button>
        )}

        <button
          className="nav-button"
          onClick={() => navigate(role === 'superadmin' ? '/bossinventory' : '/inventory')}
        >
          {role === 'superadmin' ? "查看各店庫存" : "查看庫存"}
        </button>

        <button
          className="nav-button"
          onClick={() =>
            navigate(role === "superadmin" ? "/bossbusinessstatus" : "/businessstatus")
          }
        >
          {role === 'superadmin' ? "查看各店營業報表" : "查看營業狀態"}
        </button>

        <button className="nav-button" onClick={() => navigate('/recipe')}>管理食譜</button>
      </div>


      <div className="image-box">
        <img src={redbeanImg} alt="紅豆餅" className="hero-image" />
      </div>
    </div>
  );
};

export default Home;
