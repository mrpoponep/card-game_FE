import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Ranking from '../../components/ranking/Ranking';
import PokerRules from '../../components/RuleScreen/PokerRules';
import RoomModal from '../../components/RoomModal/RoomModal';
import { useAuth } from '../../context/AuthContext';
import './Home.css';
import RechargeModal from '../../components/RechargeModal/RechargeModal.jsx';

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showRanking, setShowRanking] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const rankingOverlayRef = useRef(null);
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

  // HÀM XỬ LÝ ĐĂNG XUẤT
  const handleLogout = () => {
    logout(); // Từ useAuth - đã gửi API và navigate
  };

  // --- Các hàm xử lý sự kiện của bạn ---
  const handlePlayWithAI = () => {
    console.log('Play with AI clicked');
  };

  const handlePlayNow = () => {
    console.log('Play now clicked');
  };

  const handlePlayWithFriend = () => {
    setShowRoomModal(true); // Mở modal
  };

  const handleShowRanking = () => {
    setShowRanking(true);
  };

  const handleShowRules = () => {
    setShowRules(true);
  };

  const handleTopUp = () => setShowRechargeModal(true);

  console.log('User data in Home.jsx:', user);
  return (
    <div className="home-container">
      {/* User Info Section */}
      <div className="user-info">
        <div className="user-avatar" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} title="Xem hồ sơ">
          <img
            src={`${SERVER_URL}/avatar/${user.userId}`}
            alt="Avatar"
            className="avatar-placeholder"
            style={{ objectFit: 'cover' }}
          />
        </div>

        <div className="user-details">
          <div className="username">{user.username}</div>
          <div className="user-stats">
            <span className="elo-badge">Elo: {user.elo}</span>
          </div>
        </div>

        <div className="top-right-icons">
          <button className="icon-btn notes-btn" onClick={handleLogout} title="Đăng xuất">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
            </svg>
          </button>
          <button className="icon-btn rules-btn" onClick={handleShowRules}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
            </svg>
          </button>
          <button className="icon-btn settings-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Balance Section */}
      <div className="balance-section">
        <div className="balance-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
        </div>
        <span className="balance-amount">Coin: {user.balance.toLocaleString()}</span>
        <button className="topup-btn" onClick={handleTopUp}>NẠP TIỀN</button>
      </div>

      {/* Main Action Buttons */}
      <div className="main-actions">
        <button className="action-btn play-ai-btn" onClick={handlePlayWithAI}>
          <div className="btn-icon">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='25' y='25' width='50' height='45' rx='5' fill='%23ff9500' stroke='%23000' stroke-width='3'/%3E%3Cline x1='50' y1='15' x2='50' y2='25' stroke='%23000' stroke-width='3'/%3E%3Ccircle cx='50' cy='12' r='4' fill='%23ff0000'/%3E%3Crect x='32' y='35' width='12' height='12' fill='%23000'/%3E%3Crect x='56' y='35' width='12' height='12' fill='%23000'/%3E%3Cline x1='35' y1='55' x2='65' y2='55' stroke='%23000' stroke-width='2'/%3E%3Cline x1='35' y1='60' x2='65' y2='60' stroke='%23000' stroke-width='2'/%3E%3Cline x1='35' y1='65' x2='65' y2='65' stroke='%23000' stroke-width='2'/%3E%3Crect x='20' y='40' width='5' height='15' rx='2' fill='%23ff9500' stroke='%23000' stroke-width='2'/%3E%3Crect x='75' y='40' width='5' height='15' rx='2' fill='%23ff9500' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E" alt="AI Robot" />
            <div className="cards-icon">🂡🂮</div>
          </div>
          <span className="btn-text">CHƠI VỚI AI</span>
        </button>

        <button className="action-btn play-now-btn" onClick={handlePlayNow}>
          <div className="btn-icon main-icon">
            <div className="cards-fan">🂡🂮🂱🃁</div>
            <div className="chips-stack"></div>
          </div>
          <span className="btn-text main-text">CHƠI NGAY</span>
        </button>

        <button className="action-btn play-friend-btn" onClick={handlePlayWithFriend}>
          <div className="btn-icon">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23ff9500' stroke='%23000' stroke-width='3'/%3E%3Ccircle cx='35' cy='40' r='5' fill='%23000'/%3E%3Ccircle cx='65' cy='40' r='5' fill='%23000'/%3E%3Cpath d='M 30 60 Q 50 70 70 60' stroke='%23000' stroke-width='3' fill='none'/%3E%3C/svg%3E" alt="Friend" />
            <div className="cards-icon">🂡🂮</div>
          </div>
          <span className="btn-text">CHƠI VỚI BẠN</span>
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="bottom-actions">
        <button className="bottom-btn chat-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,3C6.5,3 2,6.58 2,11C2.05,13.15 3.06,15.17 4.75,16.5C4.75,17.1 4.33,18.67 2,21C4.37,20.89 6.64,20 8.47,18.5C9.61,18.83 10.81,19 12,19C17.5,19 22,15.42 22,11C22,6.58 17.5,3 12,3M12,17C7.58,17 4,14.31 4,11C4,7.69 7.58,5 12,5C16.42,5 20,7.69 20,11C20,14.31 16.42,17 12,17Z" />
          </svg>
          <span>CHAT TỔNG</span>
        </button>

        <button className="bottom-btn select-table-btn">
          <div className="table-icon">
            <span>CHỌN</span>
            <span>BÀN</span>
          </div>
        </button>

        <button className="bottom-btn ranking-btn" onClick={handleShowRanking}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M5,16L3,5L8.5,10L12,4L15.5,10L21,5L19,16H5M19,19A1,1 0 0,1 18,20H6A1,1 0 0,1 5,19V18H19V19Z" />
          </svg>
          <span>BXH</span>
        </button>
      </div>

      {/* Modals */}
      <div ref={rankingOverlayRef}>
        <Ranking isOpen={showRanking} onClose={() => setShowRanking(false)} />
      </div>

      <PokerRules isOpen={showRules} onClose={() => setShowRules(false)} />

      <RoomModal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
      />

      <RechargeModal 
        isOpen={showRechargeModal} 
        onClose={() => setShowRechargeModal(false)} 
      />
    </div>
  );
}

export default Home;
