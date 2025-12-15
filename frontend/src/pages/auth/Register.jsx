import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { apiPost } from '../../api';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ===== Validate =====
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (formData.username.length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      // Lấy refCode từ URL nếu có
      const params = new URLSearchParams(window.location.search);
      let refCode = params.get('ref');
      if (!refCode) {
        refCode = localStorage.getItem('refCode') || undefined;
      }
      const data = await apiPost('/auth/register', {
        username: formData.username,
        password: formData.password,
        refCode // gửi refCode lên backend nếu có, nếu không thì undefined
      });

      if (data.success) {
        // 🔑 LƯU refCode để login xử lý activate
        navigate('/login', {
          replace: true,
          state: {
            message: 'Đăng ký thành công! Vui lòng đăng nhập để nhận thưởng.',
            refCode // ⬅️ truyền sang Login
          }
        });
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-modal">
        <div className="register-header">
          <h1>🎴 Đăng Ký Tài Khoản</h1>
          <p className="register-subtitle">Tạo tài khoản mới để bắt đầu chơi</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập (tối thiểu 3 ký tự)"
              disabled={loading}
              className="transition duration-150 focus:ring-2 focus:ring-yellow-300 rounded tw-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              disabled={loading}
              className="transition duration-150 focus:ring-2 focus:ring-yellow-300 rounded tw-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              disabled={loading}
              className="transition duration-150 focus:ring-2 focus:ring-yellow-300 rounded tw-input"
            />
          </div>

          <button type="submit" className="register-button transition transform duration-150 tw-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>

          <div className="register-links">
            <p>
              Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
