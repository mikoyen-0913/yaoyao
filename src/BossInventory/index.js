// C:\Users\s8102\yaoyao\src\BossInventory\index.js — BossInventory
import React, { useEffect, useState } from "react";
import "./index.css";
import TransferModal from "./TransferModal";

const API_HOST = window.location.hostname; // 本機為 localhost
const API_URL = `http://${API_HOST}:5000`;

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
      const res = await fetch(`${API_URL}/get_my_stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data.stores)) {
        setStoreList(data.stores);
        if (data.stores.length > 0) setSelectedStore("ALL");
      }
    } catch (err) {
      console.error("載入分店失敗", err);
    }
  };

  // 依分店載入庫存（ALL 表示載入所有分店並合併）
  const fetchIngredients = async (storeName) => {
    try {
      if (!storeName) return;
      if (storeName === "ALL") {
        let allData = [];
        for (const store of storeList) {
          const res = await fetch(
            `${API_URL}/get_inventory_by_store?store=${encodeURIComponent(
              store
            )}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          if (data.inventory) {
            const storeItems = data.inventory.map((item) => ({
              ...item,
              store,
            }));
            allData = allData.concat(storeItems);
          }
        }
        setIngredients(allData);
      } else {
        const res = await fetch(
          `${API_URL}/get_inventory_by_store?store=${encodeURIComponent(
            storeName
          )}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.inventory) {
          const storeItems = data.inventory.map((item) => ({
            ...item,
            store: storeName,
          }));
          setIngredients(storeItems);
        } else {
          setIngredients([]);
        }
      }
    } catch (err) {
      console.error("取得庫存失敗", err);
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
    (item.name || "").toString().toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const formatDate = (val) => {
    if (!val) return "—";
    if (typeof val === "string") return val.slice(0, 10);
    // Firestore Timestamp 物件
    if (val && typeof val === "object" && "seconds" in val)
      return new Date(val.seconds * 1000).toISOString().slice(0, 10);
    return "—";
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
            onClick={() => (window.location.href = "http://localhost:3000/home")}
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
                  <td>{parseFloat(item.quantity).toFixed(2)}</td>
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

      {/* 調貨彈窗（內部會自己呼叫 /superadmin/transfer） */}
      {transferOpen && (
        <TransferModal
          open={transferOpen}
          data={transferItem}
          storeList={storeList}
          onClose={() => {
            setTransferOpen(false);
            setTransferItem(null);
          }}
          onSubmit={() => {
            // 調貨成功回呼：關閉並刷新目前檢視
            setTransferOpen(false);
            setTransferItem(null);
            fetchIngredients(selectedStore);
          }}
        />
      )}
    </div>
  );
};

export default BossInventory;
