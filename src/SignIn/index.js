import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const SignIn = () => {
    const navigate = useNavigate(); // 用來切換頁面
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // 處理登入邏輯
    const handleLogin = () => {
        const users = JSON.parse(localStorage.getItem('users')) || []; // 讀取本地存儲的用戶資料

        // 檢查帳號密碼是否正確
        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            alert('登入成功！');
            navigate('/home'); // 跳轉到首頁
        } else {
            setError('帳號或密碼錯誤，請重新輸入');
        }
    };

    return (
        <div className="SignIn">
            <h1>後場小幫手</h1>

            {/* ✅ 修改 1：改為輸入框內提示文字 */}
            <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="請輸入帳號"
                required
            />

            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                required
            />

            {/* 錯誤訊息 */}
            {error && <p className="error">{error}</p>}

            {/* ✅ 修改 2：將兩個按鈕放在一個 div 中並設 class 排成水平 */}
            <div className="button-row">
                <button className="SUbt" onClick={handleLogin}>登入</button>
                <button className="SIbt" onClick={() => navigate('/signup')}>註冊</button>
            </div>
        </div>
    );
};

export default SignIn;
