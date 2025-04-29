import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import OrderEditForm from "../components/OrderEditForm";
import "../style/components/OrderEditForm.css";

const HOME_PATH = "/home";
const API_URL = "http://127.0.0.1:5000";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const navigate = useNavigate();

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
      const response = await fetch(`${API_URL}/complete_order/${id}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("標記完成失敗");
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompleteFive = async () => {  // 🟠改名，且邏輯修改
    const idsToComplete = orders.slice(0, 5).map((order) => order.id);
    try {
      const response = await fetch(`${API_URL}/complete_multiple_orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToComplete }),
      });
      if (!response.ok) throw new Error("批次標記完成失敗");
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
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

  const handleSaveEdit = async (updatedOrder) => {
    try {
      const response = await fetch(`${API_URL}/update_order/${updatedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedOrder.items,
          total_price: updatedOrder.total_price,
        }),
      });
      if (!response.ok) throw new Error("更新失敗");
      setShowEditForm(false);
      setEditingOrder(null);
      fetchOrders();
    } catch (error) {
      alert("更新失敗");
      console.error(error);
    }
  };

  const handleRevertCompleted = async () => {
    try {
      const response = await fetch(`${API_URL}/revert_all_completed_orders`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("復原失敗");
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
          <button onClick={handleRevertCompleted}>復原完成訂單</button>
        </div>
      </div>

      <div style={{ textAlign: "right", marginTop: "10px" }}>
        <button className="go-home-button" onClick={() => navigate(HOME_PATH)}>
          回首頁
        </button>
      </div>

      <div className="orders-list">
        {orders.map((order, index) => (
          <React.Fragment key={order.id}>
            <div className="order-card">
              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx}>
                    {item.menu_name} x{item.quantity}
                  </div>
                ))}
              </div>
              <div className="order-meta">
                <div className="order-number">{index + 1}</div>
                <div className="order-price">${order.total_price}</div>
              </div>
              <div className="order-actions">
                <button
                  className="modify-button"
                  onClick={() => {
                    setEditingOrder(order);
                    setShowEditForm(true);
                  }}
                >
                  編輯
                </button>
                <button
                  className="remove-button"
                  onClick={() => handleDelete(order.id)}
                >
                  刪除
                </button>
              </div>
              <button
                className="done-button"
                onClick={() => handleDone(order.id)}
              >
                完成
              </button>
            </div>

            {index === 4 && (
              <button
                className="delete-all-button"
                style={{ gridColumn: "1 / -1" }}
                onClick={handleCompleteFive} 
              >
                一次完成五筆訂單
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {showEditForm && (
        <OrderEditForm
          orderData={editingOrder}
          onClose={() => {
            setShowEditForm(false);
            setEditingOrder(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default OrdersPage;
