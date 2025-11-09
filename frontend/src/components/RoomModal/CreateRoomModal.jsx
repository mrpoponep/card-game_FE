import React, { useState } from 'react';
import { apiCreateRoom } from "../../api";
import './CreateRoomModal.css';

const BET_LEVELS = [1000, 2000, 5000, 10000, 25000, 50000];
const PLAYER_COUNTS = [2, 3, 4];

function CreateRoomModal({ isOpen, onClose, onCreated }) {
  const [betIndex, setBetIndex] = useState(2); // 5K
  const [playerCount, setPlayerCount] = useState(4);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleBetChange = (direction) => {
    setError('');
    let newIndex = betIndex + direction;
    if (newIndex < 0) newIndex = BET_LEVELS.length - 1;
    if (newIndex >= BET_LEVELS.length) newIndex = 0;
    setBetIndex(newIndex);
  };

  const formatBet = (amount) => amount >= 1000 ? `${amount / 1000}K` : amount;

  const handleCreate = async () => {
    setLoading(true);
    setError('');

    const roomData = {
      small_blind: BET_LEVELS[betIndex],
      max_players: playerCount,
    };

    try {
      const response = await apiCreateRoom(roomData);
      setLoading(false);

      if (!response?.room_code) {
        setError(response?.message || 'Không nhận được mã phòng.');
        return;
      }

      onCreated?.(response);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err?.message || 'Lỗi tạo phòng.');
    }
  };

  return (
    <div className="room-modal-overlay" onClick={onClose}>
      <div className="create-room-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="create-room-modal-header">
          <h2>TẠO PHÒNG CHƠI</h2>
          <button className="room-modal-close-btn" onClick={onClose} disabled={loading}>×</button>
        </div>

        <div className="create-room-content">
          {/* MỨC CƯỢC */}
          <div className="bet-section">
            <span className="bet-label">Mức cược:</span>
            <div className="bet-controls">
              <button className="bet-btn" onClick={() => handleBetChange(-1)} disabled={loading}>−</button>
              <div className="bet-value">{formatBet(BET_LEVELS[betIndex])}</div>
              <button className="bet-btn" onClick={() => handleBetChange(1)} disabled={loading}>+</button>
            </div>
          </div>

          {/* SỐ NGƯỜI */}
          <div className="player-section">
            <span className="player-label">Số người:</span>
            <div className="player-buttons">
              {PLAYER_COUNTS.map((count) => (
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

          {/* LỖI */}
          {error && <div className="create-room-error">{error}</div>}

          {/* NÚT TẠO */}
          <button
            className="create-action-btn"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'ĐANG TẠO...' : 'TẠO PHÒNG'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomModal;