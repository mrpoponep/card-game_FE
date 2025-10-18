import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import Ranking from '../../components/ranking/Ranking';
import PokerRules from '../../components/RuleScreen/PokerRules';

export default function AppLayout() {
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [isRuleOpen, setIsRuleOpen] = useState(false);
  const { logout, user } = useAuth();

  const handleOpenRanking = () => {
    if (!isRankingOpen) setIsRankingOpen(true);
  };
  const handleOpenRule = () => {
    if (!isRuleOpen) setIsRuleOpen(true);
  };

  return (
    <div>
      <nav style={{ padding: 12, borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
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
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && <span style={{ fontSize: '14px', color: '#666' }}>👤 {user.username}</span>}
          <button 
            onClick={logout}
            style={{ 
              background: '#dc3545', 
              color: 'white',
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '6px 12px',
              fontWeight: '500'
            }}
          >
            Đăng xuất
          </button>
        </div>
      </nav>

      <div style={{ padding: 16 }}>
        <Outlet />
      </div>

      <Ranking isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} />
      <PokerRules isOpen={isRuleOpen} onClose={() => setIsRuleOpen(false)} />
    </div>
  );
}
