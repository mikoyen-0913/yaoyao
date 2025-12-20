// src/Inventory/index.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { apiBaseUrl } from "../settings";
import AddInventory from "../components/AddInventory";
import EditInventory from "../components/EditInventory";
import RestockInventory from "../components/RestockInventory";

const InventoryPage = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [restockData, setRestockData] = useState(null);

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
  }, []);

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

  const handleUpdateFromModal = async (ing) => {
    if (!ing?.id) return alert("缺少 id，無法更新");
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

  const handleDelete = async (id) => {
    if (!window.confirm("您確定要刪除這筆資料嗎？")) return;
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
      if (!res.ok) throw new Error(`即時庫存更新失敗 (${res.status})`);
      await fetchIngredients();
      alert("即時庫存已更新");
    } catch (e) {
      console.error(e);
      setError(e.message || "即時庫存更新失敗");
    } finally {
      setBusy(false);
    }
  };

  const handleRestockFromModal = async (payload) => {
    try {
      setBusy(true);
      const apiPayload = { items: [payload] };
      const res = await fetch(`${apiBaseUrl}/restock_ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(apiPayload),
      });
      if (!res.ok) throw new Error("補貨失敗");
      await fetchIngredients();
      setRestockData(null);
      alert("補貨成功！預備庫存已增加。");
    } catch (e) {
      console.error(e);
      alert("補貨發生錯誤：" + e.message);
    } finally {
      setBusy(false);
    }
  };

  const fmt = (n) => Number(n || 0).toLocaleString("zh-TW");

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        {/* ✅ 標題 + 兩個按鈕放在同一區塊 */}
        <div>
          <h1>庫存管理</h1>
          <div className="top-action-buttons">
            <button className="add-button" onClick={() => setShowAddModal(true)} disabled={busy}>
              新增食材
            </button>
            <button className="refresh-button" onClick={refreshBySales} disabled={busy}>
              更新庫存數據
            </button>
          </div>
        </div>

        {/* 右側：回首頁 */}
        <div>
          <button className="home-button" onClick={() => navigate("/home")}>
            回首頁
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fff0f0", border: "1.5px solid #e57373", marginBottom: 12, padding: 10 }}>
          <strong style={{ color: "#c62828" }}>錯誤</strong>
          <div style={{ marginTop: 6 }}>{error}</div>
        </div>
      )}

      <div className="table-wrapper">
        {loading ? (
          <div>載入中…</div>
        ) : ingredients.length === 0 ? (
          <div style={{ padding: 12, color: "#666" }}>沒有資料。</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th className="col-name">品項</th>
                <th className="col-qty">使用中庫存</th>
                <th className="col-expiry">使用中效期</th>
                <th className="col-qty">預備庫存</th>
                <th className="col-expiry">預備庫存效期</th>
                <th className="col-unit">單位</th>
                <th className="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((it) => (
                <tr key={it.id}>
                  <td>{it.name}</td>
                  <td>{fmt(it.quantity)}</td>
                  <td>{it.expiration_date || "—"}</td>
                  <td style={{ color: it.reserved_quantity > 0 ? "#2e7d32" : "#999", fontWeight: "bold" }}>
                    {fmt(it.reserved_quantity)}
                  </td>
                  <td style={{ color: "#666", fontSize: "0.9rem" }}>
                    {it.reserved_expiration_date || "—"}
                  </td>
                  <td>{it.unit || "—"}</td>
                  <td className="col-actions">
                    <div className="action-buttons">
                      <button
                        className="restock-button"
                        onClick={() => setRestockData(it)}
                        disabled={busy}
                      >
                        補貨
                      </button>
                      <button className="edit-button" onClick={() => startEdit(it)} disabled={busy}>
                        編輯
                      </button>
                      <button className="delete-button" onClick={() => handleDelete(it.id)} disabled={busy}>
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <AddInventory onClose={() => setShowAddModal(false)} onSave={handleCreateFromModal} />
      )}
      {editData && (
        <EditInventory data={editData} onClose={() => setEditData(null)} onSave={handleUpdateFromModal} />
      )}
      {restockData && (
        <RestockInventory
          data={restockData}
          onClose={() => setRestockData(null)}
          onSave={handleRestockFromModal}
        />
      )}
    </div>
  );
};

export default InventoryPage;
