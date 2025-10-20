import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

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
export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Kết nối socket
    socket.connect();

    // Lắng nghe các sự kiện (ví dụ)
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Dọn dẹp khi unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};