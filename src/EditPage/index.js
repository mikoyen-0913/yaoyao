import React from 'react';
import './index.css';

const EditPage = () => {
    return (
        <div className="popup-overlay">
          <div className="popup">
            <button className="close-btn">X</button>
            <div className="item-form">
            <div className="form-group">
              <label htmlFor="name">品項</label>
              <input type="text" id="name" placeholder="Enter item name" />
            </div>
            <div className="form-group">
              <label htmlFor="stock">庫存</label>
              <input type="number" id="stock" placeholder="Enter stock quantity" />
            </div>

            <div className="form-group">
              <label htmlFor="exp">保存期限 (Expiration Date)</label>
              <input type="date" id="exp" />
            </div>

            <div className="form-group">
              <label htmlFor="note">備認</label>
              <textarea id="note" placeholder="Enter any notes here" rows="4"></textarea>
            </div>

            <div className="buttons">
              <button className="save-btn">確認</button>
            </div>
          </div>
        </div>
        </div>
      );
    };

export default EditPage;
