import React, { useState } from 'react';
import PokerRules from '../../components/RuleScreen/PokerRules';

function App() {
  const [showRules, setShowRules] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShowRules(!showRules)}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
        }}
      >
        {showRules ? 'Ẩn' : 'Xem'} Hướng Dẫn
      </button>

      {showRules && <PokerRules onClose={() => setShowRules(false)} />}
    </div>
  );
}

export default App;
