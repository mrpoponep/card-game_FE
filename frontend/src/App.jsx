import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Room from './pages/room/Room';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LinkEmail from './pages/auth/LinkEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import Home from './pages/home/Home';
import { AuthProvider, RequireAuth } from './hooks/AuthContext';
import { ErrorProvider, useError } from './hooks/ErrorContext';
import ErrorModal from './components/ErrorModal/ErrorModal';
import { setErrorModalCallback } from './api';

function AppContent() {
  const { showError, closeError, errorMessage, isErrorOpen } = useError();

  // Đăng ký callback để api.js gọi khi có lỗi
  React.useEffect(() => {
    setErrorModalCallback(showError);
  }, [showError]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/link-email" element={<LinkEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>}>
          <Route path="/room/:roomCode" element={<Room />} /> 
        </Route>
      </Routes>
      <ErrorModal isOpen={isErrorOpen} onClose={closeError} message={errorMessage} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ErrorProvider>
    </BrowserRouter>
  );
}
