import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiPost } from '../../api';
import { useAuth } from '../../context/AuthContext';
// Không cần import './LinkEmail.css';

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
        const loginResult = await login({ username, password, remember: true });
        if (loginResult.ok) {
          navigate('/', { replace: true });
        } else {
          navigate('/login', { 
            state: { message: 'Xác thực thành công! Vui lòng đăng nhập' } 
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
      const loginResult = await login({ username, password, remember: true });
      if (loginResult.ok) {
        navigate('/', { replace: true });
      } else {
        navigate('/login', { 
          state: { message: 'Đăng ký thành công! Vui lòng đăng nhập' } 
        });
      }
    } catch (err) {
      navigate('/login', { 
        state: { message: 'Đăng ký thành công! Vui lòng đăng nhập' } 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Container Style Casino
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0000] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3d0000] via-[#1a0000] to-black z-0"></div>

      {/* Card */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#8b1a1a]/95 to-[#5e0b0b]/95 border-[3px] border-[#FFD700] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md text-white z-10 overflow-hidden">
        
        {/* Header */}
        <div className="text-center py-6 px-6 border-b border-[#FFD700]/30 bg-black/20">
          <h1 className="text-3xl font-bold text-[#FFD700] mb-2 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] uppercase">
             Liên Kết Email
          </h1>
          <p className="text-sm text-gray-200">
            Xin chào <strong className="text-[#FFD700]">{username}</strong>!
          </p>
        </div>

        {step === 1 ? (
          <form className="p-8 space-y-6" onSubmit={handleSendOTP}>
            {error && (
              <div className="p-3 rounded-lg bg-red-900/40 border border-red-500 text-red-200 text-sm text-center animate-pulse">
                {error}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-black/30 border border-[#FFD700]/20 rounded-lg p-4 text-sm text-gray-300 space-y-2">
              <p className="text-[#FFD700] font-bold">💡 Tại sao cần liên kết email?</p>
              <ul className="list-disc list-inside space-y-1 opacity-90">
                <li>Khôi phục tài khoản khi quên mật khẩu.</li>
                <li>Một email có thể liên kết tối đa 5 tài khoản.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-[#FFD700] uppercase tracking-wider drop-shadow-sm">
                Địa chỉ Email
              </label>
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
                className="w-full px-4 py-3 rounded-lg bg-black/40 border-2 border-[#FFD700]/30 text-white placeholder-white/40 focus:border-[#FFD700] focus:bg-black/60 focus:outline-none transition-all duration-300"
              />
            </div>

            <div className="space-y-3 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-3 px-4 bg-gradient-to-br from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD700] text-[#4a2500] font-bold text-base uppercase tracking-wider rounded-lg border-2 border-[#FFE14A] shadow-[0_4px_14px_rgba(255,215,0,0.35)] active:scale-[0.98] transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed grayscale-[0.5]' : ''}`}
              >
                {loading ? 'Đang gửi...' : 'Gửi Mã Xác Thực'}
              </button>

              <button 
                type="button" 
                onClick={handleSkip}
                disabled={loading}
                className="w-full py-3 px-4 bg-transparent border-2 border-[#FFD700]/40 text-[#FFD700] font-bold text-base uppercase tracking-wider rounded-lg hover:bg-[#FFD700]/10 hover:border-[#FFD700] transition-all duration-200"
              >
                Bỏ Qua
              </button>
            </div>
          </form>
        ) : (
          <form className="p-8 space-y-6" onSubmit={handleVerifyOTP}>
            {error && (
              <div className="p-3 rounded-lg bg-red-900/40 border border-red-500 text-red-200 text-sm text-center animate-pulse">
                {error}
              </div>
            )}

            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 text-sm text-green-200 text-center">
              <p> Mã xác thực đã gửi đến: <strong className="text-white">{email}</strong></p>
              <p className="text-xs mt-1 opacity-80">Vui lòng kiểm tra hộp thư đến (hoặc thư rác).</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-bold text-[#FFD700] uppercase tracking-wider drop-shadow-sm">
                Mã Xác Thực (6 chữ số)
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                placeholder="000000"
                disabled={loading}
                maxLength="6"
                autoComplete="off"
                className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-bold rounded-lg bg-black/40 border-2 border-[#FFD700]/30 text-[#FFD700] placeholder-white/20 focus:border-[#FFD700] focus:bg-black/60 focus:outline-none transition-all duration-300"
              />
            </div>

            <div className="space-y-3 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-3 px-4 bg-gradient-to-br from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD700] text-[#4a2500] font-bold text-base uppercase tracking-wider rounded-lg border-2 border-[#FFE14A] shadow-[0_4px_14px_rgba(255,215,0,0.35)] active:scale-[0.98] transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed grayscale-[0.5]' : ''}`}
              >
                {loading ? 'Đang xác thực...' : 'Xác Thực'}
              </button>

              <button 
                type="button" 
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-full py-3 px-4 bg-transparent border-2 border-[#FFD700]/40 text-[#FFD700] font-bold text-base uppercase tracking-wider rounded-lg hover:bg-[#FFD700]/10 hover:border-[#FFD700] transition-all duration-200"
              >
                Quay Lại
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LinkEmail;