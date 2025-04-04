import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 搬到最上面
import "./index.css";

const HOME_PATH = "/home";
const API_URL = "http://127.0.0.1:5000";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate(); // ✅ 初始化導頁方法

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/get_orders`);
      if (!response.ok) throw new Error("取得訂單失敗");
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error("讀取訂單錯誤:", error);
    }
  };

  const handleDone = async (id) => {
    try {
      const response = await fetch(`${API_URL}/delete_order/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("刪除訂單失敗");
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteFive = async () => {
    const idsToDelete = orders.slice(0, 5).map((order) => order.id);
    try {
      const response = await fetch(`${API_URL}/delete_multiple_orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToDelete }),
      });
      if (!response.ok) throw new Error("批次刪除失敗");
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>顯示訂單</h2>
        <div className="icon-group">
          {/* ✅ 原本的返回與刷新按鈕保持不變 */}
          <span className="icon" onClick={() => window.history.back()}>↩</span>
          <span className="icon" onClick={fetchOrders}>↻</span>
        </div>
      </div>

      {/* ✅ 新增的回首頁按鈕 */}
      <div style={{ textAlign: "right", marginTop: "10px" }}>
        <button
          className="go-home-button"
          onClick={() => navigate(HOME_PATH)}
        >
          回首頁
        </button>
      </div>

      <div className="orders-list">
        {orders.slice(0, 5).map((order, index) => (
          <div key={order.id} className="order-card">
            <div className="order-items">
              {order.items.map((item, idx) => (
                <div key={idx}>{item.menu_name} x{item.quantity}</div>
              ))}
            </div>
            <div className="order-number">{index + 1}</div>
            <div className="order-price">${order.total_price}</div>
            <div className="order-actions">
              <button className="edit-button">編輯</button>
              <button className="delete-button" onClick={() => handleDone(order.id)}>刪除</button>
            </div>
            <button className="done-button" onClick={() => handleDone(order.id)}>完成</button>
          </div>
        ))}
      </div>

      <button className="delete-all-button" onClick={handleDeleteFive}>
        一次完成五筆訂單
      </button>
    </div>
  );
};

export default OrdersPage;
