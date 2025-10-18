import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import './Login.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
            setError('');
            setLoading(true);
            try {
              const form = new FormData(e.currentTarget);
              const username = form.get('username');
              const password = form.get('password');
              const remember = form.get('remember') === 'on';
              const result = await login({ username, password, remember });
              if (result.ok) {
                navigate('/app', { replace: true });
              } else {
                setError(result.error || 'Đăng nhập thất bại');
              }
            } catch (err) {
              setError('Đã xảy ra lỗi khi đăng nhập');
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập hoặc Email</label>
            <input id="username" name="username" type="text" placeholder="Nhập tên đăng nhập hoặc email" autoComplete="username" required />
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
                onClick={() => setShowPassword((v) => !v)}
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
            <a className="link" href="#">Quên mật khẩu?</a>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>

          {error && <div className="error" role="alert">{error}</div>}

          <div className="divider"><span>hoặc</span></div>

          <button type="button" className="btn-outline" disabled>
            Tiếp tục với tư cách Khách
          </button>

          <p className="signup-text">
            Mới tham gia? <a href="#" className="link">Tạo tài khoản</a>
          </p>
        </form>
      </div>
    </div>
  );
}
