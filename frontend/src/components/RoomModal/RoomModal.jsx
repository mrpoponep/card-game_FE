import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import { apiCreateRoom, apiFindAndJoinRoom } from '../../api';
import './RoomModal.css';

// Bet levels (K = 1000)
const BET_LEVELS = [1000, 2000, 5000, 10000, 25000, 50000];
const PLAYER_COUNTS = [2, 3, 4];

function RoomModal({ isOpen, onClose }) {
  const { user } = useAuth(); // Get user info
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState('create'); // 'create' or 'find'
  const [betIndex, setBetIndex] = useState(2); // Default 5K (index = 2)
  const [playerCount, setPlayerCount] = useState(4); // Default 4 players
  const [pin, setPin] = useState(['', '', '', '']); // For finding room

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pinInputs = [useRef(null), useRef(null), useRef(null), useRef(null)]; // Refs for pin input focus

  // Don't render if the modal is closed
  if (!isOpen) return null;

  // --- Handle CREATE ROOM tab ---
  const handleBetChange = (direction) => {
    setError('');
    let newIndex = betIndex + direction;
    // Cycle through bet levels
    if (newIndex < 0) newIndex = BET_LEVELS.length - 1;
    if (newIndex >= BET_LEVELS.length) newIndex = 0;
    setBetIndex(newIndex);
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');

    const roomData = {
      small_blind: BET_LEVELS[betIndex],
      max_players: playerCount, // The selected number of players (e.g., 3)
      user_id: user.user_id
    };

    // Client-side quick check for balance (server validates again)
    const minBuyIn = roomData.small_blind * 10;
    if (user.balance < minBuyIn) {
      setError(`Bạn không đủ tiền. Cần ít nhất ${minBuyIn.toLocaleString()}.`);
      setLoading(false);
      return;
    }

    try {
      // Call the create room API
      const response = await apiCreateRoom(roomData);
      setLoading(false);

      // --- **THE FIX IS HERE** ---
      // Navigate to the room URL and pass the full 'table' object
      // (which includes max_players) via location state.
      navigate(`/room/${response.room_code}`, {
        state: { roomSettings: response.table } // Send the entire table info
      });
      // --- **END OF FIX** ---

    } catch (err) {
      // Handle API errors
      try {
        const errorData = JSON.parse(err.message);
        setError(errorData.message || 'Lỗi tạo phòng');
      } catch (parseError) {
         setError('Lỗi tạo phòng không xác định.');
      }
      setLoading(false);
    }
  };

  // --- Handle FIND ROOM tab ---
  const handlePinChange = (e, index) => {
    setError('');
    const val = e.target.value;
    // Allow only single digits
    if (!/^[0-9]$/.test(val) && val !== '') return;

    const newPin = [...pin];
    newPin[index] = val;
    setPin(newPin);

    // Auto-focus next input
    if (val !== '' && index < 3) {
      pinInputs[index + 1].current.focus();
    }
  };

  const handlePinKeyDown = (e, index) => {
    // Handle backspace to focus previous input
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      pinInputs[index - 1].current.focus();
    }
  };

  const handleFindRoom = async () => {
    setLoading(true);
    setError('');

    const roomCode = pin.join('');
    // Validate pin length
    if (roomCode.length !== 4) {
      setError('Mã phòng phải đủ 4 số.');
      setLoading(false);
      return;
    }

    try {
      // Call the find room API (server checks balance)
      const response = await apiFindAndJoinRoom(roomCode, user.user_id);
      setLoading(false);

      // Navigate to the room and pass the room settings
      // 'response' itself is the room object here
      navigate(`/room/${response.room_code}`, {
        state: { roomSettings: response }
      });
    } catch (err) {
       // Handle API errors
      try {
        const errorData = JSON.parse(err.message);
        setError(errorData.message || 'Lỗi tìm phòng');
      } catch (parseError) {
         setError('Lỗi tìm phòng không xác định.');
      }
      setLoading(false);
    }
  };

  // --- Helper to format bet amount (e.g., 5000 -> 5K) ---
  const formatBet = (amount) => {
    return amount >= 1000 ? `${amount / 1000}K` : amount;
  };

  // --- Render content based on the active tab ---
  const renderContent = () => {
    if (currentTab === 'create') {
      return (
        <>
          {/* Bet Level Selection */}
          <div className="setting-row">
            <span className="setting-label">Mức cược:</span>
            <div className="setting-control">
              <button className="control-btn" onClick={() => handleBetChange(-1)} disabled={loading}>-</button>
              <div className="value-display">{formatBet(BET_LEVELS[betIndex])}</div>
              <button className="control-btn" onClick={() => handleBetChange(1)} disabled={loading}>+</button>
            </div>
          </div>
          {/* Player Count Selection */}
          <div className="setting-row">
            <span className="setting-label">Số người:</span>
            <div className="setting-control">
              {PLAYER_COUNTS.map(count => (
                <button
                  key={count}
                  className={`player-btn ${playerCount === count ? 'active' : ''}`}
                  onClick={() => setPlayerCount(count)}
                  disabled={loading}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
          {/* Error Message Display */}
          {error && <div className="room-modal-error">{error}</div>}
          {/* Create Room Button */}
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
          {/* Room Code Input */}
          <span className="find-room-label">Nhập mã phòng:</span>
          <div className="pincode-input">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={pinInputs[i]}
                type="tel" // Use 'tel' for numeric keyboard on mobile
                maxLength="1"
                value={digit}
                onChange={(e) => handlePinChange(e, i)}
                onKeyDown={(e) => handlePinKeyDown(e, i)}
                disabled={loading}
                inputMode="numeric" // Helps mobile show numeric keys
                pattern="[0-9]*"   // Further hint for numeric input
              />
            ))}
          </div>
          {/* Error Message Display */}
          {error && <div className="room-modal-error">{error}</div>}
          {/* Find Room Button */}
          <button
            className="modal-action-btn"
            onClick={handleFindRoom}
            disabled={loading || pin.join('').length !== 4} // Disable if pin is incomplete
          >
            {loading ? 'Đang tìm...' : 'Vào phòng'}
          </button>
        </>
      );
    }
  };

  // --- Main Modal Structure ---
  return (
    // Overlay covers the screen, closes modal on click outside
    <div className="room-modal-overlay" onClick={onClose}>
      {/* Container prevents click propagation, keeps modal open */}
      <div className="room-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="room-modal-header">
          <h2>TẠO PHÒNG CHƠI</h2>
          <button className="room-modal-close-btn" onClick={onClose} disabled={loading}>×</button>
        </div>
        {/* Tabs */}
        <div className="room-modal-tabs">
          <button
            className={`room-modal-tab ${currentTab === 'create' ? 'active' : ''}`}
            onClick={() => { setCurrentTab('create'); setError(''); }}
            disabled={loading}
          >
            Tạo phòng
          </button>
          <button
            className={`room-modal-tab ${currentTab === 'find' ? 'active' : ''}`}
            onClick={() => { setCurrentTab('find'); setError(''); setPin(['','','','']); }} // Reset pin on tab switch
            disabled={loading}
          >
            Tìm phòng
          </button>
        </div>
        {/* Dynamic Content Area */}
        <div className="room-modal-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default RoomModal;