import React, { useState, useEffect } from "react";
import "./../style/components/AddToInventoryModal.css";

const AddToInventoryModal = ({ onClose, onSubmit }) => {
  const [ingredients, setIngredients] = useState([]);
  const [restockData, setRestockData] = useState({});

  const API_URL = "http://127.0.0.1:5000";

  useEffect(() => {
    fetch(`${API_URL}/get_ingredients`)
      .then((res) => res.json())
      .then((data) => {
        const lowStockItems = data.ingredients.filter((item) => item.quantity < 10);
        const suggestion = {};
        lowStockItems.forEach((item) => {
          suggestion[item.id] = {
            name: item.name,
            unit: item.unit,
            current: item.quantity,
            restock: 10 - item.quantity, // 建議補足到 10
          };
        });
        setIngredients(lowStockItems);
        setRestockData(suggestion);
      });
  }, []);

  const handleChange = (id, value) => {
    setRestockData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        restock: Number(value)
      }
    }));
  };

  const handleConfirm = () => {
    onSubmit(restockData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-window">
        <h2 className="modal-title">確認已經叫貨</h2>
        <div className="modal-content">
          {ingredients.map((item) => (
            <div key={item.id} className="modal-row">
              <span className="item-name">{item.name}</span>
              <span>目前：{item.quantity}{item.unit}</span>
              <label>
                實際進貨：
                <input
                  type="number"
                  min="0"
                  value={restockData[item.id]?.restock || 0}
                  onChange={(e) => handleChange(item.id, e.target.value)}
                />{" "}
                {item.unit}
              </label>
            </div>
          ))}
        </div>
        <div className="modal-buttons">
          <button className="cancel-button" onClick={onClose}>取消</button>
          <button className="confirm-button" onClick={handleConfirm}>確定新增</button>
        </div>
      </div>
    </div>
  );
};

export default AddToInventoryModal;
