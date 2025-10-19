import React, { useEffect, useState, useCallback } from 'react';
import { apiPost, apiGet } from '../../api';
import { useAuth } from '../../hooks/AuthContext';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import './DailyReward.css';

export default function DailyReward({ isOpen, onClose }) {
  const { isClosing, isAnimating, handleClose, shouldRender } = useModalAnimation(isOpen, onClose, 290);
  useEscapeKey(isOpen && !isClosing, handleClose, isAnimating);

  const { user, updateBalance } = useAuth();
  const [monthlyRewards, setMonthlyRewards] = useState([]);
  const [claimStatus, setClaimStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimedDays, setClaimedDays] = useState(new Set());

  // Lấy ngày hiện tại
  const today = new Date().getDate();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Fetch dữ liệu khi mở modal
  useEffect(() => {
    if (isOpen && user) {
      fetchData();
    }
  }, [isOpen, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách phần thưởng cả tháng
      const rewardsData = await apiGet('/daily-reward/monthly');
      if (rewardsData.success) {
        setMonthlyRewards(rewardsData.data);
      }

      // Kiểm tra trạng thái nhận thưởng
      const statusData = await apiPost('/daily-reward/check', {});
      if (statusData.success) {
        setClaimStatus(statusData.data);
      }

      // Lấy lịch sử nhận thưởng trong tháng
      const historyData = await apiGet('/daily-reward/history');
      if (historyData.success) {
        const claimed = new Set();
        historyData.data.forEach(record => {
          if (record.month === currentMonth && record.year === currentYear) {
            claimed.add(record.day_of_month);
          }
        });
        setClaimedDays(claimed);
      }
    } catch (error) {
      console.error('Error fetching daily reward data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!claimStatus?.canClaim || claiming) return;

    setClaiming(true);
    try {
      const result = await apiPost('/daily-reward/claim', {});
      if (result.success) {
        // Cập nhật số dư
        if (updateBalance) {
          updateBalance(result.data.balance);
        }

        // Cập nhật trạng thái
        setClaimStatus({
          ...claimStatus,
          canClaim: false,
          alreadyClaimed: true
        });

        // Thêm ngày hôm nay vào danh sách đã nhận
        setClaimedDays(prev => new Set([...prev, today]));

        // Animation success
        const claimButton = document.querySelector('.claim-button');
        if (claimButton) {
          claimButton.classList.add('claim-success-animation');
          setTimeout(() => {
            claimButton.classList.remove('claim-success-animation');
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setClaiming(false);
    }
  };

  const handleOverlayClick = useCallback((e) => {
    if (e.target.classList.contains('modal-overlay')) {
      handleClose();
    }
  }, [handleClose]);

  if (!shouldRender) return null;

  // Xác định ngày đặc biệt (phần thưởng cao)
  const isSpecialDay = (day) => {
    const reward = monthlyRewards.find(r => r.day_of_month === day);
    return reward && reward.reward_amount >= 300;
  };

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`modal-container ${isClosing ? 'closing' : ''}`}>
        <button className="modal-close-btn" onClick={handleClose}>✕</button>
        
        <div className="modal-header">
          <div className="daily-reward-header">
            <h2 className="daily-reward-title">🎁 Phần Thưởng Hằng Ngày</h2>
            <p className="daily-reward-subtitle">Đăng nhập mỗi ngày để nhận xu miễn phí!</p>
          </div>
        </div>
        
        <div className="modal-content daily-reward-content">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <>
              {/* Phần nhận thưởng */}
              {claimStatus && (
                <>
                  {claimStatus.canClaim ? (
                    <div className="claim-section">
                      <div className="claim-info">
                        <div className="claim-day">Ngày {today}</div>
                        <div className="claim-reward">
                          <span className="coin-icon">🪙</span>
                          <span>{claimStatus.reward} xu</span>
                        </div>
                      </div>
                      <button 
                        className="claim-button"
                        onClick={handleClaim}
                        disabled={claiming}
                      >
                        {claiming ? 'Đang nhận...' : '✨ Nhận Thưởng'}
                      </button>
                    </div>
                  ) : (
                    <div className="already-claimed">
                      <div className="already-claimed-icon">✅</div>
                      <div className="already-claimed-text">Bạn đã nhận thưởng hôm nay!</div>
                      <div className="already-claimed-hint">Quay lại vào ngày mai nhé 😊</div>
                    </div>
                  )}
                </>
              )}

              {/* Lịch phần thưởng tháng */}
              <div className="reward-calendar">
                {monthlyRewards.map(reward => {
                  const day = reward.day_of_month;
                  const isClaimed = claimedDays.has(day);
                  const isToday = day === today;
                  const isSpecial = isSpecialDay(day);

                  return (
                    <div 
                      key={day}
                      className={`reward-day 
                        ${isClaimed ? 'claimed' : ''} 
                        ${isToday ? 'today' : ''}
                        ${isSpecial ? 'special' : ''}
                      `}
                    >
                      <div className="day-number">{day}</div>
                      <div className="reward-amount">
                        <span className="reward-icon">🪙</span>
                        {reward.reward_amount}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Thống kê */}
              <div className="reward-stats">
                <div className="stat-item">
                  <div className="stat-label">Đã nhận trong tháng</div>
                  <div className="stat-value">{claimedDays.size}/{monthlyRewards.length}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Tổng xu đã nhận</div>
                  <div className="stat-value">
                    {monthlyRewards
                      .filter(r => claimedDays.has(r.day_of_month))
                      .reduce((sum, r) => sum + r.reward_amount, 0)
                    }
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
