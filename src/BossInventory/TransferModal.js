import React, { useEffect, useState } from "react";
import "./TransferModal.css";

const API_HOST = window.location.hostname;
const API_URL = `http://${API_HOST}:5000`;

const TransferModal = ({ open, onClose, onSubmit, data, storeList = [] }) => {
  const [toStore, setToStore] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 開啟時初始化
  useEffect(() => {
    if (!open) return;
    setQuantity("");
    const defaultTarget = (storeList || []).find((s) => s !== data?.store) || "";
    setToStore(defaultTarget);
  }, [open, data, storeList]);

  // ⛳ 監聽 Esc 鍵
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("popup-overlay")) onClose?.();
  };

  const handleSubmit = async () => {
    if (!toStore) return alert("請選擇目標分店");
    if (!quantity) return alert("請填寫調貨數量");
    const n = Number(quantity);
    if (!Number.isFinite(n) || n <= 0) return alert("調貨數量需為正數");
    if (toStore === data?.store) return alert("來源與目標分店不能相同");

    const payload = {
      from_store: data?.store,
      to_store: toStore,
      ingredient_id: data?.id,
      ingredient_name: data?.name,
      unit: data?.unit,
      quantity: n,
    };

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/superadmin/transfer_ingredient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) {
        let msg = "調貨失敗";
        try {
          msg = JSON.parse(text).error || msg;
        } catch {}
        throw new Error(msg);
      }

      try {
        const result = JSON.parse(text);
        onSubmit?.({ ok: true, request: payload, response: result });
      } catch {
        onSubmit?.({ ok: true, request: payload });
      }
      alert("✅ 調貨成功");
      onClose?.();
    } catch (err) {
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
              className="store-selector"
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
              className="search-box"
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
