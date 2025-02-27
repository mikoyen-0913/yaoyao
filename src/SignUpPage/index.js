import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const SignUp = () => {
    const navigate = useNavigate(); // 用來切換頁面

    return (
        <div className="SignUp">
            <h1>註冊頁面</h1>
            <p>請輸入用戶名稱:</p>
            <input type="user" />
            <p>密碼:</p>
            <input type="pw" />
            <p>請輸入店名:</p>
            <input type="StoreName" />
            <p>請輸入email:</p>
            <input type="email" />
            <p>請輸入手機號碼:</p>
            <input type="ph" />

            <button className='return' onClick={() => navigate('/')}>註冊並返回登入</button>
        </div>
    );
}

export default SignUp;
