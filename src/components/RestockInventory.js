// src/components/RestockInventory.js
import React, { useState, useEffect } from "react";
// 假設您有一個通用的 Modal CSS，如果沒有，此組件會使用 inline styles 模擬您的截圖樣式

const RestockInventory = ({ data, onClose, onSave }) => {
  // 補貨數量
  const [addQuantity, setAddQuantity] = useState("");
  // 單位 (預設帶入該食材單位)
  const [unit, setUnit] = useState(data?.unit || "克");
  // 效期
  const [expirationDate, setExpirationDate] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初始化
  useEffect(() => {
    if (data) {
      setUnit(data.unit || "克");
    }
  }, [data]);

  const handleSubmit = async () => {
    if (!addQuantity || Number(addQuantity) <= 0) {
      alert("請輸入有效的補貨數量");
      return;
    }

    setIsSubmitting(true);
    // 建構 payload
    const payload = {
        ingredient_id: data.id,
        add_quantity: Number(addQuantity),
        unit: unit,
        expiration_date: expirationDate || null
    };

    await onSave(payload);
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay" style={styles.overlay}>
      <div className="modal-content" style={styles.modal}>
        <h2 style={styles.title}>補貨：{data?.name}</h2>
        
        <div className="form-group" style={styles.group}>
            <label style={styles.label}>目前使用中庫存</label>
            <input 
                type="text" 
                value={data?.quantity} 
                disabled 
                style={{...styles.input, backgroundColor: "#f5f5f5", color: "#666"}} 
            />
        </div>

        <div className="form-group" style={styles.group}>
            <label style={styles.label}>目前預備庫存</label>
            <input 
                type="text" 
                value={data?.reserved_quantity} 
                disabled 
                style={{...styles.input, backgroundColor: "#f5f5f5", color: "#666"}} 
            />
        </div>

        <div className="form-group" style={styles.group}>
          <label style={styles.label}>補貨數量 <span style={{color:"red"}}>*</span></label>
          <input
            type="number"
            value={addQuantity}
            onChange={(e) => setAddQuantity(e.target.value)}
            placeholder="請輸入數量"
            style={styles.input}
          />
        </div>

        <div className="form-group" style={styles.group}>
          <label style={styles.label}>單位</label>
          <select 
            value={unit} 
            onChange={(e) => setUnit(e.target.value)}
            style={styles.select}
          >
            <option value="克">克</option>
            <option value="毫升">毫升</option>
            <option value="個">個</option>
            <option value="片">片</option>
          </select>
        </div>

        <div className="form-group" style={styles.group}>
          <label style={styles.label}>保存期限 (預備庫存效期)</label>
          <input
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            style={styles.input}
          />
        </div>

        <div className="modal-actions" style={styles.actions}>
          <button onClick={onClose} style={styles.cancelBtn} disabled={isSubmitting}>
            返回
          </button>
          <button onClick={handleSubmit} style={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? "送出中..." : "送出"}
          </button>
        </div>
      </div>
    </div>
  );
};

// 簡單的樣式物件，模擬您的截圖風格
const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 1000
  },
  modal: {
    backgroundColor: "#fffdf5", // 米黃色背景
    padding: "30px",
    borderRadius: "12px",
    width: "450px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    border: "2px solid #f0e6d2"
  },
  title: {
    textAlign: "center",
    color: "#5d4037",
    marginBottom: "20px",
    fontSize: "1.5rem"
  },
  group: {
    marginBottom: "15px"
  },
  label: {
    display: "block",
    marginBottom: "5px",
    color: "#4e342e",
    fontWeight: "bold"
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #cbb69d",
    fontSize: "1rem",
    boxSizing: "border-box"
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #cbb69d",
    fontSize: "1rem",
    backgroundColor: "white"
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "25px"
  },
  cancelBtn: {
    padding: "10px 30px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    fontSize: "1rem"
  },
  submitBtn: {
    padding: "10px 30px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4fc3f7", // 藍色按鈕
    color: "white",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold"
  }
};

export default RestockInventory;