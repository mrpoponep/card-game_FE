import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Card from '../../components/Card/Card';
import RoomChat from '../../components/RoomChat/RoomChat';
import MatchResultModal from '../../components/MatchResult/MatchResultModal';
import './Room.css';

// Format tiền (1000 -> 1K)
const formatMoney = (amount) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount;
};

// Component Ghế ngồi
// THÊM PROP: gameStatus
const PlayerSeat = ({ seatPosition, player, hand = [], isLocalPlayer = false, isActive, gameStatus }) => {
  const showCardsFaceUp = isLocalPlayer;
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
  const activeClass = isActive ? 'active-turn-glow' : '';

  // Kiểm tra xem game có đang diễn ra hay không (để hiện trạng thái Chờ ván sau)
  const isGameRunning = ['playing', 'preflop', 'flop', 'turn', 'river', 'showdown'].includes(gameStatus);

  return (
    <div className={`player-seat ${seatPosition}`}>
      
      {/* Badge Tiền Cược */}
      {player && player.betThisRound > 0 && (
        <div className="player-bet-badge-floating">
           <span className="chip-icon">🪙</span> {formatMoney(player.betThisRound)}
        </div>
      )}

      <div className={`player-hand ${player?.folded ? 'hand-folded' : ''}`}>
        {hand && hand.length > 0 ? (
          hand.map((card, index) => (
            <Card
              key={index}
              suit={card.suit}
              rank={card.rank}
              faceUp={isLocalPlayer || (card.rank && card.suit)} 
            />
          ))
        ) : (
          player && !player.folded && player.inHand && (
            <>
               <Card faceUp={false} />
               <Card faceUp={false} />
            </>
          )
        )}
        
        {player?.handName && (
            <div className="hand-result-badge">{player.handName}</div>
        )}
      </div>

      <div className={`player-avatar ${!player ? 'empty' : ''} ${activeClass}`}>
        {player ? (
          <img src={`${SERVER_URL}/avatar/${player.user_id}`} alt="Avatar" />
        ) : null}
      </div>
      
      <div className="player-info">
        <div className="player-name">{player ? player.username : 'Ghế Trống'}</div>
        {player && (
          <>
            <div className="player-chips">💰 {formatMoney(player.chips)}</div>
            {player.folded && <div className="status-badge folded">Bỏ bài</div>}
            {player.allIn && <div className="status-badge allin">All-in</div>}
            
            {/* --- LOGIC HIỂN THỊ TRẠNG THÁI MỚI --- */}
            {/* 1. Nếu game đang chạy mà không inHand -> Chờ ván sau */}
            {!player.inHand && !player.folded && isGameRunning && (
                <div className="status-badge waiting">Chờ ván sau</div>
            )}
            {/* 2. Nếu game đang waiting/countdown -> Sẵn sàng */}
            {(gameStatus === 'waiting' || gameStatus === 'countdown') && (
                 <div className="status-badge ready" style={{backgroundColor: '#2ecc71', color: 'white'}}>Sẵn sàng</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

function Room() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [seats, setSeats] = useState([]);
  const [roomSettings, setRoomSettings] = useState(location.state?.roomSettings || null);
  const [gameState, setGameState] = useState({ status: 'waiting' });
  const [myHand, setMyHand] = useState([]);
  const [isSpectator, setIsSpectator] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showRaisePopup, setShowRaisePopup] = useState(false);
  const [raiseValue, setRaiseValue] = useState(0);

  // Match result modal state
  const [showMatchResult, setShowMatchResult] = useState(false);
  const [matchResultData, setMatchResultData] = useState(null);
  const prevGameStatusRef = useRef(null);

  const localPlayerSeat = seats.find(s => s && s.user_id === user?.userId);
  const isMyTurn = localPlayerSeat?.isActing || false;
  const isInHand = localPlayerSeat?.inHand || false;

  const minRaise = (gameState.currentBet || 0) + (gameState.minRaise || 0);
  const maxRaise = localPlayerSeat?.chips || 0;
  const currentCallAmount = (gameState.currentBet || 0) - (localPlayerSeat?.betThisRound || 0);

  useEffect(() => {
      if (isMyTurn) {
          setRaiseValue(Math.min(minRaise, maxRaise));
      } else {
          setShowRaisePopup(false); 
      }
  }, [isMyTurn, minRaise, maxRaise]);

  const handleAction = (action, amount = 0) => {
      if(!socket) return;
      socket.emit('playerAction', { action, amount });
      setShowRaisePopup(false);
  };

  // Store seats ref for use in handleGameResult
  const seatsRef = useRef([]);
  useEffect(() => {
    seatsRef.current = seats;
  }, [seats]);

  useEffect(() => {
    if (!socket || !user || !roomCode) return;
    const initialSettings = location.state?.roomSettings || null;
    socket.emit('joinRoom', { roomCode, settings: initialSettings });

    const handleRoomUpdate = (data) => {
      setSeats(data.seats || []);
      setRoomSettings(data.settings);
      setGameState(data.gameState);
      setIsSpectator(false);
    };
    const handleHandUpdate = (hand) => { setMyHand(hand); };
    const handleSpectatorMode = (status) => { setIsSpectator(status); setMyHand([]); };

    const handleGameResult = (result) => {
      const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
      const winnerIds = result.winners.map(w => w.userId);

      // Build players list from current seats
      const players = seatsRef.current
        .filter(s => s !== null)
        .map(seat => {
          const isWinner = winnerIds.includes(seat.user_id);
          const winnerInfo = result.winners.find(w => w.userId === seat.user_id);
          return {
            id: seat.user_id,
            name: seat.username,
            avatar: `${SERVER_URL}/avatar/${seat.user_id}`,
            isWinner: isWinner,
            handName: winnerInfo?.handName || seat.handName || null,
            chipsChange: isWinner ? (winnerInfo?.amount || 0) : -(seat.totalBet || 0)
          };
        });

      setMatchResultData({
        roomCode: roomCode,
        players: players,
        winners: result.winners
      });
      setShowMatchResult(true);
    };

    socket.on('updateRoomState', handleRoomUpdate);
    socket.on('updateMyHand', handleHandUpdate);
    socket.on('spectatorMode', handleSpectatorMode);
    socket.on('game:result', handleGameResult);

    return () => {
      socket.emit('leaveRoom');
      socket.off('updateRoomState', handleRoomUpdate);
      socket.off('updateMyHand', handleHandUpdate);
      socket.off('spectatorMode', handleSpectatorMode);
      socket.off('game:result', handleGameResult);
    };
  }, [socket, roomCode, user, navigate]);

  // Auto-close match result modal when countdown starts
  useEffect(() => {
    if (gameState.status === 'countdown' && prevGameStatusRef.current === 'finished') {
      setShowMatchResult(false);
      setMatchResultData(null);
    }
    prevGameStatusRef.current = gameState.status;
  }, [gameState.status]);

  const handleExit = () => {
    if (socket) {
      socket.emit('leaveRoom', () => {
         navigate('/');
      });
    } else {
      navigate('/');
    }
  };

  const getHandForPlayer = (playerId, player) => {
      if (gameState.status === 'finished') {
          if (player?.cards && player.cards.length > 0) return player.cards;
          return [{ rank: '', suit: '' }, { rank: '', suit: '' }];
      }
      const activeStates = ['playing', 'preflop', 'flop', 'turn', 'river'];
      if (activeStates.includes(gameState.status) && player?.inHand) {
          if (playerId === user.userId) return myHand;
          return [{ rank: '', suit: '' }, { rank: '', suit: '' }];
      }
      return []; 
  };

  const renderSeats = () => {
    if (!roomSettings || !seats.length) return null;
    const renderedSeats = [];
    const max = parseInt(roomSettings.max_players, 10);
    const localPlayerId = user?.userId;
    const mySeatIndex = seats.findIndex(p => p?.user_id === localPlayerId);
    
    const visualPositionMap = {
        4: ["seat-1", "seat-2", "seat-3", "seat-4"],
        3: ["seat-1", "seat-2", "seat-4"],
        2: ["seat-1", "seat-3"],
    };
    const visualPositions = visualPositionMap[max] || visualPositionMap[4];
    const startIndex = (isSpectator || mySeatIndex === -1) ? 0 : mySeatIndex;

    for (let i = 0; i < max; i++) {
        const dataIndex = (startIndex + i) % max;
        const player = seats[dataIndex];
        const cssClass = visualPositions[i];
        if (cssClass) {
            renderedSeats.push(
                <PlayerSeat
                    key={`seat-${dataIndex}`}
                    seatPosition={cssClass}
                    player={player}
                    hand={player ? getHandForPlayer(player.user_id, player) : []}
                    isLocalPlayer={player?.user_id === localPlayerId}
                    isActive={player?.isActing}
                    gameStatus={gameState.status} // TRUYỀN STATUS VÀO ĐÂY
                />
            );
        }
    }
    return renderedSeats;
  };

  // --- LOGIC CENTER MESSAGE ĐÃ SỬA ---
  const getCenterMessage = () => {
      const playerCount = seats.filter(p => p).length;
      if (isSpectator) return { main: "Đang xem...", sub: "Vui lòng chờ ván sau" };
      
      // Kiểm tra xem game có đang chạy không
      const isGameRunning = ['playing', 'preflop', 'flop', 'turn', 'river', 'showdown'].includes(gameState.status);

      // Chỉ hiển thị "Vui lòng chờ" nếu game ĐANG CHẠY và mình không inHand
      if (isGameRunning && localPlayerSeat && !localPlayerSeat.inHand) {
          return { main: "Vui lòng chờ...", sub: "Bạn sẽ chơi ở ván sau" };
      }

      switch (gameState.status) {
          case 'countdown':
              return { main: `Bắt đầu: ${gameState.countdown}s`, sub: "Chuẩn bị..." };
          case 'playing': case 'preflop': case 'flop': case 'turn': case 'river':
              return { main: `Pot: ${formatMoney(gameState.pot)}`, sub: gameState.lastAction || "" };
          case 'finished':
              return { main: "Kết thúc", sub: gameState.lastAction || "Đang chia thưởng..." };
          case 'waiting':
          default:
              // Logic hiển thị khi chờ
              if (playerCount < 2) {
                  return { main: "Chờ người chơi...", sub: "Ván chơi bắt đầu khi có 2 người trở lên" };
              }
              // Khi đủ người, server sẽ chuyển sang countdown rất nhanh, nhưng hiển thị Sẵn sàng là hợp lý
              return { main: "Sẵn sàng", sub: "Đang chuẩn bị bắt đầu..." };
      }
  };
  const centerMsg = getCenterMessage();

  return (
    <div className="room-page-container">
      <div className="room-header">
        <div className="left-controls">
            <button className="exit-btn" onClick={handleExit} title="Thoát phòng">✕</button>
            <div className="room-info-box">
                <div className="info-item">
                    <span className="info-label">Ping</span>
                    <span className="info-value ping-value">24ms</span>
                </div>
                <div className="info-divider"></div>
                <div className="info-item">
                    <span className="info-label">Phòng</span>
                    <span className="info-value">#{roomCode}</span>
                </div>
                <div className="info-divider"></div>
                <div className="info-item">
                    <span className="info-label">Cược</span>
                    <span className="info-value">{formatMoney(roomSettings?.small_blind || 0)}/{formatMoney((roomSettings?.small_blind || 0) * 2)}</span>
                </div>
            </div>
        </div>
        <div className="right-controls">
            <button className="chat-toggle-btn" onClick={() => setIsChatOpen(!isChatOpen)}>💬</button>
        </div>
      </div>

      <div className="game-table">
        <div className="table-inner-border"></div>
        
        <div className={`table-center-message ${gameState.status !== 'waiting' && gameState.status !== 'countdown' && gameState.status !== 'finished' ? 'transparent-msg' : ''}`}>
          <div className="main-message">{centerMsg.main}</div>
          <div className="sub-message">{centerMsg.sub}</div>
        </div>

        <div className="community-cards">
            {gameState.communityCards?.map((card, index) => (
                <Card key={`comm-${index}`} suit={card.slice(1).toUpperCase()} rank={card.slice(0,1)} faceUp={true} />
            ))}
        </div>
        {renderSeats()}
      </div>

      {isMyTurn && !isSpectator && isInHand && (
          <div className="action-bar-right">
              <button className="game-btn fold-btn" onClick={() => handleAction('fold')}>BỎ BÀI</button>
              
              {currentCallAmount <= 0 ? (
                  <button className="game-btn check-btn" onClick={() => handleAction('check')}>XEM</button>
              ) : (
                  <button className="game-btn call-btn" onClick={() => handleAction('call')}>THEO {formatMoney(currentCallAmount)}</button>
              )}

              <div style={{ position: 'relative' }}>
                  {showRaisePopup && (
                      <div className="raise-popup-container">
                          <div className="raise-info-top">
                              <span>Tố thêm:</span>
                              <span className="raise-value-text">{formatMoney(raiseValue)}</span>
                          </div>
                          <input 
                              type="range" 
                              min={minRaise} 
                              max={maxRaise} 
                              step={100} 
                              value={raiseValue}
                              onChange={(e) => setRaiseValue(Number(e.target.value))}
                              className="raise-slider"
                          />
                          <button className="raise-confirm-btn" onClick={() => handleAction('raise', raiseValue)}>OK</button>
                      </div>
                  )}
                  <button 
                    className="game-btn raise-btn" 
                    onClick={() => setShowRaisePopup(!showRaisePopup)}
                    disabled={maxRaise <= minRaise}
                  >
                      TỐ THÊM...
                  </button>
              </div>
              
              <button className="game-btn allin-btn" onClick={() => handleAction('allin')}>TẤT TAY</button>
          </div>
      )}

      {/* Match Result Modal */}
      {showMatchResult && matchResultData && (
        <MatchResultModal
          matchData={matchResultData}
          onClose={() => {
            setShowMatchResult(false);
            setMatchResultData(null);
          }}
          onPlayAgain={() => {
            setShowMatchResult(false);
            setMatchResultData(null);
          }}
          onBackToMenu={() => {
            setShowMatchResult(false);
            setMatchResultData(null);
            if (socket) {
              socket.emit('leaveRoom', () => {
                navigate('/');
              });
            } else {
              navigate('/');
            }
          }}
        />
      )}

      <RoomChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} roomCode={roomCode} />
    </div>
  );
}

export default Room;