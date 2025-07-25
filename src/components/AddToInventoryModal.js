import React, { useState, useEffect } from "react";
import "../style/components/AddToInventoryModal.css";

const AddToInventoryModal = ({ onClose, shortages }) => {
  const [restockData, setRestockData] = useState({});
  const API_URL = "http://127.0.0.1:5000";

  useEffect(() => {
    const suggestion = {};
    Object.entries(shortages).forEach(([name, info]) => {
      suggestion[name] = {
        name,
        unit: info.unit || "克",
        shortage: info.shortage,
        restock: info.shortage,
        expiration_date: "",
      };
    });
    setRestockData(suggestion);
  }, [shortages]);

  const handleChange = (name, field, value) => {
    setRestockData((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: field === "restock" ? Number(value) : value,
      },
    }));
  };

  const addSingleIngredient = async (name) => {
    const data = restockData[name];
    const token = localStorage.getItem("token");

    if (!data.expiration_date) {
      alert(`請為 ${name} 輸入有效期限`);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/add_ingredient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          quantity: data.restock,
          unit: data.unit,
          expiration_date: data.expiration_date,
          price: 0
        }),
      });

      if (!response.ok) throw new Error("新增失敗");

      setRestockData((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });

      alert(`${name} 新增成功！`);
    } catch (err) {
      console.error(`${name} 新增失敗：`, err);
      alert(`新增 ${name} 發生錯誤`);
    }
  };

  const addAllIngredients = async () => {
    const token = localStorage.getItem("token");
    try {
      for (const name in restockData) {
        const item = restockData[name];
        if (!item.expiration_date) {
          alert(`請填寫 ${name} 的有效期限`);
          return;
        }

        await fetch(`${API_URL}/add_ingredient`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: item.name,
            quantity: item.restock,
            unit: item.unit,
            expiration_date: item.expiration_date,
            price: 0
          }),
        });
      }

      alert("全部缺料新增完成！");
      onClose();
    } catch (err) {
      console.error("新增全部失敗", err);
      alert("新增過程發生錯誤");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-window">
        <h2 className="modal-title">確認缺料補貨</h2>
        <div className="modal-content">
          {Object.keys(restockData).length === 0 ? (
            <div style={{ textAlign: "center", fontSize: "18px", color: "#333" }}>
              ✅ 目前原料充足，不須補貨！
            </div>
          ) : (
            Object.entries(restockData).map(([name, item]) => (
              <div key={name} className="modal-row">
                <strong className="item-name">{item.name}</strong>
                <span>缺：{item.shortage.toFixed(1)} {item.unit}</span>
                <label>
                  實際進貨：
                  <input
                    type="number"
                    min="0"
                    value={item.restock}
                    onChange={(e) => handleChange(name, "restock", e.target.value)}
                  />{" "}
                  {item.unit}
                </label>
                <label>
                  保存期限：
                  <input
                    type="date"
                    value={item.expiration_date}
                    onChange={(e) => handleChange(name, "expiration_date", e.target.value)}
                  />
                </label>
                <button className="single-add-btn" onClick={() => addSingleIngredient(name)}>
                  ＋ 新增此食材
                </button>
              </div>
            ))
          )}
        </div>

        <div className="modal-buttons">
          <button className="cancel-button" onClick={onClose}>取消</button>
          {Object.keys(restockData).length > 0 && (
            <button className="confirm-button" onClick={addAllIngredients}>✔ 新增全部食材</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToInventoryModal;

