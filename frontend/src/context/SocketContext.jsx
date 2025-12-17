import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useError } from './ErrorContext';
import { getAccessToken } from '../api';

// 1. Khởi tạo socket
// (Đảm bảo trỏ đúng port 3000 của server)
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
const socket = io(SERVER_URL, {
  autoConnect: false, // Chỉ kết nối khi có AuthProvider,
  withCredentials: true
});

const SocketContext = createContext(null);

// 2. Tạo Hook
export const useSocket = () => {
  return useContext(SocketContext);
};

// 3. Tạo Provider
// - Chỉ kết nối khi auth đã hoàn tất và có access token
export const SocketProvider = ({ children }) => {
  const { user, ready, logout } = useAuth();
  const { showError } = useError();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const listenersAdded = useRef(false);
  const rewardCallbacks = useRef(new Set());

  useEffect(() => {
    const tryConnect = () => {
      const token = getAccessToken();
      if (!token) return;

      // Gán token vào handshake auth trước khi connect
      socket.auth = { token };
      socket.connect();
    };

    // Only connect when AuthProvider finished initial check and we have a user
    if (ready && user) {
      tryConnect();
    }

    // Handle when user logs out: disconnect socket
    if (ready && !user) {
      socket.disconnect();
      setIsConnected(false);
    }
  }, [ready, user]);

  useEffect(() => {
    if (listenersAdded.current) return;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
      setIsConnected(false);
    });

    // Khi server bắt buộc client đăng nhập lại
    socket.on('connect_error', (err) => {
      // Server gửi error message có thể là JSON string { code, message }
      let payload = { message: String(err?.message || err) };
      try {
        payload = JSON.parse(String(err?.message || '{}'));
      } catch (e) {
        // không phải JSON, giữ nguyên
      }
      if (payload.code === 'AUTH_REQUIRED') {
        showError(payload.message || 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.', true);
        // Đảm bảo client xóa session
        try { logout(); } catch (e) { /* ignore */ }
      } else {
        showError(payload.message || 'Lỗi kết nối realtime');
      }
    });

    // Khi server force logout (tài khoản đăng nhập nơi khác)
    socket.on('forceLogout', (data) => {
      const msg = (data && data.message) || 'Tài khoản đã được đăng nhập ở thiết bị khác';
      showError(msg, true);
      // Sau khi hiển thị, đảm bảo client logout
      setTimeout(() => {
        try { logout(); } catch (e) { /* ignore */ }
      }, 300);
    });

    // Lắng nghe thông báo phần thưởng mới
    socket.on('newRewardAvailable', (data) => {
      console.log('🎁 New reward notification received:', data);
      // Gọi tất cả callbacks đã đăng ký
      rewardCallbacks.current.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in reward callback:', error);
        }
      });
    });

    listenersAdded.current = true;

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('forceLogout');
      socket.off('newRewardAvailable');
      socket.disconnect();
      listenersAdded.current = false;
    };
  }, []);

  // Hàm để đăng ký callback cho reward notifications
  const onRewardNotification = (callback) => {
    rewardCallbacks.current.add(callback);
    // Trả về hàm cleanup
    return () => {
      rewardCallbacks.current.delete(callback);
    };
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, onRewardNotification }}>
      {children}
    </SocketContext.Provider>
  );
};