import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { trackReferralClick } from '../../services/referral';
import './Login.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, ready } = useAuth();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * ✅ TRACK REFERRAL CLICK
   * Chỉ chạy 1 lần khi user mở link có ?ref=
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
      // Lưu refCode vào localStorage để Register.jsx có thể lấy lại nếu user chuyển trang
      localStorage.setItem('refCode', refCode);
      trackReferralClick(refCode)
        .then(() => {
          console.log('✅ Referral click tracked:', refCode);
        })
        .catch(() => {
          // Không cần show error cho user
          console.warn('⚠️ Failed to track referral click');
        });
    }
  }, [location.search]);

  // Nếu đã đăng nhập, chuyển về trang chính
  useEffect(() => {
    if (ready && user) {
      navigate('/', { replace: true });
    }
  }, [ready, user, navigate]);

  // Hiển thị thông báo từ trang đăng ký
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="login-page">
      <div className="login-card" role="dialog" aria-labelledby="login-title" aria-describedby="login-desc">
        <div className="login-header">
          <h1 id="login-title">Đăng nhập</h1>
          <p id="login-desc">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <form
          className="login-form"
          onSubmit={async (e) => {
            e.preventDefault();

            if (loading) return;

            setError('');
            setLoading(true);
            try {
              const form = new FormData(e.currentTarget);
              const username = form.get('username');
              const password = form.get('password');
              const remember = form.get('remember') === 'on';

              const result = await login({ username, password, remember });

              if (result.ok) {
                navigate('/', { replace: true });
              } else {
                setError(result.error || 'Đăng nhập thất bại');
              }
            } catch {
              setError('Đã xảy ra lỗi khi đăng nhập');
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập hoặc Email</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Nhập tên đăng nhập hoặc email"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-row">
            <label className="checkbox">
              <input type="checkbox" name="remember" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/forgot-password" className="link">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>

          {successMessage && <div className="success-message">{successMessage}</div>}
          {error && <div className="error">{error}</div>}

          <p className="signup-text">
            Mới tham gia? <Link to="/register" className="link" onClick={() => {
              // Nếu có refCode trong localStorage, truyền sang Register qua state
              const refCode = localStorage.getItem('refCode');
              if (refCode) {
                navigate('/register', { state: { refCode } });
              }
            }}>Tạo tài khoản</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
