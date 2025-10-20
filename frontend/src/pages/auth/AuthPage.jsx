import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRegister, apiLogin } from '../../api'; // Sẽ cập nhật api.js ở bước sau
import './AuthPage.css';

function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const validateInput = () => {
    if (username.length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return false;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return false;
    }
    if (!isLoginMode && password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateInput()) {
      return;
    }

    setLoading(true);

    try {
      let response; // Khai báo response ở ngoài

      if (isLoginMode) {
        // --- Logic Đăng nhập (ĐÃ SỬA) ---
        response = await apiLogin(username, password);
      } else {
        // --- Logic Đăng ký ---
        response = await apiRegister(username, password);
      }
      
      // Đăng ký/Đăng nhập thành công
      const loggedInUser = response.user;
      
      // 2. Lưu user vào Context
      login(loggedInUser); 
      
      // 3. Chuyển hướng đến URL MỚI (vd: /1, /2)
      navigate(`/${loggedInUser.user_id}`);

    } catch (err) {
      // Xử lý lỗi từ server (vd: username tồn tại, sai mật khẩu)
      try {
        const errorData = JSON.parse(err.message);
        setError(errorData.message || 'Đã xảy ra lỗi.');
      } catch (parseError) {
        setError(err.message || 'Đã xảy ra lỗi không xác định.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-header">
          {isLoginMode ? 'Đăng Nhập' : 'Đăng Ký'}
        </h2>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <input
            type="text"
            className="auth-input"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {!isLoginMode && (
            <input
              type="password"
              className="auth-input"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Đang xử lý...' : (isLoginMode ? 'Đăng Nhập' : 'Đăng Ký')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLoginMode ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <span onClick={toggleMode}>
            {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;