import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { trackReferralClick } from '../../services/referral';
// Không cần import './Login.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, ready } = useAuth();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ TRACK REFERRAL CLICK
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('refCode', refCode);
      trackReferralClick(refCode)
        .then(() => console.log('✅ Referral click tracked:', refCode))
        .catch(() => console.warn('⚠️ Failed to track referral click'));
    }
  }, [location.search]);

  useEffect(() => {
    if (ready && user) {
      navigate('/', { replace: true });
    }
  }, [ready, user, navigate]);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    // Container: Dark Red/Black Gradient Background
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0000] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3d0000] via-[#1a0000] to-black z-0"></div>
      
      {/* Login Card */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#8b1a1a]/95 to-[#5e0b0b]/95 border-[3px] border-[#FFD700] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md text-white z-10 overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center py-6 px-8 bg-black/20 border-b border-[#FFD700]/30 relative">
          <h1 className="text-3xl font-bold text-[#FFD700] mb-1 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] uppercase tracking-wide">
            Đăng nhập
          </h1>
          <p className="text-sm text-[#FFE27A] drop-shadow-md">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <form
          className="p-8 space-y-5"
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
                if (result.user?.role === 'Admin') {
                  navigate('/admin', { replace: true });
                } else {
                  navigate('/', { replace: true });        
                }
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
          {/* Username */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-bold text-[#FFD700] uppercase tracking-wider drop-shadow-sm">
              Tên đăng nhập hoặc Email
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Nhập tên đăng nhập hoặc email"
              autoComplete="username"
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border-2 border-[#FFD700]/30 text-white placeholder-white/40 focus:border-[#FFD700] focus:bg-black/60 focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-bold text-[#FFD700] uppercase tracking-wider drop-shadow-sm">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 pr-12 rounded-lg bg-black/40 border-2 border-[#FFD700]/30 text-white placeholder-white/40 focus:border-[#FFD700] focus:bg-black/60 focus:outline-none transition-all duration-300"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:bg-[#FFD700]/10 p-1 rounded transition-colors"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  // Icon Ẩn Mật Khẩu (Eye Slash)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  // Icon Hiện Mật Khẩu (Eye)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember & Forgot Pass */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-white select-none group">
              <input type="checkbox" name="remember" className="w-4 h-4 cursor-pointer accent-[#FFD700]" />
              <span className="group-hover:text-[#FFD700] transition-colors">Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/forgot-password" className="text-[#FFD700] hover:text-[#FFA500] hover:underline transition-colors">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 mt-2 bg-gradient-to-br from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD700] text-[#4a2500] font-bold text-base uppercase tracking-wider rounded-lg border-2 border-[#FFE14A] shadow-[0_4px_14px_rgba(255,215,0,0.35)] active:scale-[0.98] active:shadow-none transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed grayscale-[0.5]' : ''}`}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>

          {/* Messages */}
          {successMessage && (
            <div className="p-3 rounded-lg bg-green-900/40 border border-green-500 text-green-200 text-sm text-center">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-red-900/40 border border-red-500 text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-300 mt-4">
            Mới tham gia?{' '}
            <Link 
              to="/register" 
              className="font-bold text-[#FFD700] hover:text-[#FFA500] hover:underline ml-1"
              onClick={() => {
                const refCode = localStorage.getItem('refCode');
                if (refCode) {
                  navigate('/register', { state: { refCode } });
                }
              }}
            >
              Tạo tài khoản
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}