import React, { useState, useEffect } from 'react';
import { apiGet } from '../../api';

const RewardHistoryTab = () => {
  const [rewardType, setRewardType] = useState('all'); // all, daily, elo, weekly, monthly, lucky_wheel
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRewardHistory();
  }, [rewardType]);

  const fetchRewardHistory = async () => {
    setLoading(true);
    try {
      // Fetch different reward types based on selection
      if (rewardType === 'all') {
        // Fetch all reward types
        const [dailyRes, eloRes, weeklyRes, monthlyRes, wheelRes] = await Promise.all([
          apiGet('/daily-reward/history').catch(() => ({ success: false, data: [] })),
          apiGet('/elo-reward/history').catch(() => ({ success: false, data: [] })),
          apiGet('/weekly-reward/history').catch(() => ({ success: false, data: [] })),
          apiGet('/monthly-reward/history').catch(() => ({ success: false, data: [] })),
          apiGet('/lucky-wheel/history?limit=100').catch(() => ({ success: false, data: [] }))
        ]);

        const allRewards = [
          ...(dailyRes.data || []).map(r => ({ ...r, type: 'daily' })),
          ...(eloRes.data || []).map(r => ({ ...r, type: 'elo' })),
          ...(weeklyRes.data || []).map(r => ({ ...r, type: 'weekly' })),
          ...(monthlyRes.data || []).map(r => ({ ...r, type: 'monthly' })),
          ...(wheelRes.data || []).map(r => ({ ...r, type: 'lucky_wheel' }))
        ];

        // Sort by date
        allRewards.sort((a, b) => new Date(b.claimed_at || b.spin_time) - new Date(a.claimed_at || a.spin_time));
        setRewards(allRewards);
      } else {
        // Fetch specific reward type
        let endpoint = '';
        if (rewardType === 'daily') endpoint = '/daily-reward/history';
        else if (rewardType === 'elo') endpoint = '/elo-reward/history';
        else if (rewardType === 'weekly') endpoint = '/weekly-reward/history';
        else if (rewardType === 'monthly') endpoint = '/monthly-reward/history';
        else if (rewardType === 'lucky_wheel') endpoint = '/lucky-wheel/history?limit=100';

        const response = await apiGet(endpoint);
        if (response.success) {
          setRewards((response.data || []).map(r => ({ ...r, type: rewardType })));
        }
      }
    } catch (error) {
      console.error('Error fetching reward history:', error);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRewardTypeInfo = (type) => {
    const types = {
      daily: { icon: '📅', label: 'Thưởng ngày', color: '#4ECDC4' },
      elo: { icon: '🏆', label: 'Thưởng ELO', color: '#FFD700' },
      weekly: { icon: '📅', label: 'Thưởng tuần', color: '#45B7D1' },
      monthly: { icon: '📆', label: 'Thưởng tháng', color: '#96CEB4' },
      lucky_wheel: { icon: '🎰', label: 'Vòng quay', color: '#FF6B6B' }
    };
    return types[type] || { icon: '🎁', label: 'Phần thưởng', color: '#DFE6E9' };
  };

  const rewardTypes = [
    { id: 'all', label: 'Tất cả', icon: '🎁' },
    { id: 'daily', label: 'Thưởng ngày', icon: '📅' },
    { id: 'elo', label: 'Thưởng ELO', icon: '🏆' },
    { id: 'weekly', label: 'Thưởng tuần', icon: '📅' },
    { id: 'monthly', label: 'Thưởng tháng', icon: '📆' },
    { id: 'lucky_wheel', label: 'Vòng quay', icon: '🎰' }
  ];

  return (
    <div className="reward-history-tab">
      <div className="tab-header">
        <h3 className="section-title">Lịch Sử Nhận Thưởng</h3>
      </div>

      {/* Reward Type Filter */}
      <div className="reward-type-filter">
        {rewardTypes.map(type => (
          <button
            key={type.id}
            className={`reward-type-btn ${rewardType === type.id ? 'active' : ''}`}
            onClick={() => setRewardType(type.id)}
          >
            <span className="type-icon">{type.icon}</span>
            <span className="type-label">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Rewards List */}
      <div className="rewards-container">
        {loading ? (
          <div className="loading-state">Đang tải...</div>
        ) : rewards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎁</div>
            <p className="empty-text">Chưa có lịch sử nhận thưởng</p>
            <p className="empty-hint">Hãy tham gia các hoạt động để nhận thưởng!</p>
          </div>
        ) : (
          <div className="rewards-list">
            {rewards.map((reward, index) => {
              const typeInfo = getRewardTypeInfo(reward.type);
              const date = formatDate(reward.claimed_at || reward.spin_time);
              
              // Determine reward amount and currency
              let rewardAmount = 0;
              let currency = '';
              
              if (reward.type === 'daily') {
                rewardAmount = reward.reward_amount;
                currency = 'Coin';
              } else if (reward.type === 'elo') {
                rewardAmount = reward.gems_reward;
                currency = 'Gems';
              } else if (reward.type === 'weekly' || reward.type === 'monthly') {
                rewardAmount = reward.gems_reward;
                currency = 'Gems';
              } else if (reward.type === 'lucky_wheel') {
                rewardAmount = reward.total_win;
                currency = 'Coin';
              }

              return (
                <div key={index} className={`reward-card ${currency === 'Coin' ? 'coin' : currency === 'Gems' ? 'gem' : ''}`} style={{ borderLeftColor: typeInfo.color }}>
                  <div className="reward-header">
                    <div className="reward-type-badge" style={{ backgroundColor: typeInfo.color }}>
                      <span className="reward-type-icon">{typeInfo.icon}</span>
                      <span className="reward-type-text">{typeInfo.label}</span>
                    </div>
                    <span className="reward-date">{date}</span>
                  </div>
                  
                  <div className="reward-details">
                    <div className="reward-amount">
                      <span className="amount-value">+{rewardAmount?.toLocaleString() || 0}</span>
                      <span className="amount-currency">{currency}</span>
                    </div>
                    
                    {reward.type === 'daily' && (
                      <div className="reward-extra-info">
                        Ngày đăng nhập thứ {reward.login_day_count}
                      </div>
                    )}
                    
                    {reward.type === 'elo' && (
                      <div className="reward-extra-info">
                        Đạt mốc ELO: {reward.elo_required}
                      </div>
                    )}
                    
                    {reward.type === 'weekly' && (
                      <div className="reward-extra-info">
                        Hạng {reward.rank} - Tuần {reward.week_number}/{reward.year}
                      </div>
                    )}
                    
                    {reward.type === 'monthly' && (
                      <div className="reward-extra-info">
                        Hạng {reward.rank} - Tháng {reward.month}/{reward.year}
                        {reward.title && <span className="reward-title"> ({reward.title})</span>}
                      </div>
                    )}
                    
                    {reward.type === 'lucky_wheel' && (
                      <div className="reward-extra-info">
                        Quay x{reward.multiplier} - Tiêu {reward.gems_spent} Gems
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardHistoryTab;
