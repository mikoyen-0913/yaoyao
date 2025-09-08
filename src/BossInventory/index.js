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

        // 並行抓資料，比逐店 await 快
        const tasks = storeList.map((store) =>
          fetch(`${apiBaseUrl}/get_inventory_by_store?store=${encodeURIComponent(store)}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
            .then((r) => r.json())
            .then((data) => {
              const rows = Array.isArray(data?.inventory) ? data.inventory : [];
              return rows.map((item) => ({ ...item, store }));
            })
            .catch(() => [])
        );

        const results = await Promise.all(tasks);
        setIngredients(results.flat());
      } else {
        const res = await fetch(
          `${apiBaseUrl}/get_inventory_by_store?store=${encodeURIComponent(storeName)}`,
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
              <th className="col-date">保存期限</th>
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
          onSubmit={async (payload) => {
            // 這裡接你的調貨 API，如果尚未實作就先關閉並刷新
            // 例：
            // await fetch(`${apiBaseUrl}/superadmin/transfer`, { method: 'POST', headers: {...}, body: JSON.stringify(payload) })
            console.log("調貨 payload:", payload);
            setTransferOpen(false);
            setTransferItem(null);
            await fetchIngredients(selectedStore);
          }}
        />
      )}
    </div>
  );
};

export default BossInventory;
