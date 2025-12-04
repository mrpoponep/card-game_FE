import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PlayerCard from './PlayerCard';
import ReportPlayer from '../ReportPlayer/ReportPlayer';
import './MatchResultModal.css';

const MatchResultModal = ({ matchData, onClose, onPlayAgain, onBackToMenu }) => {
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Get current user ID from auth context
  const currentUserId = user?.userId || user?.user_id;

  const handleReport = (player) => {
    setSelectedPlayer(player);
    setShowReportModal(true);
  };

  const handleCloseReport = () => {
    setShowReportModal(false);
    setSelectedPlayer(null);
  };

  const handleSubmitReport = (reportData) => {
    console.log('Report submitted:', reportData);
    setShowReportModal(false);
    setSelectedPlayer(null);
  };

  if (!matchData) return null;

  return (
    <div className="match-result-modal-overlay" onClick={onClose}>
      <div className="match-result-modal" onClick={(e) => e.stopPropagation()}>
        <div className="match-result-modal-header">
          <h1 className="result-title">KẾT QUẢ TRẬN ĐẤU</h1>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="match-result-modal-content">
          <div className="players-grid">
            {matchData.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isWinner={player.isWinner}
                onReport={handleReport}
                showReportButton={player.id !== currentUserId}
              />
            ))}
          </div>

          <div className="result-actions">
            <button className="btn-action btn-home" onClick={onBackToMenu}>
              <span>Về menu</span>
            </button>
            <button className="btn-action btn-play-again" onClick={onPlayAgain}>
              <span>Chơi tiếp</span>
            </button>
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && selectedPlayer && (
          <ReportPlayer
            playerName={selectedPlayer.name}
            playerId={selectedPlayer.id}
            reporterId={currentUserId}
            roomCode={matchData.roomCode}
            onClose={handleCloseReport}
            onSubmit={handleSubmitReport}
          />
        )}
      </div>
    </div>
  );
};

export default MatchResultModal;

