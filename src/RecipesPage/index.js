import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { apiBaseUrl } from "../settings"; // ✅ 改用環境變數

const HOME_PATH = "/home";

const RecipesPage = () => {
  const [recipes, setRecipes] = useState({});
  const [editingRecipe, setEditingRecipe] = useState(false);
  const [menuName, setMenuName] = useState("");
  const [ingredients, setIngredients] = useState({});
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleEdit = (name, ingData) => {
    setMenuName(name);
    setIngredients(ingData);
    setEditingRecipe(true);
  };

  const handleAdd = () => {
    setMenuName("");
    setIngredients({});
    setEditingRecipe(true);
  };

  const handleDelete = async (name) => {
    const confirmed = window.confirm(`確定要刪除「${name}」的配方嗎？`);
    if (!confirmed) return;

    try {
      await fetch(`${apiBaseUrl}/recipes/${name}`, {
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

  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/recipes`, {
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

      const response = await fetch(`${apiBaseUrl}/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("儲存失敗");
      alert("儲存成功");
      setEditingRecipe(false);
      setMenuName("");
      setIngredients({});
      fetchRecipes();
    } catch (error) {
      console.error("儲存失敗", error);
      alert("儲存失敗");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && editingRecipe) {
        setEditingRecipe(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingRecipe]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>食譜管理</h2>
        <div className="icon-group">
          <button className="primary-button" onClick={handleAdd}>
            新增配方
          </button>
          <button
            className="primary-button"
            onClick={() => navigate(HOME_PATH)}
            style={{ marginLeft: "12px" }}
          >
            回首頁
          </button>
        </div>
      </div>

      <div className="orders-list">
        {Object.entries(recipes).map(([name, ing]) => (
          <div key={name} className="order-card">
            <div className="order-items">
              <div className="recipe-title">{name}</div>
              <div className="recipe-ingredients">
                {Object.entries(ing).map(([ingName, detail]) => (
                  <div key={ingName}>
                    {ingName}：{detail.amount} {detail.unit}
                  </div>
                ))}
              </div>
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
            <h2>{menuName ? "編輯配方" : "新增配方"}</h2>

            <div className="form-group">
              <label>品項名稱</label>
              <input
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
              />
            </div>

            {Object.keys(ingredients).length === 0 ? (
              <div style={{ color: "#999", textAlign: "center", marginBottom: "10px" }}>
                尚未新增任何食材
              </div>
            ) : (
              Object.entries(ingredients).map(([ingName, detail]) => (
                <div key={ingName} className="form-group">
                  <label>{ingName}</label>
                  <div className="recipe-input-row">
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
                </div>
              ))
            )}
            <div className="recipe-add-btn-container">
              <button className="recipe-add-btn" onClick={handleAddIngredient}>
                新增食材
              </button>
            </div>

            <div className="recipe-edit-buttons">
              <button className="recipe-cancel-btn" onClick={() => setEditingRecipe(false)}>
                返回
              </button>
              <button className="recipe-submit-btn" onClick={handleSave}>
                送出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
