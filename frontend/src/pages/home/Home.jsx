import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Ranking from '../../components/ranking/Ranking';
import PokerRules from '../../components/RuleScreen/PokerRules';
import RoomModal from '../../components/RoomModal/RoomModal';
import TableSelect from '../../components/TableSelect/TableSelect';
import GlobalChat from '../../components/GlobalChat/GlobalChat';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { apiPost } from '../../api';
import './Home.css';
import RechargeModal from '../../components/RechargeModal/RechargeModal.jsx';
import DailyReward from '../../components/dailyReward/DailyReward';
import EloReward from '../../components/eloReward/EloReward';
import GiftReward from '../../components/giftReward/GiftReward';
import LuckyWheel from '../../components/LuckyWheel/LuckyWheel';

function Home() {
  const navigate = useNavigate();
  const { user, logout, reloadUser } = useAuth();
  const { socket } = useSocket();

  const { onRewardNotification } = useSocket();
  const [showRanking, setShowRanking] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  // State lưu trữ tin nhắn chat tổng (Persistent)
  const [globalMessages, setGlobalMessages] = useState([]);
  // Floating global chat messages (bottom-left)
  const [floatingGlobalMessages, setFloatingGlobalMessages] = useState([]);
  const floatingMessageIdRef = useRef(0);
  // Quick chat input
  const [quickChatMessage, setQuickChatMessage] = useState('');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showTableSelect, setShowTableSelect] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [showEloReward, setShowEloReward] = useState(false);
  const [showGiftReward, setShowGiftReward] = useState(false);
  const [showLuckyWheel, setShowLuckyWheel] = useState(false);
  const [hasNotifications, setHasNotifications] = useState({
    daily: false,
    elo: false,
    gift: false
  });

  // Callbacks để xóa dấu chấm đỏ sau khi nhận thưởng
  const handleDailyRewardClaimed = useCallback(() => {
    setHasNotifications(prev => ({ ...prev, daily: false }));
  }, []);

  const handleEloRewardClaimed = useCallback(() => {
    setHasNotifications(prev => ({ ...prev, elo: false }));
  }, []);

  const handleGiftRewardClaimed = useCallback(() => {
    setHasNotifications(prev => ({ ...prev, gift: false }));
  }, []);
  const [showRewardToast, setShowRewardToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const rankingOverlayRef = useRef(null);
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

  // 1. Tự động cập nhật số dư khi vào trang Home
  useEffect(() => {
    if (reloadUser) {
      reloadUser();
    }
  }, [reloadUser]);

  // 2. Logic Global Chat: Lắng nghe ngay tại Home
  useEffect(() => {
    if (!socket) return;

    // Join phòng chat tổng ngay khi vào Home
    socket.emit('joinGlobalChat');

    const handleReceiveMessage = (newMessage) => {
      setGlobalMessages(prev => [...prev, newMessage]);

      // Add floating message for bottom-left display
      const messageId = floatingMessageIdRef.current++;
      const floatingMsg = {
        id: messageId,
        username: newMessage.username,
        text: newMessage.text,
        timestamp: Date.now()
      };

      setFloatingGlobalMessages(prev => {
        // Keep only the last 8 messages (to not overflow past middle of screen)
        return [...prev, floatingMsg].slice(-8);
      });

      // Auto-remove this message after 10 seconds
      setTimeout(() => {
        setFloatingGlobalMessages(prev => prev.filter(m => m.id !== messageId));
      }, 10000);
    };

    socket.on('receiveGlobalMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveGlobalMessage', handleReceiveMessage);
      // Không leave phòng để giữ kết nối ngầm nếu cần, hoặc leave nếu muốn tiết kiệm resource
      // socket.emit('leaveGlobalChat');
    };
  }, [socket]);

  const handleLogout = () => {
    logout();
  };

  // Quick chat send handler
  const handleQuickChatSend = (e) => {
    e.preventDefault();
    const text = quickChatMessage.trim();
    if (text && socket) {
      socket.emit('sendGlobalMessage', { text });
      setQuickChatMessage('');
    }
  };

  const handlePlayWithAI = () => {
    console.log('Play with AI clicked');
  };

  const handlePlayNow = () => {
    console.log('Play now clicked');
  };

  const handlePlayWithFriend = () => {
    setShowRoomModal(true);
  };

  const handleShowRanking = () => {
    setShowRanking(true);
  };

  const handleShowRules = () => {
    setShowRules(true);
  };

  const handleTopUp = () => setShowRechargeModal(true);

  const handleSelectTable = () => setShowTableSelect(true);

  // Hàm kiểm tra notification (tách riêng để tái sử dụng)
  const checkRewardNotifications = async () => {
    console.log('🔍 Checking reward notifications...');
    try {
      const notifications = { daily: false, elo: false, gift: false };
      
      // Kiểm tra Daily Reward
      try {
        const dailyCheck = await apiPost('/daily-reward/check', {});
        if (dailyCheck.success && dailyCheck.data.canClaim) {
          notifications.daily = true;
        }
      } catch (err) {
        console.error('Error checking daily reward:', err);
      }

      // Kiểm tra Elo Reward
      try {
        const eloCheck = await apiPost('/elo-reward/check', {});
        // Kiểm tra xem có milestone nào có thể claim không
        if (eloCheck.success && eloCheck.data?.summary?.claimable > 0) {
          notifications.elo = true;
        }
      } catch (err) {
        console.error('Error checking elo reward:', err);
      }

      // Kiểm tra Gift Reward (Weekly + Monthly)
      try {
        const weeklyCheck = await apiPost('/weekly-reward/check', {});
        const monthlyCheck = await apiPost('/monthly-reward/check', {});
        
        // Hiển thị notification nếu có thể nhận thưởng tuần HOẶC thưởng tháng
        if ((weeklyCheck.success && weeklyCheck.data.canClaim) || 
            (monthlyCheck.success && monthlyCheck.data.canClaim)) {
          notifications.gift = true;
        }
      } catch (err) {
        console.error('Error checking gift reward:', err);
      }

      console.log('✅ Kiểm tra thông báo:', notifications);
      setHasNotifications(notifications);
    } catch (error) {
      console.error('Error checking reward notifications:', error);
    }
  };

  // Kiểm tra phần thưởng khi load trang (chỉ khi userId thay đổi, không phải khi gems/balance thay đổi)
  useEffect(() => {
    if (user?.userId) {
      checkRewardNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]); // Chỉ chạy khi userId thay đổi (login/logout), không chạy khi gems/balance thay đổi

  // Lắng nghe socket notification cho phần thưởng mới (chỉ đăng ký khi userId thay đổi)
  useEffect(() => {
    console.log('🔌 Socket notification hook mounted, onRewardNotification:', !!onRewardNotification);
    if (!onRewardNotification || !user?.userId) {
      console.warn('⚠️ onRewardNotification is not available or user not logged in');
      return;
    }

    const unsubscribe = onRewardNotification((data) => {
      console.log('🎁 Received reward notification:', data);
      
      // Hiển thị toast message
      setToastMessage(data.message || 'Có phần thưởng mới!');
      setShowRewardToast(true);
      
      // Tự động ẩn toast sau 5 giây
      setTimeout(() => {
        setShowRewardToast(false);
      }, 5000);
      
      // Refresh notification dots
      console.log('🔄 Refreshing notification dots...');
      checkRewardNotifications();
    });

    console.log('✅ Socket notification listener registered');

    return () => {
      console.log('🔌 Socket notification listener unregistered');
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]); // Chỉ đăng ký lại khi userId thay đổi (login/logout), không phải khi gems/balance thay đổi

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
          <div className="username">{user?.username}</div>
          <div className="user-stats">
            <span className="elo-badge">Elo: {user?.elo}</span>
          </div>
        </div>

        <div className="top-right-menu">
          <div className="menu-item">
            <button className="menu-btn reward-menu-btn" onClick={() => setShowDailyReward(true)} title="Nhận thưởng hàng ngày">
              <span className="menu-icon">🎁</span>
              {hasNotifications.daily && <span className="notification-dot"></span>}
            </button>
            <span className="menu-label">Hằng ngày</span>
          </div>
          <div className="menu-item">
            <button className="menu-btn reward-menu-btn" onClick={() => setShowEloReward(true)} title="Nhận thưởng ELO">
              <span className="menu-icon">🏆</span>
              {hasNotifications.elo && <span className="notification-dot"></span>}
            </button>
            <span className="menu-label">Hạng</span>
          </div>
          <div className="menu-item">
            <button className="menu-btn reward-menu-btn" onClick={() => setShowGiftReward(true)} title="Thành tựu">
              <span className="menu-icon">🎉</span>
              {hasNotifications.gift && <span className="notification-dot"></span>}
            </button>
            <span className="menu-label">Thành tựu</span>
          </div>
          <div className="menu-item">
            <button className="menu-btn" onClick={() => setShowLuckyWheel(true)} title="Vòng quay">
              <span className="menu-icon">🎡</span>
            </button>
            <span className="menu-label">Vòng quay</span>
          </div>
          <div className="menu-item">
            <button className="menu-btn" onClick={handleShowRules} title="Hướng dẫn">
              <span className="menu-icon">📖</span>
            </button>
            <span className="menu-label">Hướng dẫn</span>
          </div>
          <div className="menu-item">
            <button className="menu-btn" onClick={handleLogout} title="Đăng xuất">
              <span className="menu-icon">🚪</span>
            </button>
            <span className="menu-label">Đăng xuất</span>
          </div>
        </div>
      </div>

      {/* Balance Section */}
      <div className="balance-section">
        <div className="balance-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
          </svg>
        </div>
        <span className="balance-amount">Coin: {user?.balance?.toLocaleString() || '0'}</span>
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
        <button className="bottom-btn chat-btn" onClick={() => setIsChatOpen(true)}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,3C6.5,3 2,6.58 2,11C2.05,13.15 3.06,15.17 4.75,16.5C4.75,17.1 4.33,18.67 2,21C4.37,20.89 6.64,20 8.47,18.5C9.61,18.83 10.81,19 12,19C17.5,19 22,15.42 22,11C22,6.58 17.5,3 12,3M12,17C7.58,17 4,14.31 4,11C4,7.69 7.58,5 12,5C16.42,5 20,7.69 20,11C20,14.31 16.42,17 12,17Z"/>
          </svg>
          <span>CHAT TỔNG</span>
        </button>

        <button className="bottom-btn select-table-btn" onClick={handleSelectTable}>
          <div className="table-icon">
            <span>CHỌN</span>
            <span>BÀN</span>
          </div>
        </button>

        <button className="bottom-btn ranking-btn" onClick={handleShowRanking}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M5,16L3,5L8.5,10L12,4L15.5,10L21,5L19,16H5M19,19A1,1 0 0,1 18,20H6A1,1 0 0,1 5,19V18H19V19Z"/>
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

      <DailyReward 
        isOpen={showDailyReward} 
        onClose={() => setShowDailyReward(false)}
        onClaimed={handleDailyRewardClaimed}
      />

      <EloReward 
        isOpen={showEloReward} 
        onClose={() => setShowEloReward(false)}
        onClaimed={handleEloRewardClaimed}
      />

      <GiftReward 
        isOpen={showGiftReward} 
        onClose={() => setShowGiftReward(false)}
        onClaimed={handleGiftRewardClaimed}
      />

      <LuckyWheel 
        isOpen={showLuckyWheel} 
        onClose={() => setShowLuckyWheel(false)} 
      />

      {/* Toast notification cho phần thưởng mới */}
      {showRewardToast && (
        <div className="reward-toast">
          <span className="toast-icon">🎁</span>
          <span className="toast-message">{toastMessage}</span>
          <button className="toast-close" onClick={() => setShowRewardToast(false)}>×</button>
        </div>
      )}

      {/* Truyền tin nhắn xuống GlobalChat */}
      <GlobalChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        externalMessages={globalMessages}
      />

      <TableSelect
        isOpen={showTableSelect}
        onClose={() => setShowTableSelect(false)}
      />

      {/* Global Chat Floating Messages - Bottom Left */}
      <div className="global-chat-floating-container">
        {floatingGlobalMessages.map((msg) => (
          <div key={msg.id} className="global-chat-floating-message">
            <span className="global-chat-label">[Chat tổng]</span>
            <span className="global-chat-sender">{msg.username}:</span>
            <span className="global-chat-text">{msg.text}</span>
          </div>
        ))}
      </div>

      {/* Quick Chat Input Box - Bottom Left */}
      <form className="quick-chat-box" onSubmit={handleQuickChatSend}>
        <input
          type="text"
          className="quick-chat-input"
          placeholder="Nhập tin nhắn..."
          value={quickChatMessage}
          onChange={(e) => setQuickChatMessage(e.target.value)}
        />
        <button
          type="submit"
          className="quick-chat-send-btn"
          disabled={!quickChatMessage.trim()}
        >
          ➤
        </button>
      </form>
    </div>
  );
}

export default Home;