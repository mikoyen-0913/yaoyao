import React, { useEffect, useState } from "react";
import "./OrdersPage.css";

const API_URL = "http://127.0.0.1:5000"; // Flask server 路徑

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  // 🚀 取得訂單資料
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/get_orders`);
      if (!response.ok) throw new Error("取得訂單失敗");
      const data = await response.json();
      setOrders(data.orders); // 假設後端傳回 { orders: [...] }
    } catch (error) {
      console.error("讀取訂單錯誤:", error);
    }
  };

  // 🚀 單筆完成（刪除）
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

  // 🚀 一次刪除五筆
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
          <span className="icon" onClick={() => window.history.back()}>↩</span>
          <span className="icon" onClick={fetchOrders}>↻</span>
        </div>
      </div>

      <div className="orders-list">
        {orders.slice(0, 5).map((order) => (
          <div key={order.id} className="order-card">
            <pre className="order-items">{order.items}</pre>
            <div className="order-price">${order.total_price}</div>
            <button className="done-button" onClick={() => handleDone(order.id)}>完成</button>
          </div>
        ))}
      </div>

      <button className="delete-all-button" onClick={handleDeleteFive}>
        一次刪除五筆訂單
      </button>
    </div>
  );
};

export default OrdersPage;
