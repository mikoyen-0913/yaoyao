import React, { useEffect, useState } from "react";
import "./index.css";

const API_URL = "http://127.0.0.1:5000";

const BossInventory = () => {
  const [storeList, setStoreList] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const token = localStorage.getItem("token");

  // ✅ 取得分店清單
  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/get_my_stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
        const data = await res.json();
      if (Array.isArray(data.stores)) {
        setStoreList(data.stores);
        if (data.stores.length > 0) {
          setSelectedStore(data.stores[0]); // 預設選第一家店
        }
      }
    } catch (err) {
      console.error("載入分店失敗", err);
    }
  };

  // ✅ 取得該分店的食材資料
  const fetchIngredients = async (storeName) => {
    try {
      const res = await fetch(`${API_URL}/get_all_ingredients?store_name=${storeName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.ingredients) {
        setIngredients(data.ingredients);
      }
    } catch (err) {
      console.error("取得庫存失敗", err);
    }
  };

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (selectedStore) fetchIngredients(selectedStore);
    // eslint-disable-next-line
  }, [selectedStore]);

  const filteredIngredients = ingredients.filter((item) =>
    item.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="inventory-page">
      <h1 className="title">各分店庫存管理</h1>

      <div className="controls">
        <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}>
          {storeList.map((store) => (
            <option key={store} value={store}>{store}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="搜尋食材名稱"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>品項</th>
            <th>數量</th>
            <th>單位</th>
            <th>保存期限</th>
          </tr>
        </thead>
        <tbody>
          {filteredIngredients.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{item.expiry_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BossInventory;
