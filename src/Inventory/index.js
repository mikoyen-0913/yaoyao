import React, { useState, useEffect } from "react";
import "./index.css";
import AddItem from "../components/AddItem";
import EditForm from "../components/EditForm";

// Flask 後端 API 的網址
const API_URL = "http://127.0.0.1:5000";

const Inventory = () => {
  // 控制新增與編輯彈窗是否打開
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);

  // 編輯時的食材資料
  const [editData, setEditData] = useState(null);

  // 存放目前的食材庫存資料
  const [inventory, setInventory] = useState([]);

  // 取得所有食材資料
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

  // 頁面初始化時自動抓取資料
  useEffect(() => {
    fetchIngredients();
  }, []);

  // 處理新增食材資料
  const handleAddItem = async (newItem) => {
    try {
      const response = await fetch(`${API_URL}/add_ingredient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) throw new Error("新增食材失敗");
      fetchIngredients(); // 重新抓資料
      setIsAddPopupOpen(false); // 關閉新增視窗
    } catch (error) {
      console.error(error);
    }
  };

  // 開啟編輯視窗，帶入該筆資料
  const handleEditItem = (ingredient) => {
    setEditData(ingredient);
    setIsEditPopupOpen(true);
  };

  // 提交更新後的資料
  const handleUpdateItem = async (updatedItem) => {
    try {
      const response = await fetch(`${API_URL}/update_ingredient/${updatedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });
      if (!response.ok) throw new Error("更新食材失敗");
      fetchIngredients();
      setIsEditPopupOpen(false); // 關閉編輯視窗
    } catch (error) {
      console.error(error);
    }
  };

  // 刪除食材資料
  const handleDeleteItem = async (id) => {
    try {
      const response = await fetch(`${API_URL}/delete_ingredient/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("刪除食材失敗");
      fetchIngredients(); // 更新列表
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="inventory-container">
      <h1>庫存管理</h1>

      {/* 操作按鈕：新增食材 & 回首頁 */}
      <button onClick={() => setIsAddPopupOpen(true)} className="add-button">
        新增食材
      </button>

      <button className="home-button" onClick={() => window.location.href = 'http://localhost:3000/home'}>
        回首頁
      </button>


      {/* 顯示食材清單表格 */}
      <table>
        <thead>
          <tr>
            <th className="col-name">品項</th>           {/* ✅ 欄寬調整 */}
            <th className="col-qty">庫存數量</th>
            <th className="col-unit">單位</th>
            <th className="col-price">價格</th>
            <th className="col-actions">操作</th>        {/* ✅ 欄寬調整 */}
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{item.price}</td>
              <td className="col-actions">
                <div className="action-buttons"> {/* ✅ 新增容器，讓按鈕置中 */}
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

      {/* 新增食材彈窗 */}
      {isAddPopupOpen && (
        <AddItem
          onClose={() => setIsAddPopupOpen(false)}
          onSave={handleAddItem}
        />
      )}

      {/* 編輯食材彈窗 */}
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
