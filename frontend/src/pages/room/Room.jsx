import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Card from '../../components/Card/Card';
import './Room.css'; // Import CSS

// Hàm helper để định dạng tiền tệ
const formatMoney = (amount) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount;
};

// Component Ghế ngồi (đã cập nhật để hiển thị bài)
const PlayerSeat = ({ seatPosition, player, hand = [], isLocalPlayer = false }) => {
  // Chỉ hiển thị bài ngửa cho người chơi hiện tại
  const showCardsFaceUp = isLocalPlayer;
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
  return (
    <div className={`player-seat ${seatPosition}`}>
      {/* Hiển thị bài của người chơi */}
      <div className="player-hand">
        {hand && hand.length > 0 ? (
          hand.map((card, index) => (
            <Card
              key={index}
              suit={card.suit}
              rank={card.rank}
              faceUp={showCardsFaceUp} // Ngửa bài nếu là người chơi hiện tại
            />
          ))
        ) : (
          // Chỗ trống chờ chia bài hoặc khi không có bài
          <>
            <div className="card-placeholder"></div>
            <div className="card-placeholder"></div>
          </>
        )}
      </div>

      {/* Avatar và thông tin */}
      <div className={`player-avatar ${!player ? 'empty' : ''}`}>
        {player ? (
          <img src={`${SERVER_URL}/avatar/${player.user_id}`} alt="Avatar" />
        ) : null}
      </div>
      <div className="player-info">
        <div>{player ? player.username : 'Chờ...'}</div>
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
  const { roomCode } = useParams(); // Mã phòng từ URL
  const { user } = useAuth(); // Người chơi hiện tại
  const { socket } = useSocket(); // Kết nối Socket
  const navigate = useNavigate();
  const location = useLocation(); 
  console.log('Vào phòng với mã:', roomCode);
  const [seats, setSeats] = useState([]); // Danh sách seat trong phòng
  const [roomSettings, setRoomSettings] = useState(location.state?.roomSettings || null); // Cài đặt phòng
  const [gameState, setGameState] = useState({ status: 'waiting' }); // Trạng thái game từ server
  const [myHand, setMyHand] = useState([]); // Bài của người chơi hiện tại
  const [isSpectator, setIsSpectator] = useState(false); // Trạng thái xem


  useEffect(() => {
    // Chỉ chạy khi có đủ thông tin
    if (!socket || !user || !roomCode) return;

    // Lấy cài đặt ban đầu từ location state (chỉ dùng 1 lần khi mới vào)
    const initialSettings = location.state?.roomSettings || null;

    // 1. Gửi sự kiện: "Tôi đã vào phòng" (không gửi đối tượng user nữa; server dùng socket.user)
    socket.emit('joinRoom', {
      roomCode,
      settings: initialSettings // Gửi cài đặt ban đầu (hoặc null nếu là người vào sau)
    });
    console.log(`Gửi joinRoom (no user) cho ${user.username} trong phòng ${roomCode}`);

    // --- Lắng nghe các sự kiện từ server ---

    // Cập nhật toàn bộ trạng thái phòng
    const handleRoomUpdate = (data) => {
      console.log('Nhận cập nhật trạng thái phòng:', data);
      setSeats(data.seats || []); // Cập nhật danh sách seat công khai
      setRoomSettings(data.settings); // Cập nhật cài đặt phòng
      setGameState(data.gameState); // Cập nhật trạng thái game (status, countdown, bài chung, pot)
      setIsSpectator(false); // Reset trạng thái xem, trừ khi server bảo khác
    };
    socket.on('updateRoomState', handleRoomUpdate);

    // Cập nhật bài riêng của mình
    const handleHandUpdate = (hand) => {
      console.log('Nhận bài của mình:', hand);
      setMyHand(hand);
    };
    socket.on('updateMyHand', handleHandUpdate);

    // Cập nhật trạng thái xem
    const handleSpectatorMode = (status) => {
        console.log('Nhận trạng thái xem:', status);
        setIsSpectator(status);
        setMyHand([]); // Người xem không có bài
    };
    socket.on('spectatorMode', handleSpectatorMode);


    // --- Hàm dọn dẹp khi rời phòng ---
    return () => {
      console.log(`Gửi leaveRoom cho ${user.username}`);
      socket.emit('leaveRoom');
      // Gỡ bỏ các listener
      socket.off('updateRoomState', handleRoomUpdate);
      socket.off('updateMyHand', handleHandUpdate);
      socket.off('spectatorMode', handleSpectatorMode);
    };

  // Mảng dependency này đảm bảo useEffect chỉ chạy 1 lần khi vào phòng
  }, [socket, roomCode, user, navigate]);


  // Hàm xử lý khi bấm nút thoát
  const handleExit = () => {
    navigate('/'); // Hàm dọn dẹp của useEffect sẽ tự động gửi 'leaveRoom'
  };

  // --- Logic Render ---
  // Tìm người chơi hiện tại và những người khác
  // const localUser = players.find(p => p.user_id === user.user_id);
  // const otherPlayers = players.filter(p => p.user_id !== user.user_id);

  // Hàm lấy bài cho người chơi (để hiển thị bài úp của đối thủ)
  const getHandForPlayer = (playerId) => {
      // Nếu đang chia bài hoặc đang chơi
      if (gameState.status === 'dealing' || gameState.status === 'playing') {
          // Nếu là người chơi hiện tại, trả về bài thật
          if (playerId === user.userId) {
              return myHand;
          }
          // Với người khác, trả về 2 lá bài úp (dùng dữ liệu giả)
          return [{ rank: '?', suit: '?' }, { rank: '?', suit: '?' }];
      }
      return []; // Không có bài nếu chưa bắt đầu/chia
  };


  // Hàm render các ghế ngồi dựa trên số người tối đa
  const renderSeats = () => {
    if(!roomSettings || !seats.length) return null;
    const renderedSeats = [];
    const max = parseInt(roomSettings.max_players, 10);
    const localPlayerId = user?.userId;
    const mySeatIndex = seats.findIndex(p => p?.user_id === localPlayerId);
    if(isSpectator || mySeatIndex === -1){
      const visualMap = {
        4: ["seat-1", "seat-2", "seat-3", "seat-4"],
        3: ["seat-1", "seat-2", "seat-4"],
        2: ["seat-1", "seat-3"],
      };
      const positions = visualMap[max] || visualMap[4];
      for(let i = 0; i < max; i++){
        const player = seats[i] || null;
        if(positions[i]){
          renderedSeats.push(
            <PlayerSeat
              key={`seat-${i}`}
              seatPosition={positions[i]}
              player={player}
              hand={player ? getHandForPlayer(player.user_id) : []}
              isLocalPlayer={player?.user_id === localPlayerId}
            />
          );
        }
      }
      return renderedSeats;
    }
    const visualPositionMap = {
      4: ["seat-1", "seat-2", "seat-3", "seat-4"],
      3: ["seat-1", "seat-2", "seat-4"],
      2: ["seat-1", "seat-3"],
    };
    const visualPositions = visualPositionMap[max] || visualPositionMap[4];
    for(let i = 0; i < max; i++){
      const player = seats[i];
      const visualOffset = (i - mySeatIndex + max) % max;
      const cssClass = visualPositions[visualOffset];
      if(cssClass){
        renderedSeats.push(
          <PlayerSeat
            key={`seat-${i}`}
            seatPosition={cssClass}
            player={player}
            hand={player ? getHandForPlayer(player.user_id) : []}
            isLocalPlayer={i === mySeatIndex}
          />
        );
      }
    }
    return renderedSeats;
  };

  // Xác định thông báo hiển thị ở giữa bàn
  const getCenterMessage = () => {
    const playerCount = seats.filter(p => p).length;
      if (isSpectator) {
          return { main: "Đang xem...", sub: `Vui lòng chờ ván sau` };
      }
      switch (gameState.status) {
          case 'countdown':
              return { main: `Bắt đầu sau: ${gameState.countdown}s`, sub: `Mã phòng: ${roomCode}` };
          case 'dealing':
              return { main: "Đang chia bài...", sub: `Mã phòng: ${roomCode}` };
          case 'playing':
              // Hiển thị Pot trong khi chơi (nếu có)
              return { main: `Pot: ${gameState.pot || 0}`, sub: `Mã phòng: ${roomCode}` };
          case 'finished':
              return { main: "Ván bài kết thúc", sub: `Mã phòng: ${roomCode}` }; // Có thể hiển thị người thắng sau
          case 'waiting':
          default:
              // Chờ đủ người hoặc chờ ván mới
              return { main: playerCount >= 2 ? "Chuẩn bị ván mới..." : "Chờ người chơi...", sub: `Mã phòng: ${roomCode}` };
      }
  };
  const centerMsg = getCenterMessage();


  return (
    <div className="room-page-container">
      {/* Header: Ping và Nút Thoát */}
      <div className="room-header">
        <div className="ping">📶 --ms</div> {/* TODO: Cập nhật Ping sau */}
        <button className="exit-btn" onClick={handleExit} title="Thoát phòng">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.09 15.59L11.5 17L16.5 12L11.5 7L10.09 8.41L12.67 11H3V13H12.67L10.09 15.59M19 3H5C3.9 3 3 3.9 3 5V9H5V5H19V19H5V15H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" /></svg>
        </button>
      </div>

      {/* Bàn chơi */}
      <div className="game-table">
        <div className="table-inner-border"></div>

        {/* Thông báo giữa bàn */}
        <div className="table-center-message">
          <div className="main-message">{centerMsg.main}</div>
          <div className="sub-message">{centerMsg.sub}</div>
        </div>

        {/* Khu vực hiển thị bài chung (Community Cards) - Tạm ẩn */}
        <div className="community-cards">
            {/* {gameState.communityCards?.map((card, index) => (
                <Card key={index} suit={card.suit} rank={card.rank} faceUp={true} />
            ))} */}
        </div>

        {/* Render các ghế ngồi */}
        {renderSeats()}

      </div>
    </div>
  );
}

export default Room;
