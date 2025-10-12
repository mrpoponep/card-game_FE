import React, { useState } from 'react';
import './PokerRules.css';

const PokerRules = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('rules');

  return (
    <div className="poker-rules-overlay">
      <div className="poker-rules-modal">
        <div className="modal-header">
          <h2>HƯỚNG DẪN</h2>
          <button className="close-btn" onClick={onClose}>×</button>
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
                    <div className="card">2</div>
                    <div className="card">3</div>
                    <div className="card">4</div>
                    <div className="card">5</div>
                    <div className="card">6</div>
                    <div className="card">7</div>
                    <div className="card">8</div>
                    <div className="card">9</div>
                    <div className="card">10</div>
                    <div className="card">J</div>
                    <div className="card">Q</div>
                    <div className="card">K</div>
                    <div className="card">A</div>
                  </div>
                </div>

                <h4>Các chất bài:</h4>
                <div className="suit-ranking">
                  <div className="suit-card">
                    <div className="card suit-spades">♠</div>
                    <span>Spades (Bích)</span>
                  </div>
                  <div className="suit-card">
                    <div className="card suit-hearts">♥</div>
                    <span>Hearts (Cơ)</span>
                  </div>
                  <div className="suit-card">
                    <div className="card suit-diamonds">♦</div>
                    <span>Diamonds (Rô)</span>
                  </div>
                  <div className="suit-card">
                    <div className="card suit-clubs">♣</div>
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
                      <p className="hand-example">10<span className="suit-spades">♠</span> J<span className="suit-spades">♠</span> Q<span className="suit-spades">♠</span> K<span className="suit-spades">♠</span> A<span className="suit-spades">♠</span></p>
                    </div>
                  </div>

                  <div className="hand-item rank-6">
                    <div className="rank-badge">#6</div>
                    <div className="hand-info">
                      <strong>Straight (Sảnh)</strong>
                      <p className="hand-example">6<span className="suit-spades">♠</span> 7<span className="suit-clubs">♣</span> 8<span className="suit-diamonds">♦</span> 9<span className="suit-hearts">♥</span> 10<span className="suit-spades">♠</span></p>
                    </div>
                  </div>

                  <div className="hand-item rank-2">
                    <div className="rank-badge">#2</div>
                    <div className="hand-info">
                      <strong>Straight Flush (Thùng Phá Sảnh)</strong>
                      <p className="hand-example">5<span className="suit-hearts">♥</span> 6<span className="suit-hearts">♥</span> 7<span className="suit-hearts">♥</span> 8<span className="suit-hearts">♥</span> 9<span className="suit-hearts">♥</span></p>
                    </div>
                  </div>

                  <div className="hand-item rank-7">
                    <div className="rank-badge">#7</div>
                    <div className="hand-info">
                      <strong>Three of a Kind (Sám Cô)</strong>
                      <p className="hand-example">2<span className="suit-spades">♠</span> 7<span className="suit-spades">♠</span> 7<span className="suit-hearts">♥</span> 7<span className="suit-diamonds">♦</span> K<span className="suit-clubs">♣</span></p>
                    </div>
                  </div>

                  <div className="hand-item rank-3">
                    <div className="rank-badge">#3</div>
                    <div className="hand-info">
                      <strong>Four of a Kind (Tứ Quý)</strong>
                      <p className="hand-example">3<span className="suit-spades">♠</span> K<span className="suit-spades">♠</span> K<span className="suit-hearts">♥</span> K<span className="suit-diamonds">♦</span> K<span className="suit-clubs">♣</span></p>
                    </div>
                  </div>

                  <div className="hand-item rank-8">
                    <div className="rank-badge">#8</div>
                    <div className="hand-info">
                      <strong>Two Pair (Hai Đôi)</strong>
                      <p className="hand-example">5<span className="suit-diamonds">♦</span> 5<span className="suit-clubs">♣</span> J<span className="suit-spades">♠</span> J<span className="suit-hearts">♥</span> A<span className="suit-spades">♠</span></p>
                    </div>
                  </div>

                  <div className="hand-item rank-4">
                    <div className="rank-badge">#4</div>
                    <div className="hand-info">
                      <strong>Full House (Cù Lũ)</strong>
                      <p className="hand-example">8<span className="suit-clubs">♣</span> 8<span className="suit-spades">♠</span> A<span className="suit-spades">♠</span> A<span className="suit-hearts">♥</span> A<span className="suit-diamonds">♦</span></p>
                    </div>
                  </div>

                  <div className="hand-item rank-9">
                    <div className="rank-badge">#9</div>
                    <div className="hand-info">
                      <strong>One Pair (Một Đôi)</strong>
                      <p className="hand-example">4<span className="suit-spades">♠</span> 9<span className="suit-spades">♠</span> 9<span className="suit-hearts">♥</span> J<span className="suit-clubs">♣</span> A<span className="suit-diamonds">♦</span></p>
                    </div>
                  </div>

                  <div className="hand-item rank-5">
                    <div className="rank-badge">#5</div>
                    <div className="hand-info">
                      <strong>Flush (Thùng)</strong>
                      <p className="hand-example">3<span className="suit-diamonds">♦</span> 6<span className="suit-diamonds">♦</span> 9<span className="suit-diamonds">♦</span> J<span className="suit-diamonds">♦</span> K<span className="suit-diamonds">♦</span></p>
                    </div>
                  </div>

                  <div className="hand-item rank-10">
                    <div className="rank-badge">#10</div>
                    <div className="hand-info">
                      <strong>High Card (Mậu Thầu)</strong>
                      <p className="hand-example">3<span className="suit-spades">♠</span> 7<span className="suit-clubs">♣</span> 10<span className="suit-hearts">♥</span> K<span className="suit-diamonds">♦</span> A<span className="suit-spades">♠</span></p>
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
