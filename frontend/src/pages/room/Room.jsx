import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext'; // 🔹 IMPORT SOCKET
import './Room.css';

// Hàm helper để format tiền
const formatMoney = (amount) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount;
};

// Component Ghế ngồi (để tái sử dụng)
const PlayerSeat = ({ seatPosition, player, isAI = false }) => {
  return (
    <div className={`player-seat ${seatPosition}`}>
      <div className={`player-avatar ${isAI ? 'ai' : ''}`}>
        {player ? (
          <img src={`http://localhost:3000/avatars/${player.avatar_url}`} alt="Avatar" />
        ) : (
          <span>{isAI ? 'AI' : ''}</span>
        )}
      </div>
      <div className="player-info">
        <div>{player ? player.username : (isAI ? 'AI' : 'Chờ...')}</div>
        {player && (
          <div className="player-balance">
            {formatMoney(player.balance)}
          </div>
        )}
      </div>
    </div>
  );
};


function Room() {
  const { roomCode } = useParams();
  const { user } = useAuth(); // User của chính mình
  const { socket } = useSocket(); // Socket connection
  const navigate = useNavigate();

  // 🔹 STATE LƯU TRỮ DANH SÁCH NGƯỜI CHƠI
  // Server sẽ gửi về mảng [user1, user2, ...]
  const [players, setPlayers] = useState([]); 

  // 🔹 LOGIC KẾT NỐI SOCKET
  useEffect(() => {
    // Chỉ chạy khi có đủ thông tin
    if (!socket || !user || !roomCode) return;

    // 1. Gửi sự kiện: "Tôi đã vào phòng"
    socket.emit('joinRoom', { roomCode, user });
    console.log(`Emitting joinRoom for ${user.username} in ${roomCode}`);

    // 2. Lắng nghe sự kiện: "Cập nhật danh sách"
    const handleUpdate = (playerList) => {
      console.log('Received player list update:', playerList);
      setPlayers(playerList);
    };
    socket.on('updatePlayerList', handleUpdate);

    // 3. Xử lý khi rời trang (cleanup function)
    return () => {
      console.log(`Emitting leaveRoom for ${user.username}`);
      socket.emit('leaveRoom');
      socket.off('updatePlayerList', handleUpdate);
    };
  }, [socket, roomCode, user, navigate]); // Phụ thuộc vào các giá trị này


  const handleExit = () => {
    navigate('/'); // `useEffect` cleanup sẽ tự động gửi 'leaveRoom'
  };

  // 🔹 LOGIC HIỂN THỊ NGƯỜI CHƠI
  // Tách biệt bản thân và những người khác
  // Chúng ta cần đảm bảo localUser luôn ở ghế dưới cùng (seat-1)
  const localUser = players.find(p => p.user_id === user.user_id);
  const otherPlayers = players.filter(p => p.user_id !== user.user_id);

  return (
    <div className="room-page-container">
      
      {/* Header (Ping, Thoát) */}
      <div className="room-header">
        <div className="ping">📶 48ms</div>
        <button className="exit-btn" onClick={handleExit} title="Thoát phòng">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.09 15.59L11.5 17L16.5 12L11.5 7L10.09 8.41L12.67 11H3V13H12.67L10.09 15.59M19 3H5C3.9 3 3 3.9 3 5V9H5V5H19V19H5V15H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" />
          </svg>
        </button>
      </div>

      {/* Bàn chơi */}
      <div className="game-table">
        <div className="table-inner-border"></div>

        {/* Thông báo giữa bàn */}
        <div className="table-center-message">
          <div className="main-message">Ván đấu sẽ bắt đầu sau</div>
          <div className="sub-message">Mã phòng: {roomCode}</div>
        </div>

        {/* 🔹 HIỂN THỊ CÁC GHẾ DỰA TRÊN STATE */}
        <PlayerSeat 
          seatPosition="seat-1" 
          player={localUser} // Luôn là user của chính mình
        />
        <PlayerSeat 
          seatPosition="seat-2" 
          player={otherPlayers[0] || null} // Người chơi khác 1
        />
        <PlayerSeat 
          seatPosition="seat-3" 
          player={otherPlayers[1] || null} // Người chơi khác 2
        />
        <PlayerSeat 
          seatPosition="seat-4" 
          player={otherPlayers[2] || null} // Người chơi khác 3
        />

      </div>
    </div>
  );
}

export default Room;