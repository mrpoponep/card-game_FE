import React, {useState, useEffect, useCallback, useRef} from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useModalAnimation } from "../../hooks/useModalAnimation";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import "./GlobalChat.css";

export default function GlobalChat({isOpen, onClose}) {
    useEscapeKey(isOpen, onClose);

    const { user } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const messageListRef = useRef(null);

    useEffect( () => {
        if (messageListRef.current){
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!socket) return;
        const handleReceiveMessage = (newMessage) => {
            setMessages(prevMessages => [...prevMessages, newMessage]);
        };
        if (isOpen){
            socket.emit('joinGlobalChat');
            socket.on('receiveGlobalMessage', handleReceiveMessage);
        }
        return () => {
            if (isOpen){
                socket.emit('leaveGlobalChat');
            }
            socket.off('receiveGlobalMessage', handleReceiveMessage);
        };

    }, [socket, isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const text = currentMessage.trim();
        if (text && socket){
            socket.emit('sendGlobalMessage', { text });
            setCurrentMessage("");
        }
    };
    return (
    <div className={`global-chat-sidebar ${isOpen ? 'active' : ''}`}>
            <button className="global-chat-close-btn" onClick={onClose}>✕</button>
        
        <div className="global-chat-header">
          <h2>Chat Tổng</h2>
        </div>
        
        <div className="global-chat-content">
          <div className="global-chat-messages" ref={messageListRef}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`chat-message-item ${msg.userId === user.userId ? 'my-message' : ''}`}
              >
                {msg.userId !== user.userId && (
                  <div className="message-sender">{msg.username}</div>
                )}
                <div className="message-text">{msg.text}</div>
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>

          <form className="global-chat-form" onSubmit={handleSendMessage}>
            <input 
              type="text"
              className="global-chat-input"
              placeholder="Nhập tin nhắn..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
            />
            <button 
              type="submit" 
              className="global-chat-send-btn"
              disabled={!currentMessage.trim()}
            >
              Gửi
            </button>
          </form>
        </div>
    </div>
  );
}