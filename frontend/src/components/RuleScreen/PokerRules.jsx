import React, { useState, useCallback } from 'react';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import Card from '../Card/Card';
import './PokerRules.css';

// Helper component để render một dãy lá bài cho hand example
const HandExample = ({ cards }) => (
  <div className="hand-example-cards">
    {cards.map((card, index) => (
      <Card key={index} rank={card.rank} suit={card.suit} faceUp={true} size="mini" />
    ))}
  </div>
);

const PokerRules = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('rules');
  
  // Sử dụng custom hooks cho animation (290ms như Ranking)
  const { isClosing, isAnimating, handleClose, shouldRender } = useModalAnimation(isOpen, onClose, 290);
  
  // Xử lý phím ESC
  useEscapeKey(isOpen && !isClosing, handleClose, isAnimating);
  
  // Đóng popup khi click vào overlay
  const handleOverlayClick = useCallback((e) => {
    if (e.target.classList.contains('modal-overlay')) {
      handleClose();
    }
  }, [handleClose]);
  
  if (!shouldRender) return null;

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`modal-container poker-rules-modal ${isClosing ? 'closing' : ''}`}>
        <button className="modal-close-btn" onClick={handleClose}>✕</button>
        
        <div className="modal-header">
          <h2>HƯỚNG DẪN</h2>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            CÁCH CHƠI
          </button>
          <button
            className={`tab ${activeTab === 'betting' ? 'active' : ''}`}
            onClick={() => setActiveTab('betting')}
          >
            TÍNH ĐIỂM & THẮNG THUA
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'rules' && (
            <div className="rules-content">
              <div className="rule-section">
                <h3>Luật chơi Texas Hold'em Poker</h3>
                <p>+ Mỗi người chơi được chia 2 lá bài úp (hole cards).</p>
                <p>+ Có 4 vòng cược: Pre-flop, Flop (3 lá bài chung), Turn (1 lá bài chung), River (1 lá bài chung).</p>
                <p>+ Người chơi kết hợp 2 lá bài của mình với 5 lá bài chung để tạo thành bộ bài mạnh nhất (5 lá).</p>
                <p>+ Trong mỗi vòng cược, người chơi có thể: Fold (bỏ bài), Check (bỏ qua), Call (theo), Raise (tăng), hoặc All-in (đặt tất cả).</p>
                <p>+ Người có bộ bài mạnh nhất sẽ thắng và nhận toàn bộ pot (tiền cược).</p>
              </div>

              <div className="card-ranking-section">
                <h3>Giá trị lá bài (từ thấp đến cao):</h3>
                <div className="card-sequence">
                  <div className="card-row">
                    {['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'].map(rank => (
                      <Card key={rank} rank={rank} suit="S" faceUp={true} size="small" />
                    ))}
                  </div>
                </div>

                <h4>Các chất bài:</h4>
                <div className="suit-ranking">
                  <div className="suit-card">
                    <Card rank="A" suit="S" faceUp={true} size="small" />
                    <span>Spades (Bích)</span>
                  </div>
                  <div className="suit-card">
                    <Card rank="A" suit="H" faceUp={true} size="small" />
                    <span>Hearts (Cơ)</span>
                  </div>
                  <div className="suit-card">
                    <Card rank="A" suit="D" faceUp={true} size="small" />
                    <span>Diamonds (Rô)</span>
                  </div>
                  <div className="suit-card">
                    <Card rank="A" suit="C" faceUp={true} size="small" />
                    <span>Clubs (Chuồn)</span>
                  </div>
                </div>
                <p className="note">*Lưu ý: Trong Poker, các chất bài có giá trị ngang nhau</p>
              </div>
            </div>
          )}

          {activeTab === 'betting' && (
            <div className="betting-content">
              <div className="betting-section">
                <h3>Bảng xếp hạng bài (từ mạnh đến yếu):</h3>

                <div className="hand-ranking">
                  <div className="hand-item rank-1">
                    <div className="rank-badge">#1</div>
                    <div className="hand-info">
                      <strong>Royal Flush (Thùng Phá Sảnh Rồng)</strong>
                      <HandExample cards={[
                        {rank: 'T', suit: 'S'}, {rank: 'J', suit: 'S'}, {rank: 'Q', suit: 'S'},
                        {rank: 'K', suit: 'S'}, {rank: 'A', suit: 'S'}
                      ]} />
                    </div>
                  </div>

                  <div className="hand-item rank-6">
                    <div className="rank-badge">#6</div>
                    <div className="hand-info">
                      <strong>Straight (Sảnh)</strong>
                      <HandExample cards={[
                        {rank: '6', suit: 'S'}, {rank: '7', suit: 'C'}, {rank: '8', suit: 'D'},
                        {rank: '9', suit: 'H'}, {rank: 'T', suit: 'S'}
                      ]} />
                    </div>
                  </div>

                  <div className="hand-item rank-2">
                    <div className="rank-badge">#2</div>
                    <div className="hand-info">
                      <strong>Straight Flush (Thùng Phá Sảnh)</strong>
                      <HandExample cards={[
                        {rank: '5', suit: 'H'}, {rank: '6', suit: 'H'}, {rank: '7', suit: 'H'},
                        {rank: '8', suit: 'H'}, {rank: '9', suit: 'H'}
                      ]} />
                    </div>
                  </div>

                  <div className="hand-item rank-7">
                    <div className="rank-badge">#7</div>
                    <div className="hand-info">
                      <strong>Three of a Kind (Sám Cô)</strong>
                      <HandExample cards={[
                        {rank: '2', suit: 'S'}, {rank: '7', suit: 'S'}, {rank: '7', suit: 'H'},
                        {rank: '7', suit: 'D'}, {rank: 'K', suit: 'C'}
                      ]} />
                    </div>
                  </div>

                  <div className="hand-item rank-3">
                    <div className="rank-badge">#3</div>
                    <div className="hand-info">
                      <strong>Four of a Kind (Tứ Quý)</strong>
                      <HandExample cards={[
                        {rank: '3', suit: 'S'}, {rank: 'K', suit: 'S'}, {rank: 'K', suit: 'H'},
                        {rank: 'K', suit: 'D'}, {rank: 'K', suit: 'C'}
                      ]} />
                    </div>
                  </div>

                  <div className="hand-item rank-8">
                    <div className="rank-badge">#8</div>
                    <div className="hand-info">
                      <strong>Two Pair (Hai Đôi)</strong>
                      <HandExample cards={[
                        {rank: '5', suit: 'D'}, {rank: '5', suit: 'C'}, {rank: 'J', suit: 'S'},
                        {rank: 'J', suit: 'H'}, {rank: 'A', suit: 'S'}
                      ]} />
                    </div>
                  </div>

                  <div className="hand-item rank-4">
                    <div className="rank-badge">#4</div>
                    <div className="hand-info">
                      <strong>Full House (Cù Lũ)</strong>
                      <HandExample cards={[
                        {rank: '8', suit: 'C'}, {rank: '8', suit: 'S'}, {rank: 'A', suit: 'S'},
                        {rank: 'A', suit: 'H'}, {rank: 'A', suit: 'D'}
                      ]} />
                    </div>
                  </div>

                  <div className="hand-item rank-9">
                    <div className="rank-badge">#9</div>
                    <div className="hand-info">
                      <strong>One Pair (Một Đôi)</strong>
                      <HandExample cards={[
                        {rank: '4', suit: 'S'}, {rank: '9', suit: 'S'}, {rank: '9', suit: 'H'},
                        {rank: 'J', suit: 'C'}, {rank: 'A', suit: 'D'}
                      ]} />
                    </div>
                  </div>

                  <div className="hand-item rank-5">
                    <div className="rank-badge">#5</div>
                    <div className="hand-info">
                      <strong>Flush (Thùng)</strong>
                      <HandExample cards={[
                        {rank: '3', suit: 'D'}, {rank: '6', suit: 'D'}, {rank: '9', suit: 'D'},
                        {rank: 'J', suit: 'D'}, {rank: 'K', suit: 'D'}
                      ]} />
                    </div>
                  </div>

                  <div className="hand-item rank-10">
                    <div className="rank-badge">#10</div>
                    <div className="hand-info">
                      <strong>High Card (Mậu Thầu)</strong>
                      <HandExample cards={[
                        {rank: '3', suit: 'S'}, {rank: '7', suit: 'C'}, {rank: 'T', suit: 'H'},
                        {rank: 'K', suit: 'D'}, {rank: 'A', suit: 'S'}
                      ]} />
                    </div>
                  </div>
                </div>

                <div className="tip-box">
                  <span className="tip-icon">💡</span>
                  <p className="tip">Khi 2 người có cùng loại bài, người có lá cao hơn sẽ thắng!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokerRules;
