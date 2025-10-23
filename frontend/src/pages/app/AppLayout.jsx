import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import { useError } from '../../hooks/ErrorContext';
import Ranking from '../../components/ranking/Ranking';
import PokerRules from '../../components/RuleScreen/PokerRules';
import DailyReward from '../../components/dailyReward/DailyReward';
import EloReward from '../../components/eloReward/EloReward';
import GiftReward from '../../components/giftReward/GiftReward';
import { apiPost } from '../../api';

export default function AppLayout() {
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [isRuleOpen, setIsRuleOpen] = useState(false);
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState(false);
  const [isEloRewardOpen, setIsEloRewardOpen] = useState(false);
  const [isGiftRewardOpen, setIsGiftRewardOpen] = useState(false);
  const { logout, user } = useAuth();
  const { showError } = useError();
  const navigate = useNavigate();

  // Auto-check daily reward khi vào app (chỉ chạy 1 lần khi mount)
  useEffect(() => {
    const checkDailyReward = async () => {
      try {
        const result = await apiPost('/daily-reward/check', {});
        if (result.success && result.data.canClaim) {
          // Nếu chưa nhận thưởng hôm nay, tự động mở modal
          setIsDailyRewardOpen(true);
        }
      } catch (error) {
        console.error('Error checking daily reward:', error);
      }
    };

    if (user) {
      checkDailyReward();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi component mount

  const handleOpenRanking = () => {
    // Kiểm tra đăng nhập trước khi mở modal
    if (!user) {
      showError('Vui lòng đăng nhập để xem bảng xếp hạng!', true);
      return;
    }
    if (!isRankingOpen) setIsRankingOpen(true);
  };
  
  const handleOpenRule = () => {
    if (!isRuleOpen) setIsRuleOpen(true);
  };

  const handleOpenDailyReward = () => {
    // Kiểm tra đăng nhập trước khi mở modal
    if (!user) {
      showError('Vui lòng đăng nhập để nhận thưởng!', true);
      return;
    }
    if (!isDailyRewardOpen) setIsDailyRewardOpen(true);
  };

  const handleOpenEloReward = () => {
    // Kiểm tra đăng nhập trước khi mở modal
    if (!user) {
      showError('Vui lòng đăng nhập để xem phần thưởng ELO!', true);
      return;
    }
    if (!isEloRewardOpen) setIsEloRewardOpen(true);
  };

  const handleOpenGiftReward = () => {
    // Kiểm tra đăng nhập trước khi mở modal
    if (!user) {
      showError('Vui lòng đăng nhập để xem quà tặng!', true);
      return;
    }
    if (!isGiftRewardOpen) setIsGiftRewardOpen(true);
  };

  return (
    <div>
      <nav style={{ padding: 12, borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link to="/">Home</Link>
          <span style={{ margin: '0 8px' }}>|</span>
          <button 
            onClick={handleOpenRanking}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: isRankingOpen ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              fontSize: '16px',
              padding: 0
            }}
          >
            Ranking
          </button>
          <span style={{ margin: '0 8px' }}>|</span>
          <button 
            onClick={handleOpenDailyReward}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: isDailyRewardOpen ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              fontSize: '16px',
              padding: 0
            }}
          >
            🎁 Nhận Thưởng
          </button>
          <span style={{ margin: '0 8px' }}>|</span>
          <button 
            onClick={handleOpenEloReward}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: isEloRewardOpen ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              fontSize: '16px',
              padding: 0
            }}
          >
            🏆 ELO Rewards
          </button>
          <span style={{ margin: '0 8px' }}>|</span>
          <button 
            onClick={handleOpenGiftReward}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: isGiftRewardOpen ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              fontSize: '16px',
              padding: 0
            }}
          >
            🎁 Quà Tặng
          </button>
          <span style={{ margin: '0 8px' }}>|</span>
          <Link to="/room">Room</Link>
          <span style={{ margin: '0 8px' }}>|</span>
          <button 
            onClick={handleOpenRule}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: isRuleOpen ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              fontSize: '16px',
              padding: 0
            }}
          >
            View Rule Screen Example
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && <span style={{ fontSize: '14px', color: '#666' }}>👤 {user.username}</span>}
          <button 
            onClick={logout}
            style={{ 
              background: '#dc3545', 
              color: 'white',
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '6px 12px',
              fontWeight: '500'
            }}
          >
            Đăng xuất
          </button>
        </div>
      </nav>

      <div style={{ padding: 16 }}>
        <Outlet />
      </div>

      <Ranking isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} />
      <PokerRules isOpen={isRuleOpen} onClose={() => setIsRuleOpen(false)} />
      <DailyReward isOpen={isDailyRewardOpen} onClose={() => setIsDailyRewardOpen(false)} />
      <EloReward isOpen={isEloRewardOpen} onClose={() => setIsEloRewardOpen(false)} />
      <GiftReward isOpen={isGiftRewardOpen} onClose={() => setIsGiftRewardOpen(false)} />
    </div>
  );
}
