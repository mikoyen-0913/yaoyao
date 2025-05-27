import React, { useState } from "react"; 
import "../style/components/AddItem.css";

const AddItem = ({ onClose, onSave }) => {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("公斤");
  const [price, setPrice] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const handleSave = () => {
    if (!itemName || !quantity || !unit || !price || !expirationDate) {
      alert("請填寫完整資訊");
      return;
    }

    onSave({
      name: itemName,
      quantity: Number(quantity),
      unit,
      price: Number(price),
      expiration_date: expirationDate,
    });

    setItemName("");
    setQuantity("");
    setUnit("公斤");
    setPrice("");
    setExpirationDate("");
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="item-form">
          <h2>新增食材</h2>

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

          <div className="form-group">
            <label>保存期限</label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>

          <div className="additem-buttons">
            <button className="additem-cancel-btn" onClick={onClose}>
              返回
            </button>
            <button className="additem-confirm-btn" onClick={handleSave}>
              送出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
