/*
RoomPoker_FE.jsx
React frontend cho bàn Poker tương tác với Socket.IO server.

Cập nhật:
- Chỉ cho phép hành động hợp lệ theo từng stage
- Ẩn/lật bài phù hợp theo state (showdown mới lật hết)
*/

import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3000";

// Simple card renderer
function Card({ code }) {
  const suit = code ? code.slice(-1) : null;
  const rank = code ? code.slice(0, code.length - 1) : null;
  const red = suit === "H" || suit === "D";

  const style = {
    display: "inline-block",
    width: 48,
    height: 68,
    borderRadius: 6,
    border: "1px solid #333",
    background: code === "??" ? "#ddd" : "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    textAlign: "center",
    lineHeight: "20px",
    paddingTop: 6,
    marginRight: 6,
    color: red ? "#c33" : "#111",
    fontWeight: 700,
  };

  return (
    <div style={style} className="card">
      {code && code !== "??" ? (
        <div>
          <div style={{ fontSize: 14 }}>{rank}</div>
          <div style={{ fontSize: 18 }}>{suit}</div>
        </div>
      ) : (
        <div style={{ color: "#888" }}>??</div>
      )}
    </div>
  );
}

// ================= Seat Component =================
function Seat({ seatIndex, player, isMe, onSit, gameState }) {
  const style = {
    width: 140,
    height: 140,
    borderRadius: 8,
    border: "1px dashed #ccc",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 8,
    background: player ? "#fff" : "#f6f6f6",
  };

  let blindLabel = "";
  if (player && gameState.sbIndex === seatIndex) blindLabel = "SB";
  if (player && gameState.bbIndex === seatIndex) blindLabel = "BB";

  const isShowdown = gameState?.stage === "showdown";

  return (
    <div style={style}>
      {player ? (
        <>
          <div style={{ fontWeight: "bold" }}>
            {player.username} {blindLabel && `(${blindLabel})`}
          </div>
          <div>Chips: {player.chips}</div>

          {/* Hiển thị bài */}
          {player.cards && player.cards.length > 0 && (
            <>
              {isMe || isShowdown ? (
                <div style={{ display: "flex", marginTop: 4 }}>
                  {player.cards.map((c, i) => (
                    <Card key={i} code={c} />
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", marginTop: 4 }}>
                  <Card code="??" />
                  <Card code="??" />
                </div>
              )}
            </>
          )}

          <div style={{ fontSize: 12, color: "#666" }}>Seat {seatIndex}</div>
          {isMe && <div style={{ color: "green", fontSize: 12 }}>You</div>}
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 6 }}>Empty</div>
          <button onClick={() => onSit(seatIndex)}>Sit</button>
        </div>
      )}
    </div>
  );
}

// ================= Controls Component =================
function Controls({ canAct, minRaise, onAction, currentBet, gameState }) {
  const [raiseAmount, setRaiseAmount] = useState(minRaise || 0);
  const stage = gameState?.stage || "waiting";
  const disabledStage = ["waiting", "showdown", "ended"].includes(stage);

  const allowedActions = [];
  if (!disabledStage) {
    allowedActions.push("fold", "call");
    if (gameState.currentBet === 0) allowedActions.push("check");
    allowedActions.push("raise");
  }

  useEffect(() => setRaiseAmount(minRaise || 0), [minRaise]);

  return (
    <div style={{ padding: 8, borderTop: "1px solid #eee" }}>
      <div style={{ marginBottom: 8 }}>
        <strong>Current bet:</strong> {currentBet}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          disabled={!canAct || !allowedActions.includes("fold")}
          onClick={() => onAction("fold")}
        >
          Fold
        </button>
        <button
          disabled={!canAct || !allowedActions.includes("call")}
          onClick={() => onAction("call")}
        >
          Call
        </button>
        <button
          disabled={!canAct || !allowedActions.includes("check")}
          onClick={() => onAction("check")}
        >
          Check
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="number"
            value={raiseAmount}
            min={minRaise}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            style={{ width: 100 }}
          />
          <button
            disabled={!canAct || !allowedActions.includes("raise")}
            onClick={() => onAction("raise", { amount: raiseAmount })}
          >
            Raise
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= Chat Component =================
function Chat({ messages, onSend }) {
  const [text, setText] = useState("");
  const ref = useRef();
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div ref={ref} style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <strong>{m.from}:</strong> {m.text}
            <div style={{ fontSize: 11, color: "#888" }}>{m.time}</div>
          </div>
        ))}
      </div>
      <form onSubmit={submit} style={{ display: "flex", gap: 6, padding: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Chat..."
          style={{ flex: 1 }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

// ================= Main Component =================
export default function RoomPoker() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [players, setPlayers] = useState(new Array(6).fill(null));
  const [myId, setMyId] = useState(null);
  const [chat, setChat] = useState([]);
  const [gameState, setGameState] = useState({
    community: [],
    pot: 0,
    currentBet: 0,
    minRaise: 10,
    toAct: null,
    stage: "waiting",
  });

  useEffect(() => {
    const s = io(SERVER_URL, { autoConnect: false });
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      setMyId(s.id);
    });
    s.on("disconnect", () => setConnected(false));

    s.on("room:info", (info) => {
      setRoomId(info.roomId);
      if (info.players) setPlayers(info.players);
      if (info.chat) setChat(info.chat);
      if (info.gameState)
        setGameState((gs) => ({ ...gs, ...info.gameState }));
    });

    s.on("game:update", ({ gameState, players }) => {
      if (gameState) setGameState(gameState);
      if (players) setPlayers(players);
    });

    s.on("game:holeCards", ({ cards }) => {
      setPlayers((prev) =>
        prev.map((p) => (p && p.id === s.id ? { ...p, cards } : p))
      );
    });

    s.on("game:showdown", ({ reveal }) => {
      setPlayers((prev) =>
        prev.map((p) => {
          const found = reveal.find((r) => r.username === p?.username);
          return found ? { ...p, cards: found.cards } : p;
        })
      );
    });

    s.on("player:joined", (p) => {
      setPlayers((prev) => {
        const next = [...prev];
        const idx = next.findIndex((x) => !x);
        if (idx >= 0) next[idx] = p;
        return next;
      });
      setChat((c) => [
        ...c,
        {
          from: "system",
          text: `${p.username} joined`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    });

    s.on("player:left", ({ playerId }) => {
      setPlayers((prev) =>
        prev.map((p) => (p && p.id === playerId ? null : p))
      );
    });

    s.on("chat:message", (m) => setChat((c) => [...c, m]));
    s.on("error", (e) =>
      setChat((c) => [
        ...c,
        {
          from: "server",
          text: e.message || e,
          time: new Date().toLocaleTimeString(),
        },
      ])
    );

    return () => s.close();
  }, []);

  const connectSocket = () => {
    if (!socket) return;
    if (!socket.connected) socket.connect();
  };

  const createRoom = (name) => {
    if (!socket) return;
    socket.emit("room:create", { roomName: name });
  };

  const joinRoom = (id) => {
    if (!socket) return;
    if (!username) return alert("Enter username first");
    socket.emit("room:join", { roomId: id, username });
  };

  const startGame = () => {
    if (!socket || !roomId) return;
    socket.emit("game:start", { roomId });
  };

  const onSit = (seatIndex) => {
    if (!socket) return;
    socket.emit("sit:request", { roomId, seatIndex });
  };

  const sendChat = (text) => {
    if (!socket) return;
    socket.emit("chat:message", { roomId, text });
    setChat((c) => [
      ...c,
      { from: username || "me", text, time: new Date().toLocaleTimeString() },
    ]);
  };

  const doAction = (action, opts) => {
    if (!socket) return;
    socket.emit("game:action", { roomId, action, ...opts });
  };

  return (
    <div style={{ padding: 12, fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="room id"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={connectSocket} disabled={connected}>
          Connect
        </button>
        <button onClick={() => createRoom(`room-${Date.now()}`)}>
          Create room
        </button>
        <button onClick={() => joinRoom(roomId)}>Join room</button>
        <button onClick={startGame}>Start Game</button>
        <div style={{ marginLeft: 12 }}>
          Status: {connected ? "connected" : "disconnected"}
        </div>
      </div>

      {/* Table + Chat */}
      <div style={{ display: "flex", gap: 12 }}>
        {/* Table */}
        <div
          style={{
            flex: 2,
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <div style={{ marginBottom: 8, fontWeight: "bold" }}>
            Poker Table — Room: {roomId}
          </div>

          {/* Community Cards */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div>
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                Community
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                {(gameState.community || []).map((c, i) => (
                  <Card key={i} code={c} />
                ))}
              </div>
            </div>
          </div>

          {/* Seats */}
          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {players.map((p, i) => (
              <Seat
                key={i}
                seatIndex={i}
                player={p}
                isMe={p && p.id === myId}
                onSit={onSit}
                gameState={gameState}
              />
            ))}
          </div>

          {/* Info + Controls */}
          <div style={{ marginTop: 12 }}>
            <div>Pot: {gameState.pot}</div>
            <div>Stage: {gameState.stage}</div>
          </div>

          <Controls
            canAct={gameState.toAct === myId}
            minRaise={gameState.minRaise}
            onAction={doAction}
            currentBet={gameState.currentBet}
            gameState={gameState}
          />
        </div>

        {/* Chat */}
        <div
          style={{
            width: 320,
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 8,
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>Chat</div>
          <div style={{ height: 420 }}>
            <Chat messages={chat} onSend={sendChat} />
          </div>
        </div>
      </div>
    </div>
  );
}
