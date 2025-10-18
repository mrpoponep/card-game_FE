import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiPost } from '../api';
import { setAccessToken as setApiAccessToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
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
    // Nếu đang ở vùng /app thì đưa về trang chủ
    if (location.pathname.startsWith('/app')) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Khởi tạo: thử refresh nếu có cookie refresh_token
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
          }
        }
      } catch {}
      if (mounted) setReady(true);
    })();
    return () => { mounted = false; };
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);
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
      navigate('/', { replace: true });
    }
  }, [ready, user, navigate]);
  
  if (!ready) return null; // hoặc spinner
  if (!user) return null;
  return children;
}
