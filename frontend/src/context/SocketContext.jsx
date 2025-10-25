import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/AuthContext';
import { getAccessToken } from '../api';

// 1. Khởi tạo socket
// (Đảm bảo trỏ đúng port 3000 của server)
const SERVER_URL = 'http://localhost:3000';
const socket = io(SERVER_URL, {
  autoConnect: false // Chỉ kết nối khi có AuthProvider
});

const SocketContext = createContext(null);

// 2. Tạo Hook
export const useSocket = () => {
  return useContext(SocketContext);
};

// 3. Tạo Provider
// - Chỉ kết nối khi auth đã hoàn tất và có access token
export const SocketProvider = ({ children }) => {
  const { user, ready } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const listenersAdded = useRef(false);

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
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    listenersAdded.current = true;

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
      listenersAdded.current = false;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};