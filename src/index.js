import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import SignIn from './SignInPage';
import SignUp from './SignUpPage';
import EditPage from './EditPage';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/editpage" element={<EditPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
