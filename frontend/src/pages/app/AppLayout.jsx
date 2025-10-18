import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Ranking from '../../components/ranking/Ranking';
import PokerRules from '../../components/RuleScreen/PokerRules';

export default function AppLayout() {
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [isRuleOpen, setIsRuleOpen] = useState(false);

  const handleOpenRanking = () => {
    if (!isRankingOpen) setIsRankingOpen(true);
  };
  const handleOpenRule = () => {
    if (!isRuleOpen) setIsRuleOpen(true);
  };

  return (
    <div>
      <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
        <Link to="/app">Home</Link>
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
        <Link to="/app/room">Room</Link>
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
        <Outlet />
      </div>

      <Ranking isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} />
      <PokerRules isOpen={isRuleOpen} onClose={() => setIsRuleOpen(false)} />
    </div>
  );
}
