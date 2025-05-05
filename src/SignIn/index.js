import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const SignIn = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        setError(''); // 清除之前的錯誤
        fetch('http://localhost:5000/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === '登入成功') {
                alert('登入成功！');
                navigate('/home');
            } else {
                setError(data.error || '登入失敗，請重新輸入');
            }
        })
        .catch(() => setError('伺服器連線失敗，請稍後再試'));
    };

    return (
        <div className="SignIn">
            <h1>後場小幫手</h1>

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

            {error && <p className="error">{error}</p>}

            <div className="button-row">
                <button className="SUbt" onClick={handleLogin}>登入</button>
                <button className="SIbt" onClick={() => navigate('/signup')}>註冊</button>
            </div>
        </div>
    );
};

export default SignIn;
