// C:\Users\s8102\yaoyao\src\BossInventory\TransferModal.js
import React, { useEffect, useState } from "react";
import "./TransferModal.css"; // 跟 js 同一層

const TransferModal = ({ open, onClose, onSubmit, data, storeList = [] }) => {
  const [toStore, setToStore] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuantity("");
    const defaultTarget = (storeList || []).find((s) => s !== data?.store) || "";
    setToStore(defaultTarget);
  }, [open, data, storeList]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!toStore || !quantity) {
      alert("請選擇目標分店並填寫調貨數量");
      return;
    }
    const payload = {
      item_id: data?.id,
      item_name: data?.name,
      unit: data?.unit,
      from_store: data?.store,
      to_store: toStore,
      transfer_qty: Number(quantity),
    };
    onSubmit?.(payload);
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="item-form">
          <h2>調貨</h2>

          <div className="form-group">
            <label>品項</label>
            <input type="text" value={data?.name || ""} readOnly />
          </div>

          <div className="form-group">
            <label>目前分店</label>
            <input type="text" value={data?.store || ""} readOnly />
          </div>

          <div className="form-group">
            <label>目標分店</label>
            <select value={toStore} onChange={(e) => setToStore(e.target.value)}>
              <option value="" disabled>
                請選擇
              </option>
              {(storeList || [])
                .filter((s) => s !== data?.store)
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>調貨數量</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="請輸入數量"
            />
          </div>

          <div className="form-group">
            <label>單位</label>
            <input type="text" value={data?.unit || ""} readOnly />
          </div>

          <div className="buttons">
            <button className="cancel-btn" onClick={onClose}>
              返回
            </button>
            <button className="edit-submit-btn" onClick={handleSubmit}>
              送出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
