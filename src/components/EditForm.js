import React, { useState, useEffect } from "react";
import "../style/components/EditForm.css";

const EditForm = ({ onClose, onSave, data }) => {
    const [itemName, setItemName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("");
    const [price, setPrice] = useState("");
    const [index, setIndex] = useState(null);

    // **確保 `data` 存在時才更新 `useState`**
    useEffect(() => {
        if (data) {
            setItemName(data.name || "");
            setQuantity(data.quantity || "");
            setUnit(data.unit || "");
            setPrice(data.price || "");
            setIndex(data.index || null);
        }
    }, [data]);

    const handleSave = () => {
        if (!itemName || !quantity || !unit || !price) {
            alert("請填寫完整資訊");
            return;
        }

        onSave({ name: itemName, quantity: Number(quantity), unit, price: Number(price), index });
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <button className="close-btn" onClick={onClose}>X</button>

                <div className="item-form">
                    <h2>編輯食材</h2>
                    <div className="form-group">
                        <label>品項</label>
                        <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>數量</label>
                        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>單位</label>
                        <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>價格</label>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div className="buttons">
                        <button className="save-btn" onClick={handleSave}>確認</button>
                        <button className="cancel-btn" onClick={onClose}>返回</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditForm;
