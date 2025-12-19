import React, { useEffect, useState } from "react";
import "./index.css";
import TransferModal from "./TransferModal";
import { apiBaseUrl } from "../settings"; // 由設定檔控制 API

const BossInventory = () => {
  const [storeList, setStoreList] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferItem, setTransferItem] = useState(null);

  // 新增：調貨紀錄彈窗
  const [logOpen, setLogOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilters, setLogFilters] = useState({
    from_store: "",
    to_store: "",
    ingredient: "",
    limit: 100,
  });

  const token = localStorage.getItem("token");

  // 取得我的分店清單
  const fetchStores = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/get_my_stores`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (Array.isArray(data.stores)) {
        setStoreList(data.stores);
        if (data.stores.length > 0) setSelectedStore("ALL");
      } else {
        setStoreList([]);
      }
    } catch (err) {
      console.error("載入分店失敗", err);
      setStoreList([]);
    }
  };

  // 依分店載入庫存（ALL：載入所有分店並合併）
  const fetchIngredients = async (storeName) => {
    try {
      if (!storeName) return;

      if (storeName === "ALL") {
        if (!Array.isArray(storeList) || storeList.length === 0) {
          setIngredients([]);
          return;
        }

        const tasks = storeList.map((store) =>
          fetch(
            `${apiBaseUrl}/get_inventory_by_store?store=${encodeURIComponent(
              store
            )}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          )
            .then((r) => r.json())
            .then((data) => {
              const rows = Array.isArray(data?.inventory)
                ? data.inventory
                : [];
              return rows.map((item) => ({ ...item, store }));
            })
            .catch(() => [])
        );

        const results = await Promise.all(tasks);
        setIngredients(results.flat());
      } else {
        const res = await fetch(
          `${apiBaseUrl}/get_inventory_by_store?store=${encodeURIComponent(
            storeName
          )}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const data = await res.json();
        const rows = Array.isArray(data?.inventory) ? data.inventory : [];
        setIngredients(rows.map((item) => ({ ...item, store: storeName })));
      }
    } catch (err) {
      console.error("取得庫存失敗", err);
      setIngredients([]);
    }
  };

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedStore) fetchIngredients(selectedStore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore, storeList.length]);

  const filteredIngredients = ingredients.filter((item) =>
    (item?.name ?? "").toString().toLowerCase().includes(searchKeyword.toLowerCase())
  );

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

  // === 調貨紀錄：呼叫後端 ===
  const fetchLogs = async (filters = logFilters) => {
    try {
      setLogsLoading(true);

      const query = [];
      if (filters.from_store) {
        query.push(`from_store=${encodeURIComponent(filters.from_store)}`);
      }
      if (filters.to_store) {
        query.push(`to_store=${encodeURIComponent(filters.to_store)}`);
      }
      if (filters.limit) {
        query.push(`limit=${encodeURIComponent(filters.limit)}`);
      }

      const url = `${apiBaseUrl}/superadmin/transfer_logs${
        query.length ? "?" + query.join("&") : ""
      }`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      let rows = Array.isArray(data?.logs) ? data.logs : [];

      //  前端作「包含」過濾（不分大小寫）
      const kw = (filters.ingredient || "").trim().toLowerCase();
      if (kw) {
        rows = rows.filter((row) =>
          (row?.ingredient_name || "").toLowerCase().includes(kw)
        );
      }

      setLogs(rows);
    } catch (e) {
      console.error("載入調貨紀錄失敗", e);
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <div>
          <h1>各分店庫存管理</h1>
          <div className="input-section">
            <div className="store-wrapper">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="store-selector"
              >
                <option value="ALL">所有分店</option>
                {storeList.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-wrapper">
              <input
                type="text"
                placeholder="搜尋食材名稱"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="search-box"
              />
            </div>
          </div>
        </div>

        <div className="top-action-buttons">
          <button
            className="btn-home"
            onClick={() => (window.location.href = "/home")}
          >
            回首頁
          </button>

          {/* 新增：調貨紀錄按鈕 */}
          <button
            className="btn-transfer"
            onClick={async () => {
              await fetchLogs();
              setLogOpen(true);
            }}
          >
            調貨紀錄
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {selectedStore === "ALL" && <th className="col-store">分店</th>}
              <th className="col-name">品項</th>
              <th className="col-qty">庫存數量</th>
              <th className="col-unit">單位</th>
              <th className="col-date">最早到期日</th>
              <th className="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredIngredients.map((item, index) => {
              const colorClassIndex =
                selectedStore === "ALL" ? storeList.indexOf(item.store) % 5 : -1;
              const rowClass =
                selectedStore === "ALL" ? `store-color-${colorClassIndex}` : "";

              return (
                <tr key={`${item.id || item.name}-${index}`} className={rowClass}>
                  {selectedStore === "ALL" && <td>{item.store}</td>}
                  <td>{item.name}</td>
                  <td>{formatQty(item.quantity)}</td>
                  <td>{item.unit}</td>
                  <td>{formatDate(item.expiration_date)}</td>
                  <td className="col-actions">
                    <button
                      className="btn-transfer"
                      onClick={() => {
                        setTransferItem(item);
                        setTransferOpen(true);
                      }}
                    >
                      調貨
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {transferOpen && (
        <TransferModal
          open={transferOpen}
          data={transferItem}
          storeList={storeList}
          onClose={() => {
            setTransferOpen(false);
            setTransferItem(null);
          }}
          onSubmit={async () => {
            setTransferOpen(false);
            setTransferItem(null);
            await fetchIngredients(selectedStore);
          }}
        />
      )}

      {/* 調貨紀錄彈窗 */}
      {logOpen && (
        <TransferLogModal
          open={logOpen}
          onClose={() => setLogOpen(false)}
          logs={logs}
          loading={logsLoading}
          filters={logFilters}
          onChangeFilters={setLogFilters}
          onSearch={async () => fetchLogs()}
          storeList={storeList}
          onReset={async () => {
            const next = { from_store: "", to_store: "", ingredient: "", limit: 100 };
            setLogFilters(next);
            await fetchLogs(next);
          }}
        />
      )}
    </div>
  );
};

export default BossInventory;

/* ================== 內嵌的調貨紀錄彈窗 ================== */

const TransferLogModal = ({
  open,
  onClose,
  logs,
  loading,
  filters,
  onChangeFilters,
  onSearch,
  onReset,
  storeList = [],
}) => {
  // Hooks 需在最上面（支援 ESC 關閉）
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

  const fmtTime = (s) => {
    if (!s) return "—";
    try {
      return new Date(s).toLocaleString();
    } catch {
      return s;
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup" style={{ maxWidth: 900 }}>
        <div className="item-form">
          <h2>調貨紀錄</h2>

          {/* 篩選列 */}
          <div className="log-filters">
            <select
              value={filters.from_store}
              onChange={(e) =>
                onChangeFilters((p) => ({ ...p, from_store: e.target.value }))
              }
            >
              <option value="">來源分店（全部）</option>
              {storeList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={filters.to_store}
              onChange={(e) =>
                onChangeFilters((p) => ({ ...p, to_store: e.target.value }))
              }
            >
              <option value="">目標分店（全部）</option>
              {storeList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="品項關鍵字"
              value={filters.ingredient}
              onChange={(e) =>
                onChangeFilters((p) => ({ ...p, ingredient: e.target.value }))
              }
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="edit-submit-btn"
                onClick={onSearch}
                disabled={loading}
              >
                {loading ? "查詢中…" : "查詢"}
              </button>
              <button
                className="cancel-btn"
                onClick={onReset}
                disabled={loading}
              >
                重設
              </button>
            </div>
          </div>

          {/* 紀錄表格 */}
          <div className="table-wrapper" style={{ maxHeight: 420, overflow: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>時間</th>
                  <th>來源分店</th>
                  <th>目標分店</th>
                  <th>品項</th>
                  <th>數量</th>
                  <th>單位</th>
                  <th>建立者</th>
                  <th>狀態</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center" }}>
                      {loading ? "載入中…" : "沒有資料"}
                    </td>
                  </tr>
                ) : (
                  logs.map((row) => (
                    <tr key={row.id}>
                      <td>{fmtTime(row.created_at)}</td>
                      <td>{row.from_store || "—"}</td>
                      <td>{row.to_store || "—"}</td>
                      <td>{row.ingredient_name || "—"}</td>
                      <td>{row.quantity ?? "—"}</td>
                      <td>{row.unit || "—"}</td>
                      <td>{row.created_by || row.operator_name || "-"}</td>
                      <td>{row.status || "—"}</td>
                      <td title={row.id}>{row.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="buttons" style={{ marginTop: 12 }}>
            <button className="cancel-btn" onClick={onClose}>
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
