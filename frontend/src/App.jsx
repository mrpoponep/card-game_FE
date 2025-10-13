import React, { useState } from 'react';
import PokerRules from './components/RuleScreen/PokerRules';

function App() {
  const [showRules, setShowRules] = useState(false);

  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    button: {
      background: 'white',
      color: '#667eea',
      border: 'none',
      padding: '1rem 2rem',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    },
  };

  return (
    <div style={styles.app}>
      <button
        style={styles.button}
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
