import React, { createContext, useContext, useState, useEffect } from 'react';

// Tạo Context
const AuthContext = createContext(null);

// Tạo Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Thêm cờ loading

  // Kiểm tra localStorage khi app khởi động
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('poker_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('poker_user');
    }
    setIsLoading(false); // Hoàn tất kiểm tra ban đầu
  }, []);

  // Hàm đăng nhập: lưu vào state và localStorage
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('poker_user', JSON.stringify(userData));
  };

  // Hàm đăng xuất: xóa khỏi state và localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('poker_user');
  };

  // Chỉ render children khi đã kiểm tra xong (tránh "giật" trang)
  if (isLoading) {
    return null; // Hoặc một màn hình loading toàn trang
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để dễ dàng sử dụng context
export const useAuth = () => {
  return useContext(AuthContext);
};