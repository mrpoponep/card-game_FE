import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiPost } from '../../api';
import './ResetPassword.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Link không hợp lệ');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      const result = await apiPost('/auth/reset-password', { token, newPassword });
      if (result?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result?.message || 'Đã xảy ra lỗi');
      }
    } catch (err) {
      setError('Không thể đặt lại mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h1>✅ Thành công!</h1>
            <p>Mật khẩu đã được đặt lại</p>
          </div>
          <div className="reset-password-form">
            <div className="success-message">
              <p>Mật khẩu của bạn đã được cập nhật thành công.</p>
              <p>Đang chuyển đến trang đăng nhập...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1>Đặt lại mật khẩu</h1>
          <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <form className="reset-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <div className="password-field">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
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

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
}
