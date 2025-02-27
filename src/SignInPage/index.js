import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const SignIn = () => {
    const navigate = useNavigate(); // 用來切換頁面

    return (
        <div className="SignIn">
            <h1>候場小幫手</h1>
            <p>帳號:</p>
            <input type="text" />
            <p>密碼:</p>
            <input type="password" />

            <button className="SUbt">登入</button>
            <button className="SIbt" onClick={() => navigate('/signup')}>註冊</button>
            
        </div>
    );
}

export default SignIn;
