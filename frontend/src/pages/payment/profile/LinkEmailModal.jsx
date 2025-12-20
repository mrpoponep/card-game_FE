import React, { useEffect, useState } from 'react';
import { apiPost } from '../../api';

function LinkEmailModal({ userId, username, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!userId) return null;

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose && onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSendOTP = async (e) => {
    e && e.preventDefault();
    setError('');
    if (!email) return setError('Vui lòng nhập email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError('Email không hợp lệ');
    setLoading(true);
    try {
      const data = await apiPost('/auth/send-email-verification-otp', {
        userId,
        email
      });
      if (data.success) setStep(2);
      else setError(data.message || 'Gửi mã xác thực thất bại');
    } catch (err) {
      setError(err.message || 'Gửi mã xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e && e.preventDefault();
    setError('');
    if (!otp) return setError('Vui lòng nhập mã xác thực');
    if (!/^\d{6}$/.test(otp)) return setError('Mã xác thực phải là 6 chữ số');
    setLoading(true);
    try {
      const data = await apiPost('/auth/verify-email-otp', {
        userId,
        otp
      });
      if (data.success) {
        // Prefer server-provided updated email/user; fallback to entered email
        const newEmail = data?.user?.email || data?.email || email;
        onSuccess && onSuccess({ email: newEmail, user: data?.user });
        onClose && onClose();
      } else {
        setError(data.message || 'Xác thực thất bại');
      }
    } catch (err) {
      setError(err.message || 'Xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={() => onClose && onClose()} />

      <div className="relative w-full max-w-md bg-gradient-to-br from-[#8b1a1a]/95 to-[#5e0b0b]/95 border-[3px] border-[#FFD700] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md text-white z-10 overflow-hidden">
        <button
          onClick={() => onClose && onClose()}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white"
        >
          ✕
        </button>
        <div className="text-center py-6 px-6 border-b border-[#FFD700]/30 bg-black/20">
          <h1 className="text-3xl font-bold text-[#FFD700] mb-2 uppercase">Liên Kết Email</h1>
          <p className="text-sm text-gray-200">Xin chào <strong className="text-[#FFD700]">{username}</strong>!</p>
        </div>

        {step === 1 ? (
          <form className="p-8 space-y-6" onSubmit={handleSendOTP}>
            {error && <div className="p-3 rounded-lg bg-red-900/40 border border-red-500 text-red-200 text-sm text-center">{error}</div>}

            <div className="bg-black/30 border border-[#FFD700]/20 rounded-lg p-4 text-sm text-gray-300 space-y-2">
              <p className="text-[#FFD700] font-bold">💡 Tại sao cần liên kết email?</p>
              <ul className="list-disc list-inside space-y-1 opacity-90">
                <li>Khôi phục tài khoản khi quên mật khẩu.</li>
                <li>Một email có thể liên kết tối đa 5 tài khoản.</li>
              </ul>
            </div>

            <div className="text-sm text-yellow-300 bg-yellow-900/10 border border-yellow-700/20 rounded-md p-2 mt-2">
              Lưu ý: Nếu liên kết email mới, email cũ sẽ bị hủy liên kết.
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#FFD700]">Địa chỉ Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Nhập địa chỉ email của bạn"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-black/40 border-2 border-[#FFD700]/30 text-white placeholder-white/40 focus:border-[#FFD700] focus:bg-black/60 focus:outline-none transition-all duration-300"
              />
            </div>

            <div className="space-y-3 pt-2">
              <button type="submit" disabled={loading} className={`w-full py-3 px-4 bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-[#4a2500] font-bold rounded-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {loading ? 'Đang gửi...' : 'Gửi Mã Xác Thực'}
              </button>

              <button type="button" onClick={() => onClose && onClose()} className="w-full py-3 px-4 bg-transparent border-2 border-[#FFD700]/40 text-[#FFD700] font-bold rounded-lg">
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <form className="p-8 space-y-6" onSubmit={handleVerifyOTP}>
            {error && <div className="p-3 rounded-lg bg-red-900/40 border border-red-500 text-red-200 text-sm text-center">{error}</div>}

            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 text-sm text-green-200 text-center">
              <p>Mã xác thực đã gửi đến: <strong className="text-white">{email}</strong></p>
              <p className="text-xs mt-1 opacity-80">Vui lòng kiểm tra hộp thư đến (hoặc thư rác).</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#FFD700]">Mã Xác Thực (6 chữ số)</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                placeholder="000000"
                disabled={loading}
                maxLength="6"
                className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-bold rounded-lg bg-black/40 border-2 border-[#FFD700]/30 text-[#FFD700]"
              />
            </div>

            <div className="space-y-3 pt-2">
              <button type="submit" disabled={loading} className={`w-full py-3 px-4 bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-[#4a2500] font-bold rounded-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {loading ? 'Đang xác thực...' : 'Xác Thực'}
              </button>

              <button type="button" onClick={() => setStep(1)} disabled={loading} className="w-full py-3 px-4 bg-transparent border-2 border-[#FFD700]/40 text-[#FFD700] font-bold rounded-lg">
                Quay Lại
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LinkEmailModal;
