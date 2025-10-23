import React, { useState } from 'react';
import CreateRoom from "../../components/CreateRoom/CreateRoom";
import FindRoom from "../../components/FindRoom/FindRoom";
import RoomPoker from "./RoomPoker_FE.jsx";   // thêm dòng này
import './Room.css';

function Room() {
    const [currentTab, setCurrentTab] = useState('tao');
    const [inGame, setInGame] = useState(false);
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");

    const handleTabClick = (tab) => setCurrentTab(tab);

    // callback khi tạo hoặc tìm thấy phòng
    const handleRoomJoined = (info) => {
        setRoomId(info.roomId);
        setUsername(info.username);
        setInGame(true);
    };

    // nếu đang ở trong phòng, hiển thị bàn chơi poker
    if (inGame) {
        return (
            <RoomPoker
                roomId={roomId}
                username={username}
                onExit={() => setInGame(false)}
            />
        );
    }

    return (
        <div className="container">
            <div className="header">
                <h1>TẠO PHÒNG CHƠI</h1>
                <button className="close-btn">×</button>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${currentTab === 'tao' ? 'active' : ''}`}
                    onClick={() => handleTabClick('tao')}
                >
                    Tạo phòng
                </button>
                <button
                    className={`tab ${currentTab === 'tim' ? 'active' : ''}`}
                    onClick={() => handleTabClick('tim')}
                >
                    Tìm phòng
                </button>
            </div>

            {currentTab === 'tao' ? (
                <CreateRoom onRoomJoined={handleRoomJoined} />
            ) : (
                <FindRoom onRoomJoined={handleRoomJoined} />
            )}
        </div>
    );
}

export default Room;
