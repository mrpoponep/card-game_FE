import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Room from './pages/room/Room';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LinkEmail from './pages/auth/LinkEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import AppLayout from './pages/app/AppLayout';
import Home from './pages/app/Home';
import { AuthProvider, RequireAuth } from './hooks/AuthContext';
import ErrorModal from './components/ErrorModal/ErrorModal';
import { setErrorModalCallback } from './api';

export default function App() {
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);

  const showError = useCallback((msg, is401 = false) => {
    setErrorMessage(msg);
    setIsErrorOpen(true);
    setShouldRedirectToLogin(is401);
  }, []);

  const handleCloseError = useCallback(() => {
    setIsErrorOpen(false);
    if (shouldRedirectToLogin) {
      // Redirect về trang đăng nhập sau khi đóng modal
      window.location.href = '/login';
    }
  }, [shouldRedirectToLogin]);

  // Đăng ký callback để api.js gọi khi có lỗi
  React.useEffect(() => {
    setErrorModalCallback(showError);
  }, [showError]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/link-email" element={<LinkEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index element={<Home />} />
            <Route path="room" element={<Room />} />
          </Route>
        </Routes>
        <ErrorModal isOpen={isErrorOpen} onClose={handleCloseError} message={errorMessage} />
      </AuthProvider>
    </BrowserRouter>
  );
}
