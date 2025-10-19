import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiPost } from '../api';
import { setAccessToken as setApiAccessToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(true); // Flag cho auto-login
  const navigate = useNavigate();
  const location = useLocation();

  const login = useCallback(async ({ username, password, remember }) => {
    const res = await apiPost('/auth/login', { username, password, remember: !!remember });
    if (res?.success) {
      setApiAccessToken(res.accessToken);
      setUser(res.user);
      return { ok: true };
    }
    return { ok: false, error: res?.message || 'Đăng nhập thất bại' };
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost('/auth/logout');
    } catch {}
    setApiAccessToken(null);
    setUser(null);
    // Đưa về trang đăng nhập
    navigate('/login', { replace: true });
  }, [navigate]);

  // Hàm cập nhật balance sau khi nhận thưởng
  const updateBalance = useCallback((newBalance) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      return { ...prevUser, balance: newBalance };
    });
  }, []);

  // Khởi tạo: thự refresh nếu có cookie refresh_token (auto-login)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data?.accessToken) {
            if (!mounted) return;
            setApiAccessToken(data.accessToken);
            setUser(data.user || null);
            
            // Tự động chuyển đến trang chính nếu đang ở trang login
            if (location.pathname === '/login') {
              navigate('/', { replace: true });
            }
          }
        }
      } catch {}
      if (mounted) {
        setReady(true);
        setIsAutoLoggingIn(false);
      }
    })();
    return () => { mounted = false; };
  }, []); // Chỉ chạy 1 lần khi mount

  const value = useMemo(() => ({ user, ready, isAutoLoggingIn, login, logout, updateBalance }), [user, ready, isAutoLoggingIn, login, logout, updateBalance]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (ready && !user) {
      navigate('/login', { replace: true });
    }
  }, [ready, user, navigate]);
  
  if (!ready) return null; // hoặc spinner
  if (!user) return null;
  return children;
}
