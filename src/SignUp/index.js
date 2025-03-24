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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

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
        navigate('/'); // 返回登入頁
    };

    return (
        <div className="SignUp">
            <h1>註冊頁面</h1>

            {/* ✅ 改為 placeholder 提示「請輸入帳號」 */}
            <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="請輸入帳號"
                required
            />

            {/* ✅ 密碼也改為 placeholder */}
            <div className="password-container">
                <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="password-input"
                    placeholder="請輸入密碼"
                />
                <button 
                    type="button" 
                    onClick={togglePasswordVisibility} 
                    className="password-toggle-btn"
                    aria-label="切換密碼顯示"
                > 
                    {showPassword ? '👁️' : '🙈'}
                </button>
            </div>

            {/* ✅ 其餘欄位也改為 placeholder */}
            <input 
                type="text" 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="請輸入店名"
            />

            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="請輸入 email"
                required
            />

            <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="請輸入手機號碼"
            />

            {error && <p className="error">{error}</p>}

            <button className="register-btn" onClick={handleSignUp}>
                註冊
            </button>

            <button className="back-btn" onClick={() => navigate('/')}> 
                返回登入畫面
            </button>
        </div>
    );
};

export default SignUp;
