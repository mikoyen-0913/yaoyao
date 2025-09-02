import React, { useEffect, useState } from "react";
import "./index.css";

const API_URL = "http://localhost:5000";

const BossInventory = () => {
  const [storeList, setStoreList] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    from_store: "",
    to_store: "",
    ingredient_id: "",
    ingredient_name: "",
    quantity: "",
    note: "",
  });

  // 🔎 Modal 專用的來源食材搜尋字串
  const [modalIngredientSearch, setModalIngredientSearch] = useState("");

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
          setSelectedStore("ALL");
        }
      }
    } catch (err) {
      console.error("載入分店失敗", err);
    }
  };

  const fetchIngredients = async (storeName) => {
    try {
      if (storeName === "ALL") {
        let allData = [];
        for (const store of storeList) {
          const res = await fetch(
            `${API_URL}/get_inventory_by_store?store=${store}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
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
          `${API_URL}/get_inventory_by_store?store=${storeName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.inventory) {
          const storeItems = data.inventory.map((item) => ({
            ...item,
            store: storeName,
          }));
          setIngredients(storeItems);
        }
      }
    } catch (err) {
      console.error("取得庫存失敗", err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchIngredients(selectedStore);
    }
  }, [selectedStore]);

  const filteredIngredients = ingredients.filter((item) =>
    item.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleSubmitTransfer = async () => {
    try {
      if (
        !transferForm.ingredient_id ||
        !transferForm.to_store ||
        !transferForm.quantity
      ) {
        alert("請完整填寫調貨資訊");
        return;
      }

      // 依選定食材帶出實際單位（不顯示，但送後端正確單位）
      const selectedIng = ingredients.find(
        (i) => i.id === transferForm.ingredient_id
      );
      const unit = selectedIng?.unit || "克";

      const body = {
        from_store: transferForm.from_store,
        to_store: transferForm.to_store,
        ingredient_id: transferForm.ingredient_id,
        ingredient_name: transferForm.ingredient_name,
        unit,
        quantity: Number(transferForm.quantity),
        note: transferForm.note,
      };

      const res = await fetch(`${API_URL}/superadmin/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "調貨失敗");
        return;
      }

      alert("調貨成功！");
      setShowTransferModal(false);
      if (selectedStore) {
        fetchIngredients(selectedStore);
      }
    } catch (err) {
      console.error("❌ 調貨失敗:", err);
      alert("調貨失敗：" + err.message);
    }
  };

  // ✅ ESC 鍵關閉 Modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowTransferModal(false);
      }
    };
    if (showTransferModal) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showTransferModal]);

  // 依 Modal 搜尋字串過濾來源食材
  const modalFilteredIngredients = ingredients.filter((i) => {
    const q = modalIngredientSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      i.name.toLowerCase().includes(q) ||
      (i.store && i.store.toLowerCase().includes(q))
    );
  });

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
            className="btn-transfer"
            onClick={() => {
              setTransferForm({
                from_store: selectedStore === "ALL" ? "" : selectedStore,
                to_store: "",
                ingredient_id: "",
                ingredient_name: "",
                quantity: "",
                note: "",
              });
              setModalIngredientSearch(""); // 清空 modal 搜尋
              setShowTransferModal(true);
            }}
          >
            調貨
          </button>
          <button
            className="btn-transfer-log"
            onClick={() =>
              alert("👉 這裡之後接 /superadmin/transfer_logs")
            }
          >
            調貨記錄
          </button>
          <button
            className="btn-home"
            onClick={() =>
              (window.location.href = "http://localhost:3000/home")
            }
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
            </tr>
          </thead>
          <tbody>
            {filteredIngredients.map((item, index) => {
              const colorClassIndex =
                selectedStore === "ALL"
                  ? storeList.indexOf(item.store) % 5
                  : -1;
              const rowClass =
                selectedStore === "ALL" ? `store-color-${colorClassIndex}` : "";

              return (
                <tr key={`${item.id}-${index}`} className={rowClass}>
                  {selectedStore === "ALL" && <td>{item.store}</td>}
                  <td>{item.name}</td>
                  <td>{parseFloat(item.quantity).toFixed(2)}</td>
                  <td>{item.unit}</td>
                  <td>{item.expiration_date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal-content" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>調貨</h2>
            </div>

            <div className="modal-body">
              <div className="modal-grid">
                {/* 第 1 列：來源食材搜尋 */}
                <div className="modal-field field-src-search">
                  <label>來源食材搜尋</label>
                  <input
                    className="modal-ing-search"
                    type="text"
                    placeholder="搜尋名稱或分店（例如：紅豆、台北店）"
                    value={modalIngredientSearch}
                    onChange={(e) => setModalIngredientSearch(e.target.value)}
                  />
                </div>

                {/* 第 1 列：來源食材選擇 */}
                <div className="modal-field field-src-select">
                  <label>來源食材</label>
                  <select
                    value={transferForm.ingredient_id}
                    onChange={(e) => {
                      const selected = ingredients.find(
                        (i) => i.id === e.target.value
                      );
                      setTransferForm((f) => ({
                        ...f,
                        ingredient_id: e.target.value,
                        ingredient_name: selected ? selected.name : "",
                        from_store: selected ? selected.store : f.from_store,
                      }));
                    }}
                  >
                    <option value="">請選擇</option>
                    {modalFilteredIngredients.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}（{item.store}）
                      </option>
                    ))}
                  </select>
                </div>

                {/* 第 2 列：目標分店 */}
                <div className="modal-field field-to-store">
                  <label>目標分店</label>
                  <select
                    value={transferForm.to_store}
                    onChange={(e) =>
                      setTransferForm((f) => ({
                        ...f,
                        to_store: e.target.value,
                      }))
                    }
                  >
                    <option value="">請選擇</option>
                    {storeList
                      .filter((s) => s !== transferForm.from_store)
                      .map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 第 2 列：數量 */}
                <div className="modal-field field-qty">
                  <label>數量</label>
                  <input
                    type="number"
                    placeholder="請輸入數量"
                    value={transferForm.quantity}
                    onChange={(e) =>
                      setTransferForm((f) => ({
                        ...f,
                        quantity: e.target.value,
                      }))
                    }
                    min="0"
                  />
                </div>

                {/* 第 3 列：備註 */}
                <div className="modal-field field-note">
                  <label>備註</label>
                  <input
                    type="text"
                    placeholder="（選填）"
                    value={transferForm.note}
                    onChange={(e) =>
                      setTransferForm((f) => ({
                        ...f,
                        note: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* 底部：取消在左、確認在右 */}
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowTransferModal(false)}
              >
                取消
              </button>
              <button className="btn-submit" onClick={handleSubmitTransfer}>
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BossInventory;
