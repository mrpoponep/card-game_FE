import React, { useState } from 'react';

const MIN_BET = 5;
const MAX_BET = 100;
const BET_STEP = 5;
const PLAYER_OPTIONS = [2, 3, 4];

const CreateRoom = () => {
    const [bet, setBet] = useState(MIN_BET);
    const [players, setPlayers] = useState(4);

    const handleBetChange = (delta) => {
        setBet(prev => {
            let next = prev + delta * BET_STEP;
            if (next < MIN_BET) next = MIN_BET;
            if (next > MAX_BET) next = MAX_BET;
            return next;
        });
    };

    const handlePlayerSelect = (num) => {
        setPlayers(num);
    };

    return (
        <>
            <div className="bet-section">
                <p>Mức cược:</p>
                <div className="bet-control">
                    <button className="bet-btn" onClick={() => handleBetChange(-1)}>-</button>
                    <span className="bet-amount">{bet}K</span>
                    <button className="bet-btn" onClick={() => handleBetChange(1)}>+</button>
                </div>
            </div>
            <div className="player-section">
                <p>Số người:</p>
                <div className="player-options">
                    {PLAYER_OPTIONS.map(num => (
                        <button
                            key={num}
                            className={`player-btn${players === num ? ' active' : ''}`}
                            onClick={() => handlePlayerSelect(num)}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>
            <button className="create-btn">TẠO PHÒNG</button>
        </>
    );
};

export default CreateRoom;
