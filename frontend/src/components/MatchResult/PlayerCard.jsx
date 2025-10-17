import React from 'react';
import './PlayerCard.css';

const PlayerCard = ({ player, isWinner, onReport }) => {
  const { id, name, avatar } = player;

  return (
    <div className={`player-card ${isWinner ? 'winner' : 'loser'}`}>
      <div className="player-card-content">
        <div className="player-avatar">
          {avatar ? (
            <img src={avatar} alt={name} />
          ) : (
            <div className="avatar-placeholder">👤</div>
          )}
        </div>

        <div className="player-info">
          <h3 className="player-name">{name}</h3>
          <p className="player-id">ID: {id}</p>
        </div>

        <button
          className="btn-report"
          onClick={() => onReport(player)}
          title="Tố cáo người chơi"
        >
          ⚠️
        </button>
      </div>
    </div>
  );
};

export default PlayerCard;
