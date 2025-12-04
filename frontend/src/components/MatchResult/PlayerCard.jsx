import React from 'react';
import './PlayerCard.css';

const PlayerCard = ({ player, isWinner, onReport, showReportButton = true }) => {
    const { id, name, avatar, chipsChange, handName } = player;

    return (
        <div className={`player-card ${isWinner ? 'winner' : 'loser'}`}>

            {/* 1. Avatar (Fixed Width) */}
            <div className="player-card-avatar">
                {avatar ? (
                    <img src={avatar} alt={name} />
                ) : (
                    <div className="avatar-placeholder">👤</div>
                )}
            </div>

            {/* 2. Info (Flex: 1 -> Stretches to fill space) */}
            <div className="player-card-info">
                <h3 className="player-name">{name}</h3>
                {handName && <p className="player-hand-name">{handName}</p>}
                {chipsChange !== undefined && (
                    <p className={`player-chips-change ${chipsChange >= 0 ? 'positive' : 'negative'}`}>
                        {chipsChange >= 0 ? '+' : ''}{chipsChange}
                    </p>
                )}
            </div>

            {/* 3. Button (Fixed Width - Pushed to right by Info) - Only show if not self */}
            {showReportButton && (
                <button
                    className="btn-report"
                    onClick={() => onReport(player)}
                    title="Tố cáo người chơi"
                >
                    ⚠️
                </button>
            )}
        </div>
    );
};

export default PlayerCard;