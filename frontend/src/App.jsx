import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import các component
import Room from './pages/room/Room';
import Home from './pages/home/Home'; 
import AuthPage from './pages/auth/AuthPage'; 
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect/HomeRedirect'; // 🔹 1. IMPORT

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route công khai: Trang đăng nhập/đăng ký */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Các route được bảo vệ */}
        <Route element={<ProtectedRoute />}>
          {/* 🔹 2. SỬA ROUTE NÀY */}
          {/* Khi vào trang gốc '/', tự động chuyển đến /:userId */}
          <Route path="/" element={<HomeRedirect />} />
          
          {/* 🔹 3. THÊM ROUTE NÀY */}
          {/* Trang Home bây giờ sẽ nằm ở /:userId */}
          <Route path="/:userId" element={<Home />} />

          {/* Route phòng chơi giữ nguyên */}
          <Route path="/room/:roomCode" element={<Room />} /> 
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}
