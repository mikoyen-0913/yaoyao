import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Home from './Home';
import Inventory from './Inventory';
import OrdersPage from './OrdersPage';
import BusinessStatus from './BusinessStatus';
import RecipesPage from './RecipesPage';
import BossBusinessStatus from './BossBusinessStatus';
import BossInventory from './BossInventory';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/businessstatus" element={<BusinessStatus />} />
      <Route path="/bossbusinessstatus" element={<BossBusinessStatus />} />
      <Route path="/recipe" element={<RecipesPage />} />
      <Route path="/bossinventory" element={<BossInventory />} /> {/* ✅ 新增這行 */}
    </Routes>
  );
};

export default App;
