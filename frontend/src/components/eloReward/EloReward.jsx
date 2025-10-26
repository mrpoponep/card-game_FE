import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import './EloReward.css';
import { apiPost } from '../../api';

export default function EloReward({ isOpen, onClose }) {
  // Sử dụng custom hooks cho animation
  const { isClosing, isAnimating, handleClose, shouldRender } = useModalAnimation(isOpen, onClose, 290);
  
  // Lấy thông tin user hiện tại
  const { user, updateUser } = useAuth();
  
  // Xử lý phím ESC
  useEscapeKey(isOpen && !isClosing, handleClose, isAnimating);
  
  const [loading, setLoading] = useState(false);
  const [rewardData, setRewardData] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Helper: Render status badge theo trạng thái
  const renderStatusBadge = (status, gems) => {
    let cls = '';
    let icon = '';
    let text = '';

    if (status === 'claimed') {
      cls = 'status-claimed';
      icon = '✓';
      text = `${gems} 💎`;
    } else if (status === 'claimable') {
      cls = 'status-claimable';
      icon = '★';
      text = `${gems} 💎`;
    } else {
      cls = 'status-locked';
      icon = '🔒';
      text = `${gems} 💎`;
    }

    return (
      <span className={`status-badge ${cls}`}>
        <span className="status-icon">{icon}</span>
        <span className="status-text">{text}</span>
      </span>
    );
  };

  // Fetch reward data
  const fetchRewardData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError('');
      const response = await apiPost('/elo-reward/check');
      
      if (response.success) {
        setRewardData(response.data);
      } else {
        setError(response.message || 'Lỗi khi tải dữ liệu');
      }
    } catch (err) {
      console.error('Error fetching reward data:', err);
      setError('Không thể tải dữ liệu phần thưởng');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Claim một milestone
  const handleClaimOne = async (milestoneId) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const response = await apiPost('/elo-reward/claim', { milestoneId });
      
      if (response.success) {
        setSuccessMessage(response.message);
        // Cập nhật gems trong context
        if (updateUser) {
          updateUser({ gems: response.data.newGemsBalance });
        }
        // Refresh data (không hiển thị loading)
        await fetchRewardData(false);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error claiming reward:', err);
      setError(err.message || 'Lỗi khi nhận thưởng');
    } finally {
      setLoading(false);
    }
  };

  // Claim tất cả
  const handleClaimAll = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const response = await apiPost('/elo-reward/claim-all');
      
      if (response.success) {
        setSuccessMessage(response.message);
        // Cập nhật gems trong context
        if (updateUser && response.data.newGemsBalance) {
          updateUser({ gems: response.data.newGemsBalance });
        }
        // Refresh data (không hiển thị loading)
        await fetchRewardData(false);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error claiming all rewards:', err);
      setError(err.message || 'Lỗi khi nhận thưởng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRewardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Đóng popup khi click vào overlay
  const handleOverlayClick = useCallback((e) => {
    if (e.target.classList.contains('modal-overlay')) {
      handleClose();
    }
  }, [handleClose]);

  // Nếu không cần render thì return null
  if (!shouldRender) return null;

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`modal-container ${isClosing ? 'closing' : ''}`}>
        <button className="modal-close-btn" onClick={handleClose}>✕</button>
        
        <div className="modal-header">
          <h2>🏆 Phần Thưởng ELO Milestone</h2>
        </div>
        
        <div className="modal-content elo-reward-flex-content">
          {loading && !rewardData ? (
            <div className="loading">Đang tải...</div>
          ) : error && !rewardData ? (
            <div className="error-message">{error}</div>
          ) : rewardData ? (
            <>
              {/* Current ELO & Season Info */}
              <div className="elo-info-box">
                <div className="elo-info-item">
                  <span className="elo-label">ELO hiện tại:</span>
                  <span className="elo-value">{rewardData.currentElo}</span>
                </div>
                <div className="elo-info-item">
                  <span className="elo-label">Mùa:</span>
                  <span className="season-value">{rewardData.currentSeason.name}</span>
                </div>
              </div>

              {/* Error Messages */}
              {error && <div className="error-message">{error}</div>}

              {/* Milestones Table */}
              <div className="milestones-table-area">
                <table className="milestones-table">
                  <thead>
                    <tr>
                      <th>Mốc ELO</th>
                      <th>Mô tả</th>
                      <th>Phần thưởng</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewardData.milestones.map((milestone) => (
                      <tr 
                        key={milestone.milestone_id}
                        className={`milestone-row status-${milestone.status}`}
                      >
                        <td className="milestone-elo">{milestone.elo_required}</td>
                        <td className="milestone-desc">{milestone.description}</td>
                        <td className="milestone-gems">
                          {renderStatusBadge(milestone.status, milestone.gems_reward)}
                        </td>
                        <td className="milestone-action">
                          {milestone.status === 'claimable' ? (
                            <button 
                              className="btn-claim"
                              onClick={() => handleClaimOne(milestone.milestone_id)}
                              disabled={loading}
                            >
                              Nhận
                            </button>
                          ) : milestone.status === 'claimed' ? (
                            <span className="claimed-date">
                              {new Date(milestone.claimed_at).toLocaleDateString('vi-VN')}
                            </span>
                          ) : (
                            <span className="locked-text">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Claim All Button - Di chuyển xuống cuối */}
              {rewardData.summary.claimable > 0 && (
                <div className="claim-all-section">
                  <button 
                    className="btn-claim-all"
                    onClick={handleClaimAll}
                    disabled={loading}
                  >
                    💎 Nhận tất cả ({rewardData.summary.claimableGems} gems)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-data">Không có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  );
}
