import React, { useState } from 'react';
import PokerRules from './components/PokerRules';
import './App.css';

function App() {
  const [showRules, setShowRules] = useState(true);

  return (
    <div className="app">
      <div className="app-container">
        <h1>Card Game</h1>
        <button
          className="show-rules-btn"
          onClick={() => setShowRules(true)}
        >
          Xem Hướng Dẫn
        </button>

        {showRules && (
          <PokerRules onClose={() => setShowRules(false)} />
        )}
      </div>
    </div>
  );
}

export default App;

