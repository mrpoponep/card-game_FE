import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiPost } from '../../api';
// Không cần import './ResetPassword.css';

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
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0000] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3d0000] via-[#1a0000] to-black z-0"></div>
        <div className="relative w-full max-w-md bg-gradient-to-br from-[#8b1a1a]/95 to-[#5e0b0b]/95 border-[3px] border-[#FFD700] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md text-white z-10 overflow-hidden text-center p-8">
          <h1 className="text-3xl font-bold text-[#FFD700] mb-4 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] uppercase">
            ✅ Thành công!
          </h1>
          <div className="space-y-2 text-green-200">
            <p>Mật khẩu của bạn đã được cập nhật thành công.</p>
            <p className="text-sm opacity-80 animate-pulse">Đang chuyển đến trang đăng nhập...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0000] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3d0000] via-[#1a0000] to-black z-0"></div>

      <div className="relative w-full max-w-md bg-gradient-to-br from-[#8b1a1a]/95 to-[#5e0b0b]/95 border-[3px] border-[#FFD700] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md text-white z-10 overflow-hidden">
        
        {/* Header */}
        <div className="text-center py-6 px-6 border-b border-[#FFD700]/30 bg-black/20">
          <h1 className="text-3xl font-bold text-[#FFD700] mb-2 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] uppercase">
            Đặt lại mật khẩu
          </h1>
          <p className="text-sm text-gray-200">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-bold text-[#FFD700] uppercase tracking-wider drop-shadow-sm">Mật khẩu mới</label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
                autoFocus
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

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#FFD700] uppercase tracking-wider drop-shadow-sm">Xác nhận mật khẩu</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border-2 border-[#FFD700]/30 text-white placeholder-white/40 focus:border-[#FFD700] focus:bg-black/60 focus:outline-none transition-all duration-300"
            />
          </div>

          <button type="submit" disabled={loading} className={`w-full py-3 px-4 bg-gradient-to-br from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD700] text-[#4a2500] font-bold text-base uppercase tracking-wider rounded-lg border-2 border-[#FFE14A] shadow-[0_4px_14px_rgba(255,215,0,0.35)] active:scale-[0.98] transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed grayscale-[0.5]' : ''}`}>
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>

          {error && <div className="p-3 rounded-lg bg-red-900/40 border border-red-500 text-red-200 text-sm text-center animate-pulse">{error}</div>}
        </form>
      </div>
    </div>
  );
}