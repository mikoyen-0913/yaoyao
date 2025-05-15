import React, { useEffect, useState } from "react";
import "../style/components/OrderEditForm.css";

const OrderEditForm = ({ orderData, onClose, onSave }) => {
  const [items, setItems] = useState(orderData.items);
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/get_menus")
      .then((res) => res.json())
      .then((data) => setMenus(data.menus))
      .catch((err) => console.error("無法載入菜單資料", err));
  }, []);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { menu_id: "", menu_name: "", quantity: 1, unit_price: 0 }]);
  };

  const handleMenuChange = (index, menuId) => {
    const menu = menus.find((m) => m.id === menuId);
    if (!menu) return;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      menu_id: menu.id,
      menu_name: menu.name,
      unit_price: menu.price,
    };
    setItems(updated);
  };

  const totalPrice = items.reduce((sum, item) => {
    const price = item.unit_price || item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const handleSave = () => {
    const validItems = items.filter((item) => item.menu_name && item.quantity > 0);
    const updatedOrder = {
      ...orderData,
      items: validItems,
      total_price: totalPrice,
    };
    onSave(updatedOrder);
  };

  return (
    <div className="order-edit-overlay">
      <div className="order-edit-popup">
        <h2>編輯訂單</h2>

        {items.map((item, idx) => (
          <div className="form-group" key={idx}>
            <label>品項</label>
            <div className="row-group">
              <select
                value={item.menu_id || ""}
                onChange={(e) => handleMenuChange(idx, e.target.value)}
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
                className="remove-btn"
                onClick={() => removeItem(idx)}
                title="移除此品項"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        <button className="order-edit-add-btn" onClick={handleAddItem}>
          新增品項
        </button>

        <div className="total-price">預估總金額：${totalPrice}</div>

        <div className="edit-buttons">
          <button className="order-edit-cancel-btn" onClick={onClose}>
            返回
          </button>
          <button className="order-edit-submit-btn" onClick={handleSave}>
            送出
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderEditForm;