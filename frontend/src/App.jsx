import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Ranking from './components/ranking/Ranking';
import Room from './pages/room/Room';
import PokerRules from './components/RuleScreen/PokerRules';
import MatchResultScreen from './pages/MatchResultScreen/MatchResultScreen';

export default function App() {
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [isRuleOpen, setIsRuleOpen] = useState(false);

  const handleOpenRanking = () => {
    if (!isRankingOpen) { // Chỉ mở nếu chưa mở
      setIsRankingOpen(true);
    }
  };

  const handleOpenRule = () => {
    if (!isRuleOpen) { // Chỉ mở nếu chưa mở
      setIsRuleOpen(true);
    }
  };

  return (
    <BrowserRouter>
      <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
        <Link to="/">Home</Link>
        <span style={{ margin: '0 8px' }}>|</span>
        <button 
          onClick={handleOpenRanking}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: isRankingOpen ? 'not-allowed' : 'pointer',
            textDecoration: 'underline',
            fontSize: '16px',
            padding: 0
          }}
        >
          Ranking
        </button>
        <span style={{ margin: '0 8px' }}>|</span>
        <Link to="/room">Room</Link>
        <span style={{ margin: '0 8px' }}>|</span>
        <Link to="/match-result">Match Result</Link>
        <span style={{ margin: '0 8px' }}>|</span>
        <button
          onClick={handleOpenRule}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: isRuleOpen ? 'not-allowed' : 'pointer',
            textDecoration: 'underline',
            fontSize: '16px',
            padding: 0
          }}
        >
            View Rule Screen Example
        </button>
      </nav>

      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<div><h1>Welcome to Card Game</h1></div>} />
          <Route path="/room" element={<Room />} />
          <Route path="/match-result" element={<MatchResultScreen />} />
        </Routes>
      </div>

      {/* Ranking Modal */}
      <Ranking isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} />
      
      {/* Rule Modal */}
      <PokerRules isOpen={isRuleOpen} onClose={() => setIsRuleOpen(false)} />
    </BrowserRouter>
  );
}
