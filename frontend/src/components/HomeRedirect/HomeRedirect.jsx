import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    // Nếu vì lý do nào đó không có user, quay lại trang auth
    return <Navigate to="/auth" replace />;
  }

  // Chuyển hướng đến trang /:userId của chính họ
  return <Navigate to={`/${user.user_id}`} replace />;
}

export default HomeRedirect;