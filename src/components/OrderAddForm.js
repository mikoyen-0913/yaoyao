import React, { useEffect, useState } from "react";
import "../style/components/OrderAddForm.css";

const OrderAddForm = ({ onClose, onOrderCreated }) => {
  const [menus, setMenus] = useState([]);
  const [items, setItems] = useState([{ menu_id: "", quantity: 1 }]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/get_menus")
      .then((res) => res.json())
      .then((data) => setMenus(data.menus));
  }, []);

  const addItem = () => {
    setItems([...items, { menu_id: "", quantity: 1 }]);
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const totalPrice = items.reduce((sum, item) => {
    const menu = menus.find((m) => m.id === item.menu_id);
    const price = menu ? menu.price : 0;
    return sum + price * item.quantity;
  }, 0);

  const handleSubmit = async () => {
    const validItems = items.filter((i) => i.menu_id && i.quantity > 0);
    if (validItems.length === 0) return alert("請填入至少一筆有效品項");

    const res = await fetch("http://127.0.0.1:5000/place_order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: validItems }),
    });

    if (res.ok) {
      onOrderCreated();
      onClose();
    } else {
      alert("送出失敗");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>新增訂單</h2>

        {items.map((item, idx) => (
          <div className="form-group" key={idx}>
            <label>品項</label>
            <div className="row-group">
              <select
                value={item.menu_id}
                onChange={(e) => updateItem(idx, "menu_id", e.target.value)}
              >
                <option value="">請選擇</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(idx, "quantity", parseInt(e.target.value))
                }
              />

              <button
                className="order-add-remove-btn"
                onClick={() => removeItem(idx)}
                title="移除此品項"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        <button onClick={addItem} className="order-add-action-btn">
          新增品項
        </button>

        <div className="total-price">預估總金額：${totalPrice}</div>

        <div className="buttons">
          <button className="order-add-cancel-btn" onClick={onClose}>
            取消
          </button>
          <button className="order-add-submit-btn" onClick={handleSubmit}>
            送出訂單
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderAddForm;
