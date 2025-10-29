import React, { useState } from 'react';
import PlayerCard from '../../components/MatchResult/PlayerCard';
import ReportPlayer from '../../components/ReportPlayer/ReportPlayer';
import './MatchResultScreen.css';

const MatchResultScreen = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Current user ID (TODO: Get from authentication context/state)
  const currentUserId = '1'; // This should come from your auth system

  // Sample match data
  const matchData = {
    matchId: 'MTH-2025-001234',
    players: [
      {
        id: '12345',
        name: 'Phong',
        avatar: null,
        isWinner: true
      },
      {
        id: '1',
        name: 'Alice',
        avatar: null,
        isWinner: false
      },
      {
        id: '2',
        name: 'Bob',
        avatar: null,
        isWinner: false
      },
      {
        id: '3',
        name: 'Charlie',
        avatar: null,
        isWinner: false
      },
      {
        id: '55667',
        name: 'Player_Fifth',
        avatar: null,
        isWinner: false
      },
      {
        id: '66778',
        name: 'Player_Sixth',
        avatar: null,
        isWinner: false
      },
      {
        id: '77889',
        name: 'Player_Seventh',
        avatar: null,
        isWinner: false
      },
      {
        id: '88990',
        name: 'Player_Eighth',
        avatar: null,
        isWinner: false
      },
      {
        id: '99001',
        name: 'Player_Ninth',
        avatar: null,
        isWinner: false
      }
    ]
  };

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
    // TODO: Navigate to home screen
    console.log('Navigate to home');
  };

  const handlePlayAgain = () => {
    // TODO: Start new match
    console.log('Start new match');
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
          onClose={handleCloseReport}
          onSubmit={handleSubmitReport}
        />
      )}
    </div>
  );
};

export default MatchResultScreen;
