import React, { useEffect, useState } from "react";
import "./index.css";

const API_URL = "http://127.0.0.1:5000";

const BossInventory = () => {
  const [storeList, setStoreList] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const token = localStorage.getItem("token");

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/get_my_stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data.stores)) {
        setStoreList(data.stores);
        if (data.stores.length > 0) {
          setSelectedStore(data.stores[0]);
        }
      }
    } catch (err) {
      console.error("載入分店失敗", err);
    }
  };

  const fetchIngredients = async (storeName) => {
    try {
      const res = await fetch(`${API_URL}/get_inventory_by_store?store=${storeName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.inventory) {
        setIngredients(data.inventory);
      }
    } catch (err) {
      console.error("取得庫存失敗", err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) fetchIngredients(selectedStore);
  }, [selectedStore]);

  const filteredIngredients = ingredients.filter((item) =>
    item.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <div>
          <h1>各分店庫存管理</h1>

          {/* ✅ 下拉與搜尋分成兩個獨立區塊 */}
          <div className="input-section">
            <div className="store-wrapper">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="store-selector"
              >
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

        <button
          className="home-button"
          onClick={() => (window.location.href = "http://localhost:3000/home")}
        >
          回首頁
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="col-name">品項</th>
              <th className="col-qty">庫存數量</th>
              <th className="col-unit">單位</th>
              <th className="col-date">保存期限</th>
            </tr>
          </thead>
          <tbody>
            {filteredIngredients.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{parseFloat(item.quantity).toFixed(2)}</td>
                <td>{item.unit}</td>
                <td>{item.expiration_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BossInventory;
