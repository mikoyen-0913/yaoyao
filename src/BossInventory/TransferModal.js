import React, { useEffect, useState } from "react";
import "./TransferModal.css";

const API_HOST = window.location.hostname; // 例：localhost
const API_URL = `http://${API_HOST}:5000`;

const TransferModal = ({ open, onClose, onSubmit, data, storeList = [] }) => {
  const [toStore, setToStore] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 開啟時初始化
  useEffect(() => {
    if (!open) return;
    setQuantity("");
    // 預設目標分店：清單中第一個且不等於目前分店
    const defaultTarget = (storeList || []).find((s) => s !== data?.store) || "";
    setToStore(defaultTarget);
  }, [open, data, storeList]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("popup-overlay")) onClose?.();
  };

  const handleSubmit = async () => {
    // 前端檢查
    if (!toStore) return alert("請選擇目標分店");
    if (!quantity) return alert("請填寫調貨數量");
    const n = Number(quantity);
    if (!Number.isFinite(n) || n <= 0) return alert("調貨數量需為正數");
    if (toStore === data?.store) return alert("來源與目標分店不能相同");

    // 對齊後端需要的欄位
    const payload = {
      from_store: data?.store,
      to_store: toStore,
      ingredient_id: data?.id,       // 可供後端比對來源/目的的食材文件
      ingredient_name: data?.name,   // 名稱也提供，提高比對成功率
      unit: data?.unit,
      quantity: n,
    };

    try {
      setSubmitting(true);
      // ★ 打到 /superadmin/transfer_ingredient（後端真正處理的端點）
      const res = await fetch(`${API_URL}/superadmin/transfer_ingredient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text(); // 方便除錯
      if (!res.ok) {
        console.error("Transfer failed:", res.status, text);
        let msg = "調貨失敗";
        try {
          msg = JSON.parse(text).error || msg;
        } catch {}
        throw new Error(msg);
      }

      // 成功：通知父層、關閉視窗
      try {
        const result = JSON.parse(text);
        onSubmit?.({ ok: true, request: payload, response: result });
      } catch {
        onSubmit?.({ ok: true, request: payload });
      }
      alert("✅ 調貨成功");
      onClose?.();
    } catch (err) {
      console.error(err);
      alert(err.message || "調貨失敗");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
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
            <select
              value={toStore}
              onChange={(e) => setToStore(e.target.value)}
            >
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
            <button className="cancel-btn" onClick={onClose} disabled={submitting}>
              返回
            </button>
            <button
              className="edit-submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "送出中…" : "送出"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
