import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const API_URL = "http://127.0.0.1:5000";
const HOME_PATH = "/home";

const RecipesPage = () => {
  const [recipes, setRecipes] = useState({});
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [menuName, setMenuName] = useState("");
  const [ingredients, setIngredients] = useState({});
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${API_URL}/recipes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setRecipes(data.recipes);
    } catch (error) {
      console.error("取得食譜失敗", error);
    }
  };

  const handleDelete = async (name) => {
    const confirmed = window.confirm(`確定要刪除「${name}」的配方嗎？`);
    if (!confirmed) return;

    try {
      await fetch(`${API_URL}/recipes/${name}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchRecipes();
    } catch (error) {
      console.error("刪除失敗", error);
    }
  };

  const handleEdit = (name, ingData) => {
    setMenuName(name);
    setIngredients(ingData);
    setEditingRecipe(true);
  };

  const handleIngredientChange = (ingredient, field, value) => {
    setIngredients((prev) => ({
      ...prev,
      [ingredient]: {
        ...prev[ingredient],
        [field]: value,
      },
    }));
  };

  const handleAddIngredient = () => {
    const newName = prompt("請輸入新的食材名稱");
    if (!newName) return;
    setIngredients((prev) => ({
      ...prev,
      [newName]: { amount: "", unit: "" },
    }));
  };

  const handleSave = async () => {
    try {
      const body = {
        menu_name: menuName,
        ingredients,
      };

      const response = await fetch(`${API_URL}/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("儲存失敗");
      alert("儲存成功");
      setEditingRecipe(null);
      setMenuName("");
      setIngredients({});
      fetchRecipes();
    } catch (error) {
      console.error("儲存失敗", error);
      alert("儲存失敗");
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <div className="orders-container">
      {/* 固定右上角回首頁按鈕 */}
      <div className="fixed-home-button">
        <button className="go-home-button" onClick={() => navigate(HOME_PATH)}>
          回首頁
        </button>
      </div>

      <div className="orders-header">
        <h2>食譜管理</h2>
        <div className="icon-group">
          <button
            onClick={() => {
              setEditingRecipe(true);
              setMenuName("");
              setIngredients({});
            }}
          >
            新增配方
          </button>
        </div>
      </div>

      <div className="orders-list">
        {Object.entries(recipes).map(([name, ing]) => (
          <div key={name} className="order-card">
            <div className="order-items">
              <strong>{name}</strong>
              <br />
              {Object.entries(ing).map(([ingName, detail]) => (
                <div key={ingName}>
                  {ingName}：{detail.amount} {detail.unit}
                </div>
              ))}
            </div>
            <div className="order-actions">
              <button className="modify-button" onClick={() => handleEdit(name, ing)}>
                編輯
              </button>
              <button className="remove-button" onClick={() => handleDelete(name)}>
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingRecipe && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>編輯配方</h2>
            <div className="form-group">
              <label>品項名稱</label>
              <input
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
              />
            </div>

            {Object.entries(ingredients).map(([ingName, detail]) => (
              <div key={ingName} className="form-group">
                <label>{ingName}</label>
                <input
                  type="text"
                  placeholder="數量"
                  value={detail.amount}
                  onChange={(e) =>
                    handleIngredientChange(ingName, "amount", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="單位"
                  value={detail.unit}
                  onChange={(e) =>
                    handleIngredientChange(ingName, "unit", e.target.value)
                  }
                />
              </div>
            ))}

            <button onClick={handleAddIngredient}>➕ 新增食材</button>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
              <button className="go-home-button" onClick={() => setEditingRecipe(null)}>
                取消
              </button>
              <button className="done-button" onClick={handleSave}>
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
