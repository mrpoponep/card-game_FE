import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Ranking from './components/ranking/Ranking';
import Room from './pages/room/Room';
import PokerRules from './components/RuleScreen/PokerRules';
import Home from './pages/home/Home';

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room" element={<Room />} />
      </Routes>

      {/* Ranking Modal */}
      <Ranking isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} />
      
      {/* Rule Modal */}
      <PokerRules isOpen={isRuleOpen} onClose={() => setIsRuleOpen(false)} />
    </BrowserRouter>
  );
}
