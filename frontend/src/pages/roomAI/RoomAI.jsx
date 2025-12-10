import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Card from '../../components/Card/Card';
import '../room/Room.css';

const formatMoney = (amount) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount;
};

const PlayerSeat = ({ seatPosition, player, hand = [], isLocalPlayer = false, isActive, gameStatus }) => {
  const showCardsFaceUp = isLocalPlayer;
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
  const activeClass = isActive ? 'active-turn-glow' : '';

  const isGameRunning = ['playing', 'preflop', 'flop', 'turn', 'river', 'showdown'].includes(gameStatus);

  return (
    <div className={`player-seat ${seatPosition}`}>
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
          <img src={`${SERVER_URL}/avatar/${player.user_id || 'default.png'}`} alt="Avatar" onError={(e)=>{e.target.src=`${SERVER_URL}/avatar/default.png`}} />
        ) : null}
      </div>

      <div className="seat-player-info">
        <div className="player-name">{player ? player.username : 'Ghế Trống'}</div>
        {player && (
          <>
            <div className="player-chips">💰 {formatMoney(player.chips)}</div>
            {player.folded && <div className="status-badge folded">Bỏ bài</div>}
            {player.allIn && <div className="status-badge allin">All-in</div>}
            {!player.inHand && !player.folded && isGameRunning && (
                <div className="status-badge waiting">Chờ ván sau</div>
            )}
            {(gameStatus === 'waiting' || gameStatus === 'countdown') && (
                 <div className="status-badge ready" style={{backgroundColor: '#2ecc71', color: 'white'}}>Sẵn sàng</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

function RoomAI() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [seats, setSeats] = useState([]);
  const [roomSettings, setRoomSettings] = useState({ max_players: 2, small_blind: 100 });
  const [gameState, setGameState] = useState({ status: 'waiting' });
  const [myHand, setMyHand] = useState([]);
  const [showRaisePopup, setShowRaisePopup] = useState(false);
  const [raiseValue, setRaiseValue] = useState(0);

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
      socket.emit('ai:playerAction', { action, amount });
      setShowRaisePopup(false);
  };

  const seatsRef = useRef([]);
  useEffect(() => { seatsRef.current = seats; }, [seats]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('ai:joinRoom');

    const handleRoomUpdate = (data) => {
      setSeats(data.seats || []);
      setRoomSettings(data.settings);
      setGameState(data.gameState);
    };
    const handleHandUpdate = (hand) => { setMyHand(hand); };
    const handleForceLeave = () => { navigate('/'); };

    socket.on('ai:updateRoomState', handleRoomUpdate);
    socket.on('ai:updateMyHand', handleHandUpdate);
    socket.on('ai:forceLeave', handleForceLeave);

    return () => {
      socket.emit('ai:leaveRoom');
      socket.off('ai:updateRoomState', handleRoomUpdate);
      socket.off('ai:updateMyHand', handleHandUpdate);
      socket.off('ai:forceLeave', handleForceLeave);
    };
  }, [socket, user, navigate]);

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
    const visualPositions = ["seat-1", "seat-3"]; // two-player layout
    const localPlayerId = user?.userId;

    return [0,1].map((i)=>{
      const player = seats[i];
      const cssClass = visualPositions[i];
      return (
        <PlayerSeat
          key={`seat-${i}`}
          seatPosition={cssClass}
          player={player}
          hand={player ? getHandForPlayer(player.user_id, player) : []}
          isLocalPlayer={player?.user_id === localPlayerId}
          isActive={player?.isActing}
          gameStatus={gameState.status}
        />
      );
    });
  };

  const getCenterMessage = () => {
      switch (gameState.status) {
          case 'countdown':
              return { main: `Bắt đầu: ${gameState.countdown}s`, sub: "Chuẩn bị..." };
          case 'playing': case 'preflop': case 'flop': case 'turn': case 'river':
              return { main: `Pot: ${formatMoney(gameState.pot)}`, sub: gameState.lastAction || "" };
          case 'finished':
              return { main: "Kết thúc", sub: gameState.lastAction || "Đang chia thưởng..." };
          case 'waiting':
          default:
              return { main: "Sẵn sàng", sub: "Đang chuẩn bị bắt đầu..." };
      }
  };
  const centerMsg = getCenterMessage();

  return (
    <div className="room-page-container">
      <div className="room-header">
        <div className="left-controls">
            <button className="exit-btn" onClick={()=>{socket?.emit('ai:leaveRoom', ()=>navigate('/'));}} title="Thoát phòng">✕</button>
            <div className="room-info-box">
                <div className="info-item">
                    <span className="info-label">Cược</span>
                    <span className="info-value">{formatMoney(roomSettings?.small_blind || 0)}/{formatMoney((roomSettings?.small_blind || 0) * 2)}</span>
                </div>
            </div>
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

      {isMyTurn && isInHand && (
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
    </div>
  );
}

export default RoomAI;
