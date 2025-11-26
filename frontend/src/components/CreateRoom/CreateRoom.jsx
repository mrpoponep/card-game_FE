import React, { useState } from 'react';

const MIN_BET = 5;
const MAX_BET = 100;
const BET_STEP = 5;
const PLAYER_OPTIONS = [2, 3, 4];

const CreateRoom = ({ onRoomJoined }) => {
    const [bet, setBet] = useState(MIN_BET);
    const [players, setPlayers] = useState(4);
    const [username, setUsername] = useState("");

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

    // Gọi API backend khi tạo phòng
const handleCreateRoom = async () => {
    if (!username.trim()) {
        alert("Vui lòng nhập tên người chơi!");
        return;
    }

    // ⚡️ Demo: tạo ID phòng ngẫu nhiên thay vì gọi BE
    const fakeRoomId = Math.floor(Math.random() * 90000) + 10000;

    // Giả lập delay như khi gọi API thật
    await new Promise(resolve => setTimeout(resolve, 500));

    // Gọi callback để chuyển sang giao diện chơi bài
    onRoomJoined({
        roomId: fakeRoomId,
        username: username.trim()
    });
};

    return (
        <div className="create-room-container">
            <div className="input-section">
                <label>Tên người chơi:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên..."
                />
            </div>

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

            <button className="create-btn" onClick={handleCreateRoom}>
                TẠO PHÒNG
            </button>
        </div>
    );
};

export default CreateRoom;
