import React, { useState } from 'react';
import './TableSelect.css'; // Import CSS custom

// Dữ liệu mẫu (sẽ fetch từ BE API/Socket.io sau)
const tableData = [
    { id: 2592837, betLevel: '20K', currentPlayers: 3, maxPlayers: 4, minBuyIn: '200K' },
    { id: 2596582, betLevel: '10K', currentPlayers: 2, maxPlayers: 4, minBuyIn: '100K' },
    { id: 2587040, betLevel: '5K', currentPlayers: 4, maxPlayers: 4, minBuyIn: '50K' },
    { id: 2596344, betLevel: '10K', currentPlayers: 2, maxPlayers: 4, minBuyIn: '100K' },
    { id: 2592353, betLevel: '5K', currentPlayers: 3, maxPlayers: 4, minBuyIn: '50K' },
    { id: 2592354, betLevel: '2K', currentPlayers: 1, maxPlayers: 4, minBuyIn: '20K' },
];

const playerInfo = {
    name: '소현',
    chips: 3805782,
    avatarUrl: 'https://via.placeholder.com/60/228B22/FFFFFF?text=소현',
};

// Sub-component: TableListItem
const TableListItem = ({ table, onJoin }) => {
    const { id, betLevel, currentPlayers, maxPlayers, minBuyIn } = table;
    const hearts = Array.from({ length: maxPlayers }, (_, index) => (
        <span key={index} className={`heart ${index < currentPlayers ? 'heart-full' : 'heart-empty'}`}>
            ♥
        </span>
    ));

    return (
        <div className="table-row">
            <div className="table-cell">{id}</div>
            <div className="table-cell bet-level">{betLevel}</div>
            <div className="table-cell hearts-container">{hearts}</div>
            <div className="table-cell">{minBuyIn}</div>
            <div className="table-cell">
                <button className="join-btn" onClick={() => onJoin(id)}>
                    Tham gia
                </button>
            </div>
        </div>
    );
};

// Main Component: TableSelect
const TableSelect = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('Tập Sự');
    const levels = ['Tập Sự', 'Nghiệp Dư', 'Chuyên Nghiệp', 'Master'];

    // Đóng modal khi không isOpen
    if (!isOpen) return null;

    // Placeholder cho Socket.io (UC7: Tham gia bàn, UC5: Chơi real-time)
    const handleJoin = (tableId) => {
        // TODO: socket.emit('joinTable', { tableId, playerId: playerInfo.id });
        console.log(`Join table ${tableId}`); // Demo
        // Chuyển route đến game room (UC5)
    };

    const handleClose = () => {
        if (onClose) onClose();
    };

    // Filter tables theo tab (UC3: Chọn chế độ - Demo logic)
    const filteredTables = tableData.filter(table => {
        const betMap = { 'Tập Sự': 5, 'Nghiệp Dư': 10, 'Chuyên Nghiệp': 20, 'Master': 50 };
        return parseInt(table.betLevel) <= (betMap[activeTab] || 50);
    });

    return (
        <div className="lobby-overlay" onClick={(e) => {
            if (e.target.classList.contains('lobby-overlay')) {
                handleClose();
            }
        }}>
            <div className="lobby-container">
                {/* Header */}
                <div className="header-nav">
                    <h2 className="lobby-title">CHỌN BÀN CHƠI</h2>
                    <button className="home-icon" onClick={handleClose}>✕</button>
                </div>

                {/* Table List */}
                <div className="table-container">
                    <div className="table-header">
                        <div className="table-cell room-col">Phòng →</div>
                        <div className="table-cell">Mức cược</div>
                        <div className="table-cell">Số người</div>
                        <div className="table-cell">Tối thiểu</div>
                        <div className="table-cell">Trạng thái</div>
                    </div>
                    <div className="table-scroll">
                        {filteredTables.map((table) => (
                            <TableListItem key={table.id} table={table} onJoin={handleJoin} />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="footer">
                    <div className="player-info">
                        <img src={playerInfo.avatarUrl} alt="Avatar" className="avatar" />
                        <div>
                            <div className="player-name">{playerInfo.name}</div>
                            <div className="player-chips">{playerInfo.chips.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="level-tabs">
                        {levels.map((level) => (
                            <button
                                key={level}
                                onClick={() => setActiveTab(level)}
                                className={`tab-btn ${activeTab === level ? 'active' : ''}`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableSelect;
