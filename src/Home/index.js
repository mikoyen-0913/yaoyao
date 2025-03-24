import React, { useState, useEffect } from "react";
import "./index.css";
import AddItem from "../components/AddItem";
import EditForm from "../components/EditForm";

const API_URL = "http://127.0.0.1:5000"; // Flask API 基本路徑

const Home = () => {
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [inventory, setInventory] = useState([]); // 存放庫存資料

  // **📌 取得所有食材資料**
  const fetchIngredients = async () => {
    try {
      const response = await fetch(`${API_URL}/get_ingredients`);
      if (!response.ok) throw new Error("無法獲取資料");
      const data = await response.json();
      setInventory(data.ingredients);
    } catch (error) {
      console.error("取得食材失敗:", error);
    }
  };

  // **📌 初始化時獲取食材**
  useEffect(() => {
    fetchIngredients();
  }, []);

  // **📌 新增食材**
  const handleAddItem = async (newItem) => {
    try {
      const response = await fetch(`${API_URL}/add_ingredient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) throw new Error("新增食材失敗");
      fetchIngredients(); // 重新獲取更新後的資料
      setIsAddPopupOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  // **📌 編輯食材**
  const handleEditItem = (ingredient) => {
    setEditData(ingredient);
    setIsEditPopupOpen(true);
  };

  // **📌 更新食材**
  const handleUpdateItem = async (updatedItem) => {
    try {
      const response = await fetch(`${API_URL}/update_ingredient/${updatedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });
      if (!response.ok) throw new Error("更新食材失敗");
      fetchIngredients(); // 重新獲取更新後的資料
      setIsEditPopupOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  // **📌 刪除食材**
  const handleDeleteItem = async (id) => {
    try {
      const response = await fetch(`${API_URL}/delete_ingredient/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("刪除食材失敗");
      fetchIngredients(); // 重新獲取更新後的資料
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="home-container">
      <h1>庫存管理</h1>

      <table>
        <thead>
          <tr>
            <th>品項</th>
            <th>庫存數量</th>
            <th>單位</th>
            <th>價格</th>
            <th>操作</th> 
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{item.price}</td>
              <td>
                <button onClick={() => handleEditItem(item)} className="edit-button">編輯</button>
                &nbsp;
                <button
                  onClick={() => {
                    if (window.confirm("你確定要刪除這筆資料嗎？")) {
                      handleDeleteItem(item.id);
                    }
                  }}
                  className="delete-button"
                >
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ 新增 className="add-button" 來套用綠色圓角樣式 */}
      <button onClick={() => setIsAddPopupOpen(true)} className="add-button">
        新增食材
      </button>

      {/* 彈跳視窗：新增食材 */}
      {isAddPopupOpen && <AddItem onClose={() => setIsAddPopupOpen(false)} onSave={handleAddItem} />}

      {/* 彈跳視窗：編輯食材 */}
      {isEditPopupOpen && <EditForm onClose={() => setIsEditPopupOpen(false)} onSave={handleUpdateItem} data={editData} />}
    </div>
  );
};

export default Home;
