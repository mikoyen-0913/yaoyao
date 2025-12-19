// src/BossInventory/InventoryOverview.js
import React, { useEffect, useMemo, useState } from "react";
import "./index.css";
import { apiBaseUrl } from "../settings";

const InventoryOverview = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");

  const token = localStorage.getItem("token");

  const formatDate = (val) => {
    if (!val) return "—";
    if (typeof val === "string") return val.slice(0, 10);
    if (val && typeof val === "object" && "seconds" in val)
      return new Date(val.seconds * 1000).toISOString().slice(0, 10);
    return "—";
  };

  const formatQty = (q) => {
    const num = Number(q);
    return Number.isFinite(num) ? num.toFixed(2) : "—";
  };

  const fetchOverview = async () => {
    try {
      setError("");
      setBusy(true);

      const res = await fetch(`${apiBaseUrl}/inventory_overview`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || `讀取失敗（HTTP ${res.status}）`);
      }

      setRows(Array.isArray(data?.rows) ? data.rows : []);
    } catch (e) {
      setError(e?.message || "讀取失敗");
      setRows([]);
    } finally {
      setBusy(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const k = (keyword || "").trim().toLowerCase();
    if (!k) return rows;
    return rows.filter((r) => String(r?.name || "").toLowerCase().includes(k));
  }, [rows, keyword]);

  return (
    <div className="inventory-container">
      <h1 className="page-title">企業主庫存總覽</h1>

      <div className="top-action-buttons">
        <button className="btn-home" onClick={() => (window.location.href = "/home")}>
          回首頁
        </button>

        <button className="btn-refresh" onClick={fetchOverview} disabled={busy}>
          {busy ? "更新中..." : "重新整理"}
        </button>
      </div>

      <div className="filter-row">
        <input
          className="search-input"
          placeholder="搜尋食材名稱..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-text">載入中...</div>
      ) : error ? (
        <div className="error-text">{error}</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="col-name">食材名稱</th>
                <th className="col-qty">全部庫存總量</th>
                <th className="col-unit">單位</th>
                <th className="col-date">最早到期日</th>
                <th className="col-actions">缺貨分店數</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    沒有資料
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr key={`${r.name || "row"}-${idx}`}>
                    <td>{r.name || "—"}</td>
                    <td>{formatQty(r.total_quantity)}</td>
                    <td>{r.unit || "—"}</td>
                    <td>{formatDate(r.earliest_expiration)}</td>
                    <td>{Number.isFinite(Number(r.out_of_stock_store_count)) ? r.out_of_stock_store_count : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryOverview;
