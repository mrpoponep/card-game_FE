import React, { useEffect, useState, useCallback } from 'react';
import { apiPost } from '../../api';
import { useAuth } from '../../hooks/AuthContext';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import './GiftReward.css';

export default function GiftReward({ isOpen, onClose }) {
  const { isClosing, isAnimating, handleClose, shouldRender } = useModalAnimation(isOpen, onClose, 290);
  useEscapeKey(isOpen && !isClosing, handleClose, isAnimating);

  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [weeklyStatus, setWeeklyStatus] = useState(null);
  const [monthlyStatus, setMonthlyStatus] = useState(null);
  const [claiming, setClaiming] = useState({ weekly: false, monthly: false });

  // Fetch trạng thái khi mở modal
  useEffect(() => {
    if (isOpen && user) {
      fetchGiftStatus();
    }
  }, [isOpen, user]);

  const fetchGiftStatus = async () => {
    setLoading(true);
    try {
      // Gọi API check weekly và monthly
      const [weeklyResponse, monthlyResponse] = await Promise.all([
        apiPost('/weekly-reward/check', {}),
        apiPost('/monthly-reward/check', {})
      ]);

      // Xử lý weekly status
      if (weeklyResponse.success && weeklyResponse.data) {
        const weekly = weeklyResponse.data;
        setWeeklyStatus({
          canClaim: weekly.canClaim,
          reward: weekly.reward,
          tierName: weekly.tierName,
          currentElo: weekly.currentElo || user?.elo || 0,
          alreadyClaimed: weekly.alreadyClaimed || false,
          message: weekly.message
        });
      } else {
        setWeeklyStatus({
          canClaim: false,
          reward: 0,
          tierName: 'N/A',
          currentElo: user?.elo || 0,
          alreadyClaimed: true,
          message: 'Không thể kiểm tra thưởng tuần'
        });
      }

      // Xử lý monthly status
      if (monthlyResponse.success && monthlyResponse.data) {
        const monthly = monthlyResponse.data;
        setMonthlyStatus({
          canClaim: monthly.canClaim,
          reward: monthly.reward,
          rank: monthly.rank,
          currentElo: monthly.currentElo || user?.elo || 0,
          alreadyClaimed: monthly.alreadyClaimed || false,
          message: monthly.message
        });
      } else {
        setMonthlyStatus({
          canClaim: false,
          reward: 0,
          rank: null,
          currentElo: user?.elo || 0,
          alreadyClaimed: true,
          message: 'Không thể kiểm tra thưởng tháng'
        });
      }
    } catch (err) {
      console.error('Error fetching gift status:', err);
      
      // Set default values khi có lỗi
      setWeeklyStatus({
        canClaim: false,
        reward: 0,
        tierName: 'N/A',
        currentElo: user?.elo || 0,
        alreadyClaimed: true
      });
      setMonthlyStatus({
        canClaim: false,
        reward: 0,
        rank: null,
        currentElo: user?.elo || 0,
        alreadyClaimed: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimWeekly = async () => {
    if (!weeklyStatus?.canClaim || claiming.weekly) return;

    setClaiming(prev => ({ ...prev, weekly: true }));

    try {
      const result = await apiPost('/weekly-reward/claim', {});
      if (result.success) {
        // Cập nhật gems
        if (updateUser && result.data.gems !== undefined) {
          updateUser({ gems: result.data.gems });
        }

        // Cập nhật trạng thái - Đặt canClaim = false
        setWeeklyStatus(prev => ({
          ...prev,
          canClaim: false,
          alreadyClaimed: true
        }));
      }
    } catch (err) {
      console.error('Error claiming weekly reward:', err);
    } finally {
      setClaiming(prev => ({ ...prev, weekly: false }));
    }
  };

  const handleClaimMonthly = async () => {
    if (!monthlyStatus?.canClaim || claiming.monthly) return;

    setClaiming(prev => ({ ...prev, monthly: true }));

    try {
      const result = await apiPost('/monthly-reward/claim', {});
      if (result.success) {
        // Cập nhật gems
        if (updateUser && result.data.gems !== undefined) {
          updateUser({ gems: result.data.gems });
        }

        // Cập nhật trạng thái - Đặt canClaim = false
        setMonthlyStatus(prev => ({
          ...prev,
          canClaim: false,
          alreadyClaimed: true
        }));
      }
    } catch (err) {
      console.error('Error claiming monthly reward:', err);
    } finally {
      setClaiming(prev => ({ ...prev, monthly: false }));
    }
  };

  const handleOverlayClick = useCallback((e) => {
    if (e.target.classList.contains('modal-overlay')) {
      handleClose();
    }
  }, [handleClose]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`modal-container gift-reward-modal ${isClosing ? 'closing' : ''}`}>
        <button className="modal-close-btn" onClick={handleClose}>✕</button>
        
        <div className="modal-header">
          <h2 className="gift-reward-title">🎁 Quà Tặng</h2>
        </div>
        
        <div className="modal-content gift-reward-content">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <>
              {/* Gift Cards Grid */}
              <div className="gift-cards-grid">
                {/* Weekly Reward Card */}
                <div className="gift-card weekly-card">
                  <div className="gift-card-header">
                    <div className="gift-icon">📅</div>
                    <h3 className="gift-card-title">Thưởng Tuần</h3>
                  </div>

                  <div className="gift-card-body">
                    <div className="gift-info">
                      <div className="gift-tier">{weeklyStatus?.tierName || 'N/A'}</div>
                      <div className="gift-elo">ELO: {weeklyStatus?.currentElo?.toLocaleString() || 0}</div>
                    </div>
                    <div className="gift-reward">
                      <span className="gems-icon">💎</span>
                      <span className="gems-amount">{weeklyStatus?.reward?.toLocaleString() || 0}</span>
                    </div>
                    <button 
                      className={`gift-claim-button weekly-button ${weeklyStatus?.canClaim ? '' : 'claimed'}`}
                      onClick={handleClaimWeekly}
                      disabled={!weeklyStatus?.canClaim || claiming.weekly}
                    >
                      {claiming.weekly ? 'Đang nhận...' : weeklyStatus?.canClaim ? '✨ Nhận Thưởng' : '✅ Đã Nhận'}
                    </button>
                  </div>

                  <div className="gift-card-footer">
                    <div className="gift-description">
                      Nhận mỗi tuần dựa trên ELO hiện tại
                    </div>
                  </div>
                </div>

                {/* Monthly Reward Card */}
                <div className="gift-card monthly-card">
                  <div className="gift-card-header">
                    <div className="gift-icon">🏆</div>
                    <h3 className="gift-card-title">Thưởng Tháng</h3>
                  </div>

                  <div className="gift-card-body">
                    <div className="gift-info">
                      <div className="gift-rank">Hạng {monthlyStatus?.rank || 'N/A'}</div>
                      <div className="gift-elo">ELO: {monthlyStatus?.currentElo?.toLocaleString() || 0}</div>
                    </div>
                    <div className="gift-reward">
                      <span className="gems-icon">💎</span>
                      <span className="gems-amount">{monthlyStatus?.reward?.toLocaleString() || 0}</span>
                    </div>
                    <button 
                      className={`gift-claim-button monthly-button ${monthlyStatus?.canClaim ? '' : 'claimed'}`}
                      onClick={handleClaimMonthly}
                      disabled={!monthlyStatus?.canClaim || claiming.monthly}
                    >
                      {claiming.monthly ? 'Đang nhận...' : monthlyStatus?.canClaim ? '✨ Nhận Thưởng' : '✅ Đã Nhận'}
                    </button>
                  </div>

                  <div className="gift-card-footer">
                    <div className="gift-description">
                      Chỉ dành cho Top 100 (dựa trên Rank)
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
