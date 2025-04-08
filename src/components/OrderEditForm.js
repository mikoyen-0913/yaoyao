import React, { useState, useEffect } from "react";
import "../style/components/OrderEditForm.css";


const OrderEditForm = ({ orderData, onClose, onSave }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (orderData?.items) {
            setItems(orderData.items);
        }
    }, [orderData]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = field === "quantity" ? Number(value) : value;
        setItems(newItems);
    };

    const handleSave = () => {
        const total_price = items.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);
        onSave({ id: orderData.id, items, total_price });
    };

    return (
        <div className="order-edit-overlay">
            <div className="order-edit-popup">
                <h2>編輯訂單</h2>
                {items.map((item, index) => (
                    <div key={index} className="item-row">
                        <input
                            type="text"
                            value={item.menu_name}
                            onChange={(e) => handleItemChange(index, "menu_name", e.target.value)}
                            placeholder="品項"
                        />
                        <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            placeholder="數量"
                        />
                    </div>
                ))}
                <div className="edit-buttons">
                    <button className="save-btn" onClick={handleSave}>確認</button>
                    <button className="cancel-btn" onClick={onClose}>取消</button>
                </div>
            </div>
        </div>
    );
};

export default OrderEditForm;
