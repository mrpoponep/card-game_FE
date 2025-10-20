import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Chờ cho đến khi AuthContext kiểm tra localStorage xong
    return <div>Loading...</div>; // Hoặc spinner
  }

  if (!user) {
    // Nếu không có user, chuyển hướng về trang /auth
    return <Navigate to="/auth" replace />;
  }

  // Nếu có user, cho phép truy cập trang
  return <Outlet />;
};

export default ProtectedRoute;