import React from 'react';
import './PlayerCard.css';

const PlayerCard = ({ player, isWinner, onReport }) => {
    const { id, name, avatar } = player;

    return (
        // Removed the "player-card-content" wrapper div
        <div className={`player-card ${isWinner ? 'winner' : 'loser'}`}>

            {/* 1. Avatar (Fixed Width) */}
            <div className="player-avatar">
                {avatar ? (
                    <img src={avatar} alt={name} />
                ) : (
                    <div className="avatar-placeholder">👤</div>
                )}
            </div>

            {/* 2. Info (Flex: 1 -> Stretches to fill space) */}
            <div className="player-info">
                <h3 className="player-name">{name}</h3>
                <p className="player-id">ID: {id}</p>
            </div>

            {/* 3. Button (Fixed Width - Pushed to right by Info) */}
            <button
                className="btn-report"
                onClick={() => onReport(player)}
                title="Tố cáo người chơi"
            >
                ⚠️
            </button>
        </div>
    );
};

export default PlayerCard;