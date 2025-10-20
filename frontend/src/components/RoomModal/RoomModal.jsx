import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiCreateRoom, apiFindAndJoinRoom } from '../../api';
import './RoomModal.css';

// Các mức cược (K = 1000)
const BET_LEVELS = [1000, 2000, 5000, 10000, 25000, 50000];
const PLAYER_COUNTS = [2, 3, 4];

function RoomModal({ isOpen, onClose }) {
  const { user } = useAuth(); // Lấy thông tin user
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState('create'); // 'create' hoặc 'find'
  const [betIndex, setBetIndex] = useState(2); // Mặc định 5K (index = 2)
  const [playerCount, setPlayerCount] = useState(4);
  const [pin, setPin] = useState(['', '', '', '']);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pinInputs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  if (!isOpen) return null;

  // --- Xử lý Tab TẠO PHÒNG ---
  const handleBetChange = (direction) => {
    setError('');
    let newIndex = betIndex + direction;
    if (newIndex < 0) newIndex = BET_LEVELS.length - 1;
    if (newIndex >= BET_LEVELS.length) newIndex = 0;
    setBetIndex(newIndex);
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    
    const roomData = {
      small_blind: BET_LEVELS[betIndex],
      max_players: playerCount,
      user_id: user.user_id
    };

    // Kiểm tra tiền ở Client (chỉ để hiển thị nhanh)
    const minBuyIn = roomData.small_blind * 10;
    if (user.balance < minBuyIn) {
      setError(`Bạn không đủ tiền. Cần ít nhất ${minBuyIn.toLocaleString()}.`);
      setLoading(false);
      return;
    }

    try {
      // Gọi API Backend (Backend sẽ kiểm tra tiền một lần nữa)
      const response = await apiCreateRoom(roomData);
      setLoading(false);
      
      // Tạo phòng thành công, chuyển hướng
      navigate(`/room/${response.room_code}`);
    } catch (err) {
      const errorData = JSON.parse(err.message);
      setError(errorData.message || 'Lỗi tạo phòng');
      setLoading(false);
    }
  };

  // --- Xử lý Tab TÌM PHÒNG ---
  const handlePinChange = (e, index) => {
    setError('');
    const val = e.target.value;
    if (!/^[0-9]$/.test(val) && val !== '') return; // Chỉ chấp nhận số

    const newPin = [...pin];
    newPin[index] = val;
    setPin(newPin);

    // Tự động nhảy sang ô tiếp theo
    if (val !== '' && index < 3) {
      pinInputs[index + 1].current.focus();
    }
  };

  const handlePinKeyDown = (e, index) => {
    // Xử lý nút Backspace
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      pinInputs[index - 1].current.focus();
    }
  };

  const handleFindRoom = async () => {
    setLoading(true);
    setError('');
    
    const roomCode = pin.join('');
    if (roomCode.length !== 4) {
      setError('Mã phòng phải đủ 4 số.');
      setLoading(false);
      return;
    }

    try {
      // Gọi API (Backend sẽ kiểm tra tiền)
      const response = await apiFindAndJoinRoom(roomCode, user.user_id);
      setLoading(false);
      
      // Tìm thấy và đủ tiền, chuyển hướng
      navigate(`/room/${response.room_code}`);
    } catch (err) {
      const errorData = JSON.parse(err.message);
      setError(errorData.message || 'Lỗi tìm phòng');
      setLoading(false);
    }
  };

  // --- Helper ---
  const formatBet = (amount) => {
    return amount >= 1000 ? `${amount / 1000}K` : amount;
  };

  // Render nội dung cho tab hiện tại
  const renderContent = () => {
    if (currentTab === 'create') {
      return (
        <>
          <div className="setting-row">
            <span className="setting-label">Mức cược:</span>
            <div className="setting-control">
              <button className="control-btn" onClick={() => handleBetChange(-1)}>-</button>
              <div className="value-display">{formatBet(BET_LEVELS[betIndex])}</div>
              <button className="control-btn" onClick={() => handleBetChange(1)}>+</button>
            </div>
          </div>
          <div className="setting-row">
            <span className="setting-label">Số người:</span>
            <div className="setting-control">
              {PLAYER_COUNTS.map(count => (
                <button
                  key={count}
                  className={`player-btn ${playerCount === count ? 'active' : ''}`}
                  onClick={() => setPlayerCount(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="room-modal-error">{error}</div>}
          <button 
            className="modal-action-btn" 
            onClick={handleCreateRoom}
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo phòng'}
          </button>
        </>
      );
    }

    if (currentTab === 'find') {
      return (
        <>
          <span className="find-room-label">Nhập mã phòng:</span>
          <div className="pincode-input">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={pinInputs[i]}
                type="tel" // Dùng 'tel' để mở bàn phím số trên mobile
                maxLength="1"
                value={digit}
                onChange={(e) => handlePinChange(e, i)}
                onKeyDown={(e) => handlePinKeyDown(e, i)}
                disabled={loading}
              />
            ))}
          </div>
          {error && <div className="room-modal-error">{error}</div>}
          <button 
            className="modal-action-btn"
            onClick={handleFindRoom}
            disabled={loading}
          >
            {loading ? 'Đang tìm...' : 'Vào phòng'}
          </button>
        </>
      );
    }
  };

  return (
    <div className="room-modal-overlay" onClick={onClose}>
      <div className="room-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="room-modal-header">
          <h2>TẠO PHÒNG CHƠI</h2>
          <button className="room-modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="room-modal-tabs">
          <button
            className={`room-modal-tab ${currentTab === 'create' ? 'active' : ''}`}
            onClick={() => { setCurrentTab('create'); setError(''); }}
          >
            Tạo phòng
          </button>
          <button
            className={`room-modal-tab ${currentTab === 'find' ? 'active' : ''}`}
            onClick={() => { setCurrentTab('find'); setError(''); }}
          >
            Tìm phòng
          </button>
        </div>
        <div className="room-modal-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default RoomModal;