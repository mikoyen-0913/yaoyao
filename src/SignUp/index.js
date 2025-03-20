import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [storeName, setStoreName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // 切換密碼可視性
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // 處理註冊邏輯
    const handleSignUp = () => {
        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(user => user.username === username)) {
            setError('用戶名稱已被使用，請選擇其他名稱');
            return;
        }

        const newUser = { username, password, storeName, email, phone };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        alert('註冊成功！請登入');
        navigate('/'); // 跳轉回登入頁面
    };

    return (
        <div className="SignUp">
            <h1>註冊頁面</h1>

            <p>請輸入用戶名稱:</p>
            <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                required
            />

            <p>密碼:</p>
            <div className="password-container">
                <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="button" onClick={togglePasswordVisibility}>
                    {showPassword ? '👁️' : '🙈'}
                </button>
            </div>

            <p>請輸入店名:</p>
            <input 
                type="text" 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)}
            />

            <p>請輸入 email:</p>
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <p>請輸入手機號碼:</p>
            <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
            />

            {error && <p className="error">{error}</p>}

            <button className="register-btn" onClick={handleSignUp}>
                註冊
            </button>

            {/* 新增 "返回登入畫面" 按鈕 */}
            <button className="back-btn" onClick={() => navigate('/')}>
                返回登入畫面
            </button>
        </div>
    );
}

export default SignUp;
