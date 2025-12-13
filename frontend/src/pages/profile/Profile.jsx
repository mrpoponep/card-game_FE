import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PersonalTab from './PersonalTab';
import MatchHistoryTab from './MatchHistoryTab';
import RewardHistoryTab from './RewardHistoryTab';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal'); // personal, matches, rewards

  const tabs = [
    { id: 'personal', label: '👤 Cá nhân', icon: '👤' },
    { id: 'matches', label: '🎮 Lịch sử đấu', icon: '🎮' },
    { id: 'rewards', label: '🎁 Lịch sử nhận thưởng', icon: '🎁' }
  ];

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Tabs with Back Button */}
        <div className="profile-tabs-with-back">
          <button className="play-game-btn" onClick={handleBack}>
            🎮 Chơi Game
          </button>
          <div className="profile-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'personal' && <PersonalTab />}
          {activeTab === 'matches' && <MatchHistoryTab />}
          {activeTab === 'rewards' && <RewardHistoryTab />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
