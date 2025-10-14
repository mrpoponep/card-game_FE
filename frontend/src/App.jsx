import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Ranking from './pages/rangking/Ranking';
import Room from './pages/room/Room';

export default function App() {
  const [isRankingOpen, setIsRankingOpen] = useState(false);

  return (
    <BrowserRouter>
      <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
        <Link to="/">Home</Link>
        <span style={{ margin: '0 8px' }}>|</span>
        <button 
          onClick={() => setIsRankingOpen(true)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#0078d4', 
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '16px',
            padding: 0
          }}
        >
          Ranking
        </button>
        <span style={{ margin: '0 8px' }}>|</span>
        <Link to="/room">Room</Link>
      </nav>

      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<div><h1>Welcome to Card Game</h1></div>} />
          <Route path="/room" element={<Room />} />
        </Routes>
      </div>

      {/* Ranking Modal */}
      <Ranking isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} />
    </BrowserRouter>
  );
}
