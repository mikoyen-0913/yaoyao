import React, { useState, useEffect } from "react";
import "./index.css";
import AddItem from "../components/AddItem";
import EditForm from "../components/EditForm";

const API_URL = "http://127.0.0.1:5000";

const Inventory = () => {
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [inventory, setInventory] = useState([]);

  const fetchIngredients = async () => {
    try {
      const response = await fetch(`${API_URL}/get_ingredients`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error("無法獲取資料");
      const data = await response.json();
      setInventory(data.ingredients);
    } catch (error) {
      console.error("取得食材失敗:", error);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleAddItem = async (newItem) => {
    try {
      const response = await fetch(`${API_URL}/add_ingredient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) throw new Error("新增食材失敗");
      fetchIngredients();
      setIsAddPopupOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditItem = (ingredient) => {
    setEditData(ingredient);
    setIsEditPopupOpen(true);
  };

  const handleUpdateItem = async (updatedItem) => {
    try {
      const response = await fetch(`${API_URL}/update_ingredient/${updatedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedItem),
      });
      if (!response.ok) throw new Error("更新食材失敗");
      fetchIngredients();
      setIsEditPopupOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const response = await fetch(`${API_URL}/delete_ingredient/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error("刪除食材失敗");
      fetchIngredients();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRefreshInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/refresh_inventory_by_sales`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (response.ok) {
        alert("✅ 即時庫存已更新");
        fetchIngredients();
      } else {
        alert("❌ 更新失敗：" + result.error);
      }
    } catch (error) {
      console.error("更新庫存失敗:", error);
      alert("❌ 發生錯誤：" + error.message);
    }
  };

  return (
    <div className="inventory-container">
      <h1>庫存管理</h1>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <button onClick={() => setIsAddPopupOpen(true)} className="add-button">
            新增食材
          </button>

          <button
            onClick={handleRefreshInventory}
            className="refresh-button"
          >
            更新庫存數據
          </button>
        </div>

        <button className="home-button" onClick={() => window.location.href = 'http://localhost:3000/home'}>
          回首頁
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th className="col-name">品項</th>
            <th className="col-qty">庫存數量</th>
            <th className="col-unit">單位</th>
            <th className="col-date">保存期限</th>
            <th className="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{parseFloat(item.quantity).toFixed(2)}</td>
              <td>{item.unit}</td>
              <td>{item.expiration_date ? item.expiration_date.slice(0, 10) : "—"}</td>
              <td className="col-actions">
                <div className="action-buttons">
                  <button onClick={() => handleEditItem(item)} className="edit-button">編輯</button>
                  &nbsp;
                  <button
                    onClick={() => {
                      if (window.confirm("您確定要刪除這筆資料嗎？")) {
                        handleDeleteItem(item.id);
                      }
                    }}
                    className="delete-button"
                  >
                    刪除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isAddPopupOpen && (
        <AddItem
          onClose={() => setIsAddPopupOpen(false)}
          onSave={handleAddItem}
        />
      )}

      {isEditPopupOpen && (
        <EditForm
          onClose={() => setIsEditPopupOpen(false)}
          onSave={handleUpdateItem}
          data={editData}
        />
      )}
    </div>
  );
};

export default Inventory;
