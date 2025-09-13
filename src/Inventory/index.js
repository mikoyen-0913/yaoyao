// src/Inventory/index.js
// 價格欄位已移除；「新增食材／更新庫存數據」與表格左緣對齊；右上只保留「回首頁」

import React, { useEffect, useMemo, useState } from "react";
import "./index.css";
import { apiBaseUrl } from "../settings";
import AddInventory from "../components/AddInventory";
import EditInventory from "../components/EditInventory";

const InventoryPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editData, setEditData] = useState(null); // { id, name, quantity, unit, expiration_date, price? }

  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

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

  // 新增：由新增彈窗回傳
  const handleCreateFromModal = async (payload) => {
    try {
      setBusy(true);
      setError("");
      const res = await fetch(`${apiBaseUrl}/add_ingredient`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          name: payload.name,
          quantity: Number(payload.quantity),
          unit: payload.unit || "克",
          expiration_date: payload.expiration_date,
          price: Number(payload.price || 0),
        }),
      });
      if (!res.ok) throw new Error(`新增失敗 (${res.status})`);
      await fetchIngredients();
      setShowAddModal(false);
      alert("新增成功");
    } catch (e) {
      console.error(e);
      setError(e.message || "新增失敗");
    } finally {
      setBusy(false);
    }
  };

  // 編輯：打開彈窗
  const startEdit = (item) => {
    setEditData({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || "克",
      expiration_date: item.expiration_date || "",
      price: item.price || 0,
    });
  };

  // 編輯：由彈窗回傳
  const handleUpdateFromModal = async (ing) => {
    if (!ing?.id) {
      alert("缺少 id，無法更新");
      return;
    }
    try {
      setBusy(true);
      setError("");
      const res = await fetch(`${apiBaseUrl}/update_ingredient/${ing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          name: ing.name,
          quantity: Number(ing.quantity),
          unit: ing.unit || "克",
          expiration_date: ing.expiration_date || null,
          price: Number(ing.price || 0),
        }),
      });
      if (!res.ok) throw new Error(`更新失敗 (${res.status})`);
      await fetchIngredients();
      setEditData(null);
      alert("更新成功");
    } catch (e) {
      console.error(e);
      setError(e.message || "更新失敗");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`您確定要刪除這筆資料嗎？`)) return;
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

  const refreshBySales = async () => {
    if (!window.confirm("您確定要根據銷售紀錄刷新庫存嗎？")) return;
    try {
      setBusy(true);
      setError("");
      const res = await fetch(`${apiBaseUrl}/refresh_inventory_by_sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
      });
      if (!res.ok) throw new Error(`❎️即時庫存更新失敗 (${res.status})`);
      await fetchIngredients();
      alert("✅即時庫存已更新");
    } catch (e) {
      console.error(e);
      setError(e.message || "❎️即時庫存更新失敗");
    } finally {
      setBusy(false);
    }
  };

  const fmt = (n, digits = 0) => {
    const v = Number(n || 0);
    return v.toLocaleString("zh-TW", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  };

  return (
    <div className="inventory-container">
      {/* 頁首：左邊標題；右邊只保留「回首頁」 */}
      <div className="inventory-header">
        <div><h1>庫存管理</h1></div>
        <div>
          <button className="home-button" onClick={() => (window.location.href = "/home")}>
            回首頁
          </button>
        </div>
      </div>

      {/* 按鈕列：與表格左緣對齊*/}
      <div
        className="top-action-buttons"
        style={{
          width: 1350,
            margin: "0 0 6px  40px",
          display: "flex",
          gap: 10,
          justifyContent: "flex-start",
        }}
      >
        <button className="add-button" onClick={() => setShowAddModal(true)} disabled={busy}>
          新增食材
        </button>
        <button className="refresh-button" onClick={refreshBySales} disabled={busy}>
          更新庫存數據
        </button>
      </div>

      {error && (
        <div className="alert-box" style={{ backgroundColor: "#fff0f0", border: "1.5px solid #e57373", marginBottom: 12 }}>
          <strong style={{ color: "#c62828" }}>錯誤</strong>
          <div style={{ marginTop: 6 }}>{error}</div>
        </div>
      )}

      {/* 表格區*/}
      <div className="table-wrapper">
        {loading ? (
          <div className="loading-spinner" />
        ) : ingredients.length === 0 ? (
          <div style={{ padding: 12, color: "#666" }}>沒有資料。</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th className="col-name">品項</th>
                <th className="col-qty">庫存數量</th>
                <th className="col-unit">單位</th>
                <th className="col-expiry">保存期限</th>
                <th className="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((it) => (
                <tr key={it.id}>
                  <td>{it.name}</td>
                  <td>{fmt(it.quantity)}</td>
                  <td>{it.unit || "—"}</td>
                  <td>{it.expiration_date || "—"}</td>
                  <td className="col-actions">
                    <div className="action-buttons">
                      <button className="edit-button" onClick={() => startEdit(it)} disabled={busy}>編輯</button>
                      <button className="delete-button" onClick={() => handleDelete(it.id, it.name)} disabled={busy}>刪除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 新增彈窗 */}
      {showAddModal && (
        <AddInventory onClose={() => setShowAddModal(false)} onSave={handleCreateFromModal} />
      )}

      {/* 編輯彈窗 */}
      {editData && (
        <EditInventory data={editData} onClose={() => setEditData(null)} onSave={handleUpdateFromModal} />
      )}
    </div>
  );
};

export default InventoryPage;
