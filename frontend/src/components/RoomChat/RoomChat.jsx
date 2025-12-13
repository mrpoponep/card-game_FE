import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import './RoomChat.css';

export default function RoomChat({ isOpen, onClose, roomCode }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messageListRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isOpen]); // Scroll khi có tin mới hoặc khi mở chat

  // Listen for messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    };

    socket.on('receiveRoomMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveRoomMessage', handleReceiveMessage);
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = currentMessage.trim();
    if (!text || !socket || !roomCode) return;
    socket.emit('sendRoomMessage', { roomCode, text });
    setCurrentMessage('');
  };

  return (
    <div className={`room-chat-sidebar ${isOpen ? 'active' : ''}`}>
      <div className="room-chat-header">
        <h3>Chat Phòng ({roomCode})</h3>
        <button className="room-chat-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="room-chat-content">
        <div className="room-chat-messages" ref={messageListRef}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#aaa', marginTop: 20, fontSize: 14 }}>
              Chưa có tin nhắn nào.<br/>Hãy nói "Xin chào"!
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`chat-message-item ${msg.userId === user?.userId ? 'my-message' : ''}`}
            >
              {msg.userId !== user?.userId && (
                <div className="message-sender">{msg.username}</div>
              )}
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
        </div>

        <form className="room-chat-form" onSubmit={handleSendMessage}>
          <input 
            type="text"
            className="room-chat-input"
            placeholder="Chat..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
          />
          <button 
            type="submit" 
            className="room-chat-send-btn"
            disabled={!currentMessage.trim()}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}