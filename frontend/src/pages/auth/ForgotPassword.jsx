import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../../api';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: nhập username, 2: nhập OTP, 3: nhập password mới
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hiddenEmail, setHiddenEmail] = useState('');

  // Bước 1: Gửi OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const result = await apiPost('/auth/send-reset-otp', { username });
      if (result?.success) {
        setHiddenEmail(result.email);
        setMessage(result.message);
        setStep(2); // Chuyển sang bước nhập OTP
      } else {
        setError(result?.message || 'Đã xảy ra lỗi');
      }
    } catch (err) {
      setError('Không thể gửi mã xác thực. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP và chuyển sang bước 3
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Mã xác thực phải có 6 số');
      return;
    }
    setStep(3); // Chuyển sang bước nhập mật khẩu mới
  };

  // Bước 3: Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const result = await apiPost('/auth/verify-otp-reset-password', { 
        username, 
        otp, 
        newPassword 
      });
      if (result?.success) {
        setMessage(result.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result?.message || 'Đã xảy ra lỗi');
      }
    } catch (err) {
      setError('Không thể đặt lại mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>Quên mật khẩu?</h1>
          <p>
            {step === 1 && 'Nhập tên đăng nhập để nhận mã xác thực'}
            {step === 2 && 'Nhập mã xác thực đã gửi đến email'}
            {step === 3 && 'Nhập mật khẩu mới'}
          </p>
        </div>

        {/* Bước 1: Nhập username */}
        {step === 1 && (
          <form className="forgot-password-form" onSubmit={handleSendOTP}>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
            </button>

            {error && <div className="error-message">{error}</div>}

            <div className="back-to-login">
              <Link to="/login" className="link">
                ← Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}

        {/* Bước 2: Nhập OTP */}
        {step === 2 && (
          <form className="forgot-password-form" onSubmit={handleVerifyOTP}>
            {message && <div className="success-message">{message}</div>}
            
            <div className="form-group">
              <label htmlFor="otp">Mã xác thực (6 số)</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Nhập mã 6 số"
                maxLength="6"
                required
                autoFocus
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold' }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={otp.length !== 6}>
              Xác thực
            </button>

            {error && <div className="error-message">{error}</div>}

            <div className="back-to-login">
              <button 
                type="button" 
                className="link-button" 
                onClick={() => { setStep(1); setOtp(''); setError(''); setMessage(''); }}
              >
                ← Quay lại
              </button>
            </div>
          </form>
        )}

        {/* Bước 3: Nhập mật khẩu mới */}
        {step === 3 && (
          <form className="forgot-password-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <div className="password-field">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <div className="password-field">
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="back-to-login">
              <button 
                type="button" 
                className="link-button" 
                onClick={() => { setStep(2); setNewPassword(''); setConfirmPassword(''); setError(''); }}
              >
                ← Quay lại
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
