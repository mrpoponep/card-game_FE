import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LinkEmailModal from './LinkEmailModal';

const PersonalTab = () => {
  const { user, updateUser } = useAuth();

  const infoRow1 = [
    { label: 'Email', value: user?.email || 'Chưa liên kết', icon: '📧', hasButton: true },
  ];

  const infoRow2 = [
    { label: 'ELO hiện tại', value: user?.elo || 0, icon: '🏆' },
    { label: 'Số dư Coin', value: user?.balance?.toLocaleString() || '0', icon: '🪙' },
    { label: 'Số dư Gems', value: user?.gems?.toLocaleString() || '0', icon: '💎' },
  ];
  const handleLinkEmail = () => {
    setShowLinkModal(true);
  };

  const [showLinkModal, setShowLinkModal] = useState(false);

  const handleCloseModal = () => {
    setShowLinkModal(false);
  };

  const handleLinkedSuccess = (payload) => {
    // Update user in-place without reloading the page
    const newEmail = payload?.email || payload?.user?.email;
    if (newEmail && updateUser) {
      updateUser({ email: newEmail });
    }
    
  };

  return (
    <div className="personal-tab">
      {/* User Info Banner */}
      <div className="profile-banner">
        <div className="profile-avatar-section">
          <div className="profile-avatar-container">
            <img 
              src={`${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/avatar/${user?.userId}${user?.avatarVersion ? '?t=' + user.avatarVersion : ''}`}
              // Lếu không load được ảnh thì hiển thị ảnh mặc định tại import.meta.env.VITE_SERVER_URL + '/avatar/default.png'
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/avatar/default.png`;
              }}
              alt="Avatar"
              className="profile-avatar"
              style={{ cursor: 'pointer' }}
              onClick={
                () => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = 'image/*';
                  fileInput.onchange = async (event) => {
                    const file = event.target.files[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('avatar', file);
                      try {
                        const token = sessionStorage.getItem('access_token');
                        const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'}/user/upload-avatar`, {
                          method: 'POST',
                          body: formData,
                          credentials: 'include',
                          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
                        });
                        const data = await response.json();
                        if (response.ok) {
                          // Update auth user so other pages use cache-busted URL
                          try {
                            if (updateUser) updateUser({ avatarVersion: Date.now() });
                          } catch (e) {}
                          // Also update the local img immediately as a fallback
                          const avatarImg = document.querySelector('.profile-avatar');
                          if (avatarImg) {
                            const oldSrc = avatarImg.src.split('?')[0];
                            avatarImg.src = oldSrc + '?t=' + Date.now();
                          }
                        } else {
                          alert(data.message || 'Lỗi upload ảnh');
                        }
                      } catch (error) {
                        alert('Lỗi upload ảnh');
                        console.error('Error uploading avatar:', error);
                      }
                    }
                  };
                  fileInput.click();
                }
              }
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
                    {showLinkModal && (
                      <LinkEmailModal
                        userId={user?.userId}
                        username={user?.username}
                        onClose={handleCloseModal}
                        onSuccess={handleLinkedSuccess}
                      />
                    )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalTab;
