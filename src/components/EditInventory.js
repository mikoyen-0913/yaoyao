import React, { useState, useEffect } from "react";
import "../style/components/EditInventory.css";

const EditInventory = ({ onClose, onSave, data }) => {
  const [id, setId] = useState(null);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("克");
  const [price, setPrice] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  useEffect(() => {
    if (data) {
      setId(data.id || null);
      setItemName(data.name || "");
      setQuantity(data.quantity || "");
      setUnit(data.unit || "克");
      setPrice(data.price || "");
      setExpirationDate(data.expiration_date ? data.expiration_date.slice(0, 10) : "");
    }
  }, [data]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSave = () => {
    if (!itemName || !quantity || !unit || !price || !expirationDate) {
      return alert("請填寫完整資訊");
    }

    const ingredient = {
      id,
      name: itemName,
      quantity: Number(quantity),
      unit,
      price: Number(price),
      expiration_date: expirationDate,
    };

    onSave(ingredient);
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="item-form">
          <h2>編輯食材</h2>

          <div className="form-group">
            <label>品項</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>數量</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>單位</label>
            <select
              className="unit-select"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="克">克</option>
              <option value="毫升">毫升</option>
            </select>
          </div>

          <div className="form-group">
            <label>價格</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="form-group expiration-row">
            <label>保存期限</label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>

          <div className="buttons">
            <button className="cancel-btn" onClick={onClose}>
              返回
            </button>
            <button className="edit-submit-btn" onClick={handleSave}>
              送出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInventory;
