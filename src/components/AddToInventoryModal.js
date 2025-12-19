// src/components/AddToInventoryModal.js
import React, { useState, useEffect, useMemo } from "react";
import "../style/components/AddToInventoryModal.css";
import { apiBaseUrl } from "../settings";

const AddToInventoryModal = ({ onClose, shortages }) => {
  const [restockData, setRestockData] = useState({});
  const [nameToId, setNameToId] = useState({}); // { "煉乳": "firestore_doc_id", ... }
  const [loadingMap, setLoadingMap] = useState(true);

  // 1) 初始化表格資料（缺料建議）
  useEffect(() => {
    const suggestion = {};
    Object.entries(shortages || {}).forEach(([name, info]) => {
      const shortageInt = Math.round(Number(info.shortage || 0));
      suggestion[name] = {
        name,
        unit: info.unit || "克",
        shortage: shortageInt,
        restock: shortageInt,
        expiration_date: "",
      };
    });
    setRestockData(suggestion);
  }, [shortages]);

  // 2) 開窗就抓一次食材清單，建立 name -> ingredient_id 對照
  useEffect(() => {
    const fetchIngredientMap = async () => {
      try {
        setLoadingMap(true);
        const token = localStorage.getItem("token");

        const res = await fetch(`${apiBaseUrl}/get_ingredients`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("get_ingredients failed:", res.status);
          setNameToId({});
          return;
        }

        const data = await res.json();
        const list = data?.ingredients || [];

        const map = {};
        list.forEach((ing) => {
          const name = String(ing.name || "").trim();
          const id = String(ing.id || "").trim();
          if (name && id) map[name] = id;
        });

        setNameToId(map);
      } catch (e) {
        console.error("fetchIngredientMap error:", e);
        setNameToId({});
      } finally {
        setLoadingMap(false);
      }
    };

    fetchIngredientMap();
  }, []);

  // esc 關閉
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleChange = (name, field, value) => {
    if (field === "restock") {
      let v = value === "" ? "" : parseInt(value, 10);
      if (Number.isNaN(v)) v = 0;
      if (v < 0) v = 0;
      setRestockData((prev) => ({
        ...prev,
        [name]: { ...prev[name], restock: v },
      }));
      return;
    }

    setRestockData((prev) => ({
      ...prev,
      [name]: { ...prev[name], [field]: value },
    }));
  };

  const missingIdNames = useMemo(() => {
    return Object.keys(restockData).filter((n) => !nameToId[n]);
  }, [restockData, nameToId]);

  // ✅ 共用：呼叫後端補貨（正確 payload）
  const callRestockAPI = async (items) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${apiBaseUrl}/restock_ingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items }),
    });
    return res;
  };

  const addSingleIngredient = async (name) => {
    const data = restockData[name];

    if (!data?.expiration_date) {
      alert(`請為 ${name} 輸入有效期限`);
      return;
    }

    const qty = Math.round(Number(data.restock || 0));
    if (qty <= 0) {
      alert("補貨數量需大於 0");
      return;
    }

    const ingredient_id = nameToId[name];
    if (!ingredient_id) {
      alert(`找不到「${name}」對應的 ingredient_id（請確認此食材已存在於庫存清單）`);
      return;
    }

    try {
      const res = await callRestockAPI([
        {
          ingredient_id,
          add_quantity: qty,
          unit: data.unit,
          expiration_date: data.expiration_date,
        },
      ]);

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`補貨失敗: ${res.status} ${t}`);
      }

      setRestockData((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });

      alert(`${name} 補貨成功！`);
    } catch (err) {
      console.error(`${name} 補貨失敗：`, err);
      alert(`補貨 ${name} 發生錯誤`);
    }
  };

  const addAllIngredients = async () => {
    try {
      // 先檢查效期
      for (const name in restockData) {
        if (!restockData[name]?.expiration_date) {
          alert(`請填寫 ${name} 的有效期限`);
          return;
        }
      }

      // 若有找不到 id 的食材，先擋掉
      if (missingIdNames.length > 0) {
        alert(
          `以下食材在庫存清單找不到對應ID，無法補貨：\n${missingIdNames.join(
            "、"
          )}\n\n請先在「庫存管理」新增這些食材後再補貨。`
        );
        return;
      }

      const items = Object.keys(restockData)
        .map((name) => {
          const it = restockData[name];
          const qty = Math.round(Number(it.restock || 0));
          if (qty <= 0) return null;
          return {
            ingredient_id: nameToId[name],
            add_quantity: qty,
            unit: it.unit,
            expiration_date: it.expiration_date,
          };
        })
        .filter(Boolean);

      if (items.length === 0) {
        alert("沒有可補貨的項目（補貨數量皆為 0）");
        return;
      }

      const res = await callRestockAPI(items);
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`補貨失敗: ${res.status} ${t}`);
      }

      alert("全部缺料補貨完成！");
      onClose();
    } catch (err) {
      console.error("補貨全部失敗", err);
      alert("補貨過程發生錯誤");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-window">
        <h2 className="modal-title">確認缺料補貨</h2>

        {loadingMap && (
          <div style={{ marginBottom: 10, fontSize: 14, color: "#666" }}>
            正在載入食材清單…
          </div>
        )}

        {Object.keys(restockData).length === 0 ? (
          <div style={{ textAlign: "center", fontSize: "18px", color: "#333" }}>
            ✅ 目前原料充足，不須補貨！
          </div>
        ) : (
          <div style={{ maxHeight: "420px", overflowY: "auto" }}>
            <table className="modal-table">
              <thead>
                <tr>
                  <th>品項</th>
                  <th>缺料數量</th>
                  <th>補貨數量</th>
                  <th>保存期限</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(restockData).map(([name, item]) => {
                  const hasId = !!nameToId[name];
                  return (
                    <tr key={name}>
                      <td>
                        {item.name}
                        {!hasId && (
                          <div style={{ fontSize: 12, color: "#d33" }}>
                            （庫存清單沒有此食材，請先新增）
                          </div>
                        )}
                      </td>
                      <td>
                        {Math.round(Number(item.shortage || 0))} {item.unit}
                      </td>
                      <td>
                        <div className="cell-center">
                          <input
                            type="number"
                            inputMode="numeric"
                            step="1"
                            min="0"
                            value={item.restock}
                            onChange={(e) =>
                              handleChange(name, "restock", e.target.value)
                            }
                          />
                          <span className="unit-span">{item.unit}</span>
                        </div>
                      </td>
                      <td>
                        <input
                          type="date"
                          value={item.expiration_date}
                          onChange={(e) =>
                            handleChange(name, "expiration_date", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="single-add-btn"
                          onClick={() => addSingleIngredient(name)}
                          disabled={!hasId}
                          title={!hasId ? "請先在庫存管理新增此食材" : ""}
                        >
                          補貨
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-buttons">
          <button className="cancel-button" onClick={onClose}>
            取消
          </button>
          {Object.keys(restockData).length > 0 && (
            <button className="confirm-button" onClick={addAllIngredients}>
              一次補貨全部
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToInventoryModal;
