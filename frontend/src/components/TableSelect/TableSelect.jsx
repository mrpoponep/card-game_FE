import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGetPublicTables, apiJoinTable } from '../../api';
import './TableSelect.css';

// Sub-component: TableListItem
const TableListItem = ({ table, onJoin, isJoining }) => {
    // Đảm bảo dữ liệu là số trước khi format, loại bỏ các ký tự không phải số nếu cần
    const formatNumber = (val) => {
        if (!val) return "0";
        // Nếu val là chuỗi "50.000", ta bỏ dấu chấm đi rồi mới chuyển thành Number
        const cleanVal = typeof val === 'string' ? val.replace(/\./g, '') : val;
        return Number(cleanVal).toLocaleString('vi-VN');
    };

    const { roomCode, betLevel, currentPlayers, maxPlayers, minBuyIn } = table;
    
    const hearts = Array.from({ length: maxPlayers || 0 }, (_, index) => (
        <span key={index} className={`heart ${index < currentPlayers ? 'heart-full' : 'heart-empty'}`}>
            {index < currentPlayers ? '❤️' : '🤍'}
        </span>
    ));

    const isFull = currentPlayers >= maxPlayers;

    return (
        <div className="table-row">
            <div className="table-cell room-code">{roomCode}</div>
            <div className="table-cell">{betLevel}</div>
            <div className="table-cell">
                <div className="hearts-container">
                    {hearts}
                </div>
            </div>
            <div className="table-cell">{minBuyIn}</div>
            <div className="table-cell">
                <button
                    className="join-btn"
                    onClick={() => onJoin(roomCode)}
                    disabled={isFull || isJoining}
                >
                    {isFull ? 'Đầy' : isJoining ? '...' : 'Vào'}
                </button>
            </div>
        </div>
    );
};

// Main Component: TableSelect
const TableSelect = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Tập Sự');
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [joining, setJoining] = useState(false);

    const levels = ['Tập Sự', 'Nghiệp Dư', 'Chuyên Nghiệp', 'Master'];

    // Map UI level sang API level
    const levelMap = {
        'Tập Sự': 'beginner',
        'Nghiệp Dư': 'amateur',
        'Chuyên Nghiệp': 'pro',
        'Master': 'master'
    };

    // Fetch tables function (wrap với useCallback để tránh infinite loop)
    const fetchTables = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const apiLevel = levelMap[activeTab];
            const data = await apiGetPublicTables(apiLevel);

            if (data.success) {
                setTables(data.tables || []);
            } else {
                setError('Không thể tải danh sách bàn');
            }
        } catch (err) {
            console.error('Error fetching tables:', err);
            setError('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    }, [activeTab]); // Chỉ tạo lại khi activeTab thay đổi

    // Fetch tables khi mở modal hoặc đổi tab
    useEffect(() => {
        if (isOpen) {
            fetchTables();
        }
    }, [isOpen, fetchTables]);

    // Đóng modal khi không isOpen (PHẢI sau tất cả hooks)
    if (!isOpen) return null;

    const handleJoin = async (roomCode) => {
        if (joining) return;

        console.log('🎯 Attempting to join room:', roomCode);
        setJoining(true);

        try {
            console.log('📡 Calling apiJoinTable...');
            const data = await apiJoinTable(roomCode);
            console.log('📥 API Response:', data);

            if (data && data.success) {
                console.log('✅ Join successful! Navigating to room...');
                // Đóng modal trước
                if (onClose) onClose();
                // Navigate đến room
                navigate(`/room/${roomCode}`);
            } else {
                console.error('❌ Join failed:', data?.message);
            }
        } catch (err) {
            console.error('💥 Error joining table:', err);
        } finally {
            setJoining(false);
        }
    };

    const handleClose = () => {
        if (onClose) onClose();
    };

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
                        {loading && (
                            <div className="loading-message">
                                <div>🃏 Đang tải danh sách bàn...</div>
                            </div>
                        )}
                        {error && (
                            <div className="error-message">
                                ⚠️ {error}
                            </div>
                        )}
                        {!loading && !error && tables.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-icon">🎴</div>
                                <h3 className="empty-title">Chưa có bàn chơi nào</h3>
                                <p className="empty-description">
                                    Hiện tại không có bàn chơi {activeTab} nào đang hoạt động.
                                    Vui lòng thử lại sau hoặc chọn mức độ khác.
                                </p>
                            </div>
                        )}
                        {!loading && !error && tables.map((table) => (
                            <TableListItem
                                key={table.roomCode}
                                table={table}
                                onJoin={handleJoin}
                                isJoining={joining}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="footer">
                    {/* Player Info */}
                    <div className="player-info-section">
                        <div className="player-stat">
                            <span className="player-stat-label">Người chơi</span>
                            <span className="player-stat-value">{user?.username || 'Guest'}</span>
                        </div>
                        <div className="player-stat">
                            <span className="player-stat-label">Số dư</span>
                            <span className="player-chips-value">
                                {(user?.balance || 0).toLocaleString('vi-VN')} chip
                            </span>
                        </div>
                    </div>

                    {/* Level Tabs */}
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
