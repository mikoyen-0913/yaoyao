// src/pages/Inventory/index.js  （依你的實際路徑命名）
// 完整覆蓋版：改用 apiBaseUrl、一鍵切換 dev/prod API

import React, { useEffect, useMemo, useState } from "react";
import "./index.css";
import { apiBaseUrl } from "../settings"; // ✅ 改用環境變數
// 如果你的 settings.js 在 src/ 直下，且此檔在 src/pages/Inventory/，相對路徑應是 ../../settings

const InventoryPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [editing, setEditing] = useState(null); // { id, name, quantity, unit, expiration_date, price? }
  const [creating, setCreating] = useState({ name: "", quantity: "", unit: "克", expiration_date: "", price: "" });

  const token = useMemo(() => localStorage.getItem("token"), []);

  const authHeader = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${apiBaseUrl}/get_ingredients`, { headers: authHeader });
      if (!res.ok) throw new Error(`取得庫存失敗 (${res.status})`);
      const data = await res.json();
      setIngredients(Array.isArray(data.ingredients) ? data.ingredients : []);
    } catch (e) {
      console.error(e);
      setError(e.message || "讀取庫存失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetCreate = () => setCreating({ name: "", quantity: "", unit: "克", expiration_date: "", price: "" });

  const handleCreate = async () => {
    if (!creating.name || !creating.quantity || !creating.expiration_date) {
      alert("請輸入品名、數量與有效期限");
      return;
    }
    try {
      setBusy(true);
      setError("");
      const body = {
        name: creating.name,
        quantity: Number(creating.quantity),
        unit: creating.unit || "克",
        expiration_date: creating.expiration_date,
        price: Number(creating.price || 0),
      };
      const res = await fetch(`${apiBaseUrl}/add_ingredient`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`新增失敗 (${res.status})`);
      await fetchIngredients();
      resetCreate();
      alert("新增成功");
    } catch (e) {
      console.error(e);
      setError(e.message || "新增失敗");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (item) => {
    setEditing({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || "克",
      expiration_date: item.expiration_date || "",
      price: item.price || 0,
    });
  };

  const cancelEdit = () => setEditing(null);

  const handleUpdate = async () => {
    if (!editing) return;
    if (!editing.name || editing.quantity === "" || !editing.id) {
      alert("請完整填寫品名與數量");
      return;
    }
    try {
      setBusy(true);
      setError("");
      const body = {
        name: editing.name,
        quantity: Number(editing.quantity),
        unit: editing.unit || "克",
        expiration_date: editing.expiration_date || null,
        price: Number(editing.price || 0),
      };
      const res = await fetch(`${apiBaseUrl}/update_ingredient/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`更新失敗 (${res.status})`);
      await fetchIngredients();
      setEditing(null);
      alert("更新成功");
    } catch (e) {
      console.error(e);
      setError(e.message || "更新失敗");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`確定刪除「${name}」？`)) return;
    try {
      setBusy(true);
      setError("");
      const res = await fetch(`${apiBaseUrl}/delete_ingredient/${id}`, {
        method: "DELETE",
        headers: authHeader,
      });
      if (!res.ok) throw new Error(`刪除失敗 (${res.status})`);
      await fetchIngredients();
      alert("刪除成功");
    } catch (e) {
      console.error(e);
      setError(e.message || "刪除失敗");
    } finally {
      setBusy(false);
    }
  };

  // 依據銷售紀錄刷新庫存（後端會計算並回寫）
  const refreshBySales = async () => {
    if (!window.confirm("根據銷售紀錄刷新庫存？")) return;
    try {
      setBusy(true);
      setError("");
      const res = await fetch(`${apiBaseUrl}/refresh_inventory_by_sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
      });
      if (!res.ok) throw new Error(`刷新失敗 (${res.status})`);
      await fetchIngredients();
      alert("已刷新庫存");
    } catch (e) {
      console.error(e);
      setError(e.message || "刷新庫存失敗");
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    if (!keyword) return ingredients;
    const k = keyword.trim();
    if (!k) return ingredients;
    // 同時支援「空白分隔多關鍵字」與全形空白
    const keys = k.replace(/\u3000/g, " ").split(/\s+/).filter(Boolean);
    return ingredients.filter((it) =>
      keys.every((kk) => `${it.name}`.toLowerCase().includes(kk.toLowerCase()))
    );
  }, [ingredients, keyword]);

  const fmt = (n, digits = 0) => {
    const v = Number(n || 0);
    return v.toLocaleString("zh-TW", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  };

  return (
    <div className="inventory-container">
      <div className="top-right-button">
        <button className="go-home-button" onClick={() => (window.location.href = "/home")}>
          回首頁
        </button>
      </div>

      <h1 className="page-title">庫存管理</h1>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="搜尋品名…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button className="nav-button" onClick={refreshBySales} disabled={busy}>
          根據銷售刷新庫存
        </button>
        <button className="nav-button" onClick={fetchIngredients} disabled={busy}>
          重新整理
        </button>
      </div>

      {error && (
        <div className="alert-box" style={{ backgroundColor: "#fff0f0", borderColor: "#e57373", marginBottom: 12 }}>
          <strong style={{ color: "#c62828" }}>錯誤</strong>
          <div style={{ marginTop: 6 }}>{error}</div>
        </div>
      )}

      {/* 新增區塊 */}
      <div className="card">
        <h2 className="section-title">新增原料</h2>
        <div className="form-grid">
          <label>品名</label>
          <input
            value={creating.name}
            onChange={(e) => setCreating((p) => ({ ...p, name: e.target.value }))}
            placeholder="例如：鮮奶油"
          />

          <label>數量</label>
          <input
            type="number"
            min="0"
            step="1"
            value={creating.quantity}
            onChange={(e) => setCreating((p) => ({ ...p, quantity: e.target.value }))}
          />

          <label>單位</label>
          <select
            value={creating.unit}
            onChange={(e) => setCreating((p) => ({ ...p, unit: e.target.value }))}
          >
            <option value="克">克</option>
            <option value="公斤">公斤</option>
            <option value="毫升">毫升</option>
            <option value="公升">公升</option>
            <option value="顆">顆</option>
            <option value="份">份</option>
          </select>

          <label>有效期限</label>
          <input
            type="date"
            value={creating.expiration_date}
            onChange={(e) => setCreating((p) => ({ ...p, expiration_date: e.target.value }))}
          />

          <label>價格（可選）</label>
          <input
            type="number"
            min="0"
            step="1"
            value={creating.price}
            onChange={(e) => setCreating((p) => ({ ...p, price: e.target.value }))}
            placeholder="0"
          />
        </div>

        <div className="button-group">
          <button className="primary-button" onClick={handleCreate} disabled={busy}>新增</button>
          <button className="secondary-button" onClick={resetCreate} disabled={busy}>清空</button>
        </div>
      </div>

      {/* 列表 */}
      <div className="card">
        <h2 className="section-title">原料清單</h2>

        {loading ? (
          <div className="loading-spinner" />
        ) : filtered.length === 0 ? (
          <div style={{ padding: 12, color: "#666" }}>沒有符合的資料。</div>
        ) : (
          <div className="table-wrap">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>品名</th>
                  <th>數量</th>
                  <th>單位</th>
                  <th>效期</th>
                  <th>價格</th>
                  <th style={{ width: 160 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => (
                  <tr key={it.id}>
                    <td>{it.name}</td>
                    <td>{fmt(it.quantity)}</td>
                    <td>{it.unit || "—"}</td>
                    <td>{it.expiration_date || "—"}</td>
                    <td>{it.price != null ? `$${fmt(it.price)}` : "—"}</td>
                    <td>
                      <div className="row-actions">
                        <button className="table-button" onClick={() => startEdit(it)} disabled={busy}>編輯</button>
                        <button
                          className="table-button danger"
                          onClick={() => handleDelete(it.id, it.name)}
                          disabled={busy}
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 編輯彈窗 */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h3 className="modal-title">編輯原料</h3>

            <div className="form-grid">
              <label>品名</label>
              <input
                value={editing.name}
                onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
              />

              <label>數量</label>
              <input
                type="number"
                min="0"
                step="1"
                value={editing.quantity}
                onChange={(e) => setEditing((p) => ({ ...p, quantity: e.target.value }))}
              />

              <label>單位</label>
              <select
                value={editing.unit}
                onChange={(e) => setEditing((p) => ({ ...p, unit: e.target.value }))}
              >
                <option value="克">克</option>
                <option value="公斤">公斤</option>
                <option value="毫升">毫升</option>
                <option value="公升">公升</option>
                <option value="顆">顆</option>
                <option value="份">份</option>
              </select>

              <label>有效期限</label>
              <input
                type="date"
                value={editing.expiration_date || ""}
                onChange={(e) => setEditing((p) => ({ ...p, expiration_date: e.target.value }))}
              />

              <label>價格（可選）</label>
              <input
                type="number"
                min="0"
                step="1"
                value={editing.price}
                onChange={(e) => setEditing((p) => ({ ...p, price: e.target.value }))}
              />
            </div>

            <div className="modal-buttons">
              <button className="cancel-button" onClick={cancelEdit} disabled={busy}>取消</button>
              <button className="confirm-button" onClick={handleUpdate} disabled={busy}>儲存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
