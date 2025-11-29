import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Room from './pages/room/Room';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LinkEmail from './pages/auth/LinkEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import Home from './pages/home/Home';
import PaymentResult from './pages/payment/PaymentResult';
import MatchResultScreen from './pages/MatchResultScreen/MatchResultScreen';
import { AuthProvider, RequireAuth } from './context/AuthContext';
import { ErrorProvider, useError } from './context/ErrorContext';
import ErrorModal from './components/ErrorModal/ErrorModal';
import { setErrorModalCallback } from './api';
import { SocketProvider } from './context/SocketContext';

function AppContent() {
  const { showError, closeError, errorMessage, isErrorOpen } = useError();
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
        {/* Home is the authenticated landing page */}
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        {/* Payment result page - không cần auth vì redirect từ VNPay */}
        <Route path="/payment-result" element={<PaymentResult />} />
        {/* Room is a standalone page that replaces Home */}
        <Route path="/room/:roomCode" element={<RequireAuth><Room /></RequireAuth>} />
        {/* Match result screen */}
        <Route path="/match-result" element={<RequireAuth><MatchResultScreen /></RequireAuth>} />
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
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </AuthProvider>
      </ErrorProvider>
    </BrowserRouter>
  );
}
