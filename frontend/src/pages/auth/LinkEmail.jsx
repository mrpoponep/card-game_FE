import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { apiPost } from '../../api';
import { useAuth } from '../../hooks/AuthContext';
import './LinkEmail.css';

function LinkEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { userId, username, password } = location.state || {};

  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Nếu không có userId hoặc password, chuyển về trang đăng ký
  if (!userId || !password) {
    navigate('/register');
    return null;
  }

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setLoading(true);

    try {
      const data = await apiPost('/auth/send-email-verification-otp', {
        userId,
        email
      });

      if (data.success) {
        setStep(2);
      } else {
        setError(data.message || 'Gửi mã xác thực thất bại');
      }
    } catch (err) {
      setError(err.message || 'Gửi mã xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp) {
      setError('Vui lòng nhập mã xác thực');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('Mã xác thực phải là 6 chữ số');
      return;
    }

    setLoading(true);

    try {
      const data = await apiPost('/auth/verify-email-otp', {
        userId,
        otp
      });

      if (data.success) {
        // Tự động đăng nhập sau khi verify email thành công
        const loginResult = await login({ username, password, remember: true });
        if (loginResult.ok) {
          navigate('/', { replace: true });
        } else {
          // Nếu đăng nhập thất bại (không thể xảy ra), chuyển về login
          navigate('/login', { 
            state: { 
              message: 'Xác thực thành công! Vui lòng đăng nhập'
            } 
          });
        }
      } else {
        setError(data.message || 'Xác thực thất bại');
      }
    } catch (err) {
      setError(err.message || 'Xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      // Tự động đăng nhập khi bỏ qua liên kết email
      const loginResult = await login({ username, password, remember: true });
      if (loginResult.ok) {
        navigate('/', { replace: true });
      } else {
        // Nếu đăng nhập thất bại, chuyển về login
        navigate('/login', { 
          state: { 
            message: 'Đăng ký thành công! Vui lòng đăng nhập'
          } 
        });
      }
    } catch (err) {
      navigate('/login', { 
        state: { 
          message: 'Đăng ký thành công! Vui lòng đăng nhập'
        } 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="link-email-container">
      <div className="link-email-modal">
        <div className="link-email-header">
          <h1>📧 Liên Kết Email</h1>
          <p className="link-email-subtitle">
            Xin chào <strong>{username}</strong>!
          </p>
        </div>

        {step === 1 ? (
          <form className="link-email-form" onSubmit={handleSendOTP}>
            {error && <div className="error-message">{error}</div>}

            <div className="info-box">
              <p>
                <strong>💡 Tại sao cần liên kết email?</strong>
              </p>
              <p>Email được sử dụng để khôi phục tài khoản khi bạn quên mật khẩu.</p>
              <p>Một email có thể liên kết tối đa 5 tài khoản.</p>
              <p>Bạn có thể bỏ qua bước này và liên kết sau.</p>
            </div>

            <div className="form-group">
              <label htmlFor="email">Địa chỉ Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Nhập địa chỉ email của bạn"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <button 
              type="submit" 
              className="link-email-button primary"
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi Mã Xác Thực'}
            </button>

            <button 
              type="button" 
              className="link-email-button secondary"
              onClick={handleSkip}
              disabled={loading}
            >
              Bỏ Qua
            </button>
          </form>
        ) : (
          <form className="link-email-form" onSubmit={handleVerifyOTP}>
            {error && <div className="error-message">{error}</div>}

            <div className="success-box">
              <p>✅ Mã xác thực đã được gửi đến email: <strong>{email}</strong></p>
              <p>Vui lòng kiểm tra hộp thư đến (hoặc thư rác).</p>
            </div>

            <div className="form-group">
              <label htmlFor="otp">Mã Xác Thực (6 chữ số)</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                placeholder="Nhập mã 6 chữ số"
                disabled={loading}
                maxLength="6"
                autoComplete="off"
              />
            </div>

            <button 
              type="submit" 
              className="link-email-button primary"
              disabled={loading}
            >
              {loading ? 'Đang xác thực...' : 'Xác Thực'}
            </button>

            <button 
              type="button" 
              className="link-email-button secondary"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Quay Lại
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LinkEmail;
