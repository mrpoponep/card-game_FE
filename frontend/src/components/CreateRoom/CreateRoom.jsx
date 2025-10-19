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



    const handleCreateRoom = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/room/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    min_players: 2,
                    max_players: 6,
                    small_blind: bet / 2,
                    max_blind: bet,
                    min_buy_in: 2000,
                    max_buy_in: 10000,
                    rake: 0.05,
                    is_private: true,
                    user_id: 1
                })
            });
            const data = await res.json();
            alert(`Tạo phòng thành công! Mã phòng: ${data.room_code}`);

        } catch (err) {
            alert("Lỗi tạo phòng!");
            console.error(err);
        }
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
            <button className="create-btn" onClick={handleCreateRoom}>TẠO PHÒNG</button>
        </>
    );
};

export default CreateRoom;
