import React, { useEffect, useState, useCallback } from "react";
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

  const token = localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/get_orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("取得訂單失敗");
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error("讀取訂單錯誤:", error);
    }
  }, [token]);

const handleDone = async (id) => {
  const confirmed = window.confirm("確定要將此訂單標記為完成嗎？此操作無法復原！");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_URL}/move_to_completed/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("完成失敗");
    fetchOrders(); // ✅ 重新整理訂單
  } catch (error) {
    console.error("完成訂單錯誤:", error);
  }
};


  const handleCompleteFive = async () => {
    const idsToComplete = orders.slice(0, 5).map((order) => order.id);
    try {
      const response = await fetch(`${API_URL}/complete_multiple_orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: idsToComplete }),
      });
      if (!response.ok) throw new Error("批次標記完成失敗");
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("確定要刪除這筆訂單嗎？此動作無法復原！");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/delete_order/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("刪除訂單失敗");
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveEdit = async (updatedOrder) => {
    const isEdit = !!updatedOrder.id;

    try {
      const url = isEdit
        ? `${API_URL}/update_order/${updatedOrder.id}`
        : `${API_URL}/place_order`;

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: updatedOrder.items,
          total_price: updatedOrder.total_price,
        }),
      });

      if (!response.ok) throw new Error(isEdit ? "更新失敗" : "新增失敗");

      setShowEditForm(false);
      setEditingOrder(null);
      fetchOrders();
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>顯示訂單</h2>
        <div className="icon-group">
          <button
            onClick={() => {
              setEditingOrder({}); // 🆕 傳入空資料 → 新增模式
              setShowEditForm(true);
            }}
          >
            新增訂單
          </button>
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
