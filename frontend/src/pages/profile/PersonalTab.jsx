import React from 'react';
import { useAuth } from '../../context/AuthContext';

const PersonalTab = () => {
  const { user } = useAuth();

  const infoRow1 = [
    { label: 'Email', value: user?.email || 'Chưa liên kết', icon: '📧', hasButton: true },
  ];

  const infoRow2 = [
    { label: 'ELO hiện tại', value: user?.elo || 0, icon: '🏆' },
    { label: 'Số dư Coin', value: user?.balance?.toLocaleString() || '0', icon: '🪙' },
    { label: 'Số dư Gems', value: user?.gems?.toLocaleString() || '0', icon: '💎' },
  ];

  const handleLinkEmail = () => {
    // TODO: Implement email linking functionality
    alert('Chức năng liên kết email sẽ được cập nhật sau');
  };

  return (
    <div className="personal-tab">
      {/* User Info Banner */}
      <div className="profile-banner">
        <div className="profile-avatar-section">
          <div className="profile-avatar-container">
            <img 
              src={`${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/avatar/${user?.userId}`}
              alt="Avatar"
              className="profile-avatar"
            />
            <div className="profile-user-id">
              <span className="user-id-label">🆔 ID:</span>
              <span className="user-id-value">{user?.userId || 'N/A'}</span>
            </div>
          </div>
          <div className="profile-user-info">
            <h2 className="profile-username">{user?.username || 'User'}</h2>
            <div className="profile-info-rows">
              <div className="profile-info-row">
                {infoRow1.map((item, index) => (
                  <div key={index} className="profile-info-item">
                    <span className="info-icon">{item.icon}</span>
                    <div className="info-content">
                      <span className="info-label">{item.label}</span>
                      <span className="info-value">{item.value}</span>
                    </div>
                    {item.hasButton && (
                      <button className="link-btn" onClick={handleLinkEmail}>
                        🔗 Liên kết
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="profile-info-row">
                {infoRow2.map((item, index) => (
                  <div key={index} className="profile-info-item">
                    <span className="info-icon">{item.icon}</span>
                    <div className="info-content">
                      <span className="info-label">{item.label}</span>
                      <span className="info-value">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="banner-stats-section">
          <h3 className="banner-section-title">📊 Thống Kê Tổng Quan</h3>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-card-icon">🎮</div>
              <div className="stat-card-value">0</div>
              <div className="stat-card-label">Tổng số ván</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">✅</div>
              <div className="stat-card-value">0</div>
              <div className="stat-card-label">Số ván thắng</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">❌</div>
              <div className="stat-card-value">0</div>
              <div className="stat-card-label">Số ván thua</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">📊</div>
              <div className="stat-card-value">0%</div>
              <div className="stat-card-label">Tỷ lệ thắng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalTab;
