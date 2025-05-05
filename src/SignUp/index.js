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
        setError(''); // 清除之前的錯誤
        fetch('http://localhost:5000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password,
                storeName,
                email,
                phone
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === '註冊成功') {
                alert('註冊成功！請登入');
                navigate('/');
            } else {
                setError(data.error || '註冊失敗，請重新輸入');
            }
        })
        .catch(() => setError('伺服器連線失敗，請稍後再試'));
    };

    return (
        <div className="SignUp">
            <h1>註冊頁面</h1>

            <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="請輸入帳號"
                required
            />

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
