import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiPost } from '../api';
import { setAccessToken as setApiAccessToken } from '../api';

const AuthContext = createContext(null);
// Module-level shared promise to deduplicate automatic refresh calls across
// component remounts (React StrictMode may mount/unmount twice in dev).
let _autoRefreshPromise = null;
let _isRefreshing = false; // Global flag to prevent concurrent refresh calls

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
      try {
        if (res.sessionId) {
          sessionStorage.setItem('session_id', res.sessionId);
        } else {
          try { sessionStorage.removeItem('session_id'); } catch (e) { }
        }
      } catch (e) { /* ignore */ }
      return { ok: true, user: res.user }; 
    }
    return { ok: false, error: res?.message || 'Đăng nhập thất bại' };
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost('/auth/logout', {}, { sessionId: (() => { try { return sessionStorage.getItem('session_id'); } catch (e) { return null; } })() });
    } catch { }
    setApiAccessToken(null);
    setUser(null);
    try { sessionStorage.removeItem('session_id'); } catch (e) { /* ignore */ }
    // Clear any pending auto-refresh so future mounts can attempt refresh again
    try { _autoRefreshPromise = null; } catch (e) { /* ignore */ }
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

  // Hàm cập nhật gems sau khi nhận thưởng
  const updateGems = useCallback((newGems) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      return { ...prevUser, gems: newGems };
    });
  }, []);

  // Hàm cập nhật cả balance và gems
  const updateUser = useCallback((updates) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      return { ...prevUser, ...updates };
    });
  }, []);

  // Hàm refresh thông tin user từ server (sau payment, etc.)
  const refetchUserData = useCallback(async () => {
    // Guard: Nếu đang refresh thì skip
    if (_isRefreshing) {
      console.log('⏳ Already refreshing, skipping duplicate call...');
      return { success: false, message: 'Already refreshing' };
    }

    _isRefreshing = true;

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.user) {
          setUser(data.user);
          if (data?.accessToken) {
            setApiAccessToken(data.accessToken);
          }
          return { success: true, user: data.user };
        }
      }

      // Handle 401 or other errors
      if (res.status === 401) {
        console.log('Refresh token expired or invalid');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to refetch user data:', err);
    } finally {
      _isRefreshing = false;
    }

    return { success: false };
  }, []);

  // Khởi tạo: thự refresh nếu có cookie refresh_token (auto-login)
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Deduplicate across remounts by using a shared module-level promise.
      if (!_autoRefreshPromise) {
        _autoRefreshPromise = (async () => {
          try {
            const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
            const res = await fetch(`${API_BASE}/auth/refresh`, {
              method: 'POST',
              credentials: 'include'
            });
            if (res.ok) {
              const data = await res.json();
              return data;
            }
          } catch (err) {
            return null;
          }
          return null;
        })();
      }

      try {
        const data = await _autoRefreshPromise;
        if (data?.success && data?.accessToken) {
          if (!mounted) return;
          setApiAccessToken(data.accessToken);
          setUser(data.user || null);
          // Tự động chuyển đến trang chính nếu đang ở trang login
          if (location.pathname === '/login') {
            navigate('/', { replace: true });
          }
        }
      } catch (e) {
        // ignore
      }

      if (mounted) {
        setReady(true);
        setIsAutoLoggingIn(false);
      }
    })();
    return () => { mounted = false; };
  }, []); // Chỉ chạy 1 lần khi mount

  const value = useMemo(() => ({
    user,
    ready,
    isAutoLoggingIn,
    login,
    logout,
    updateBalance,
    updateGems,
    updateUser,
    refetchUserData
  }), [user, ready, isAutoLoggingIn, login, logout, updateBalance, updateGems, updateUser]);
  // 🔥 BỎ refetchUserData khỏi dependencies để tránh recreate function liên tục

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
