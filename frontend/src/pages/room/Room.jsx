import React, { useState } from 'react';
import CreateRoom from "../../components/CreateRoom/CreateRoom";
import FindRoom from "../../components/FindRoom/FindRoom";
import './Room.css';

function App() {
    const [currentTab, setCurrentTab] = useState('tao'); // 'tao' hoặc 'tim'

    const handleTabClick = (tab) => {
        setCurrentTab(tab);
    };

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

            {currentTab === 'tao' ? <CreateRoom /> : <FindRoom />}
        </div>
    );
}

export default App;
