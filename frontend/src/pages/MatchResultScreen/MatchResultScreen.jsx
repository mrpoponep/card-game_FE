import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PlayerCard from '../../components/MatchResult/PlayerCard';
import ReportPlayer from '../../components/ReportPlayer/ReportPlayer';
import './MatchResultScreen.css';

const MatchResultScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Get match data from navigation state
  const matchData = location.state?.matchData || {
    roomCode: '',
    players: []
  };

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
    // The success toast will be shown by the ReportPlayer component
    setShowReportModal(false);
    setSelectedPlayer(null);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handlePlayAgain = () => {
    // Navigate back to the room
    if (matchData.roomCode) {
      navigate(`/room/${matchData.roomCode}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="match-result-screen">
      <div className="match-result-header">
        <h1 className="result-title">KẾT QUẢ TRẬN ĐẤU</h1>
      </div>

      <div className="match-result-content">
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
          <button className="btn-action btn-home" onClick={handleBackToHome}>
            <span className="btn-icon"></span>
            <span>Về trang chủ</span>
          </button>
          <button className="btn-action btn-play-again" onClick={handlePlayAgain}>
            <span className="btn-icon"></span>
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
  );
};

export default MatchResultScreen;
