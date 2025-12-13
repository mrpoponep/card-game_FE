import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiPost } from '../api';
import { setAccessToken as setApiAccessToken } from '../api';

const AuthContext = createContext(null);
// Module-level shared promise to deduplicate automatic refresh calls across
// component remounts (React StrictMode may mount/unmount twice in dev).
let _autoRefreshPromise = null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(true); 
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
      await apiPost('/auth/logout', {}, {sessionId: (() => { try { return sessionStorage.getItem('session_id'); } catch (e) { return null; } })() });
    } catch {}
    setApiAccessToken(null);
    setUser(null);
    try { sessionStorage.removeItem('session_id'); } catch (e) { /* ignore */ }
    // Clear any pending auto-refresh so future mounts can attempt refresh again
    try { _autoRefreshPromise = null; } catch (e) { /* ignore */ }
    navigate('/login', { replace: true });
  }, [navigate]);

  const updateBalance = useCallback((newBalance) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      return { ...prevUser, balance: newBalance };
    });
  }, []);

  const updateGems = useCallback((newGems) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      return { ...prevUser, gems: newGems };
    });
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      return { ...prevUser, ...updates };
    });
  }, []);

  // --- MỚI: Hàm tải lại thông tin user từ Server ---
  const reloadUser = useCallback(async () => {
    try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
        // Thêm timestamp để tránh cache trình duyệt
        const res = await fetch(`${API_BASE}/auth/refresh?t=${Date.now()}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data?.user) {
            console.log("User reloaded:", data.user); // Log kiểm tra
            setUser(data.user); 
            return true;
          }
        }
    } catch (e) {
        console.error("Reload user failed", e);
    }
    return false;
  }, []);

  // Khởi tạo: thực hiện refresh nếu có cookie refresh_token (auto-login)
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
    reloadUser // Export hàm này
  }), [user, ready, isAutoLoggingIn, login, logout, updateBalance, updateGems, updateUser, reloadUser]);
  
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