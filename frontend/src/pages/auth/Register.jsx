import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { apiPost } from '../../api';
// Không cần import './Register.css';

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
      const params = new URLSearchParams(window.location.search);
      let refCode = params.get('ref');
      if (!refCode) {
        refCode = localStorage.getItem('refCode') || undefined;
      }
      const data = await apiPost('/auth/register', {
        username: formData.username,
        password: formData.password,
        refCode 
      });

      if (data.success) {
        navigate('/login', {
          replace: true,
          state: {
            message: 'Đăng ký thành công! Vui lòng đăng nhập để nhận thưởng.',
            refCode
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
    // Container: Dark Red/Black Gradient Background
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0000] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3d0000] via-[#1a0000] to-black z-0"></div>

      {/* Register Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#8b1a1a]/95 to-[#5e0b0b]/95 border-[3px] border-[#FFD700] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md text-white z-10 overflow-hidden">
        
        {/* Header */}
        <div className="text-center py-8 px-6 border-b border-[#FFD700]/30 bg-black/20">
          <h1 className="text-3xl font-bold text-[#FFD700] mb-2 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] uppercase">
             Đăng Ký Tài Khoản
          </h1>
          <p className="text-sm text-gray-200">Tạo tài khoản mới để bắt đầu chơi</p>
        </div>

        <form className="p-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 rounded-lg bg-red-900/40 border border-red-500 text-red-200 text-sm text-center animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-bold text-[#FFD700] uppercase tracking-wider drop-shadow-sm">
              Tên đăng nhập
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập (tối thiểu 3 ký tự)"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border-2 border-[#FFD700]/30 text-white placeholder-white/40 focus:border-[#FFD700] focus:bg-black/60 focus:outline-none transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-bold text-[#FFD700] uppercase tracking-wider drop-shadow-sm">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border-2 border-[#FFD700]/30 text-white placeholder-white/40 focus:border-[#FFD700] focus:bg-black/60 focus:outline-none transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#FFD700] uppercase tracking-wider drop-shadow-sm">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border-2 border-[#FFD700]/30 text-white placeholder-white/40 focus:border-[#FFD700] focus:bg-black/60 focus:outline-none transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 mt-4 bg-gradient-to-br from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD700] text-[#4a2500] font-bold text-base uppercase tracking-wider rounded-lg border-2 border-[#FFE14A] shadow-[0_4px_14px_rgba(255,215,0,0.35)] active:scale-[0.98] active:shadow-none transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed grayscale-[0.5]' : ''}`}
          >
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>

          <div className="text-center pt-4 border-t border-[#FFD700]/20">
            <p className="text-sm text-gray-300">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-bold text-[#FFD700] hover:text-[#FFA500] hover:underline ml-1">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;