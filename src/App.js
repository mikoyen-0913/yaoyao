// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Home from './Home';
import Inventory from './Inventory';
import OrdersPage from './OrdersPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
};

export default App;
