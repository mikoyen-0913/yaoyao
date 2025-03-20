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
            <h1>候場小幫手</h1>

            <p>帳號:</p>
            <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                required
            />

            <p>密碼:</p>
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            {/* 錯誤訊息 */}
            {error && <p className="error">{error}</p>}

            <button className="SUbt" onClick={handleLogin}>登入</button>
            <button className="SIbt" onClick={() => navigate('/signup')}>註冊</button>
        </div>
    );
};

export default SignIn;
