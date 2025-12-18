import React, { useState, useEffect } from 'react';
import { apiGet } from '../../api';
import { useAuth } from '../../context/AuthContext';

const MatchHistoryTab = () => {
  const { user } = useAuth();
  const myId = user?.userId?.toString();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, win, lose
  const [selected, setSelected] = useState(null); // selected match for details

  useEffect(() => {
    fetchMatchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close details modal on Escape
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const fetchMatchHistory = async (page = 1, limit = 50) => {
    setLoading(true);
    try {
      const res = await apiGet(`/user/get-game-history?page=${page}&limit=${limit}`);
      if (res?.success) {
        // map rows into client-friendly objects
        const data = (res.data || []).map(r => {
          const ids = (r.result_ids || []).map(String);
          const names = (r.result_usernames || []);
          const elos = (r.elo_changes || []).map(e => Number(e) || 0);
          const myIndex = ids.indexOf(myId);
          const myElo = myIndex >= 0 ? elos[myIndex] : 0;
          const result = myElo > 0 ? 'win' : (myElo < 0 ? 'lose' : 'draw');
          return {
            game_id: r.game_id,
            table_id: r.table_id,
            time: r.time,
            result_ids: ids,
            result_usernames: names,
            elo_changes: elos,
            myElo,
            resultType: result
          };
        });
        setMatches(data);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error('Error fetching match history:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    if (filter === 'win') return match.resultType === 'win';
    if (filter === 'lose') return match.resultType === 'lose';
    return true;
  });

  return (
    <div className="match-history-tab">
      <div className="tab-header">
        <h3 className="section-title">Lịch Sử Đấu</h3>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={`filter-btn ${filter === 'win' ? 'active' : ''}`}
            onClick={() => setFilter('win')}
          >
            Thắng
          </button>
          <button 
            className={`filter-btn ${filter === 'lose' ? 'active' : ''}`}
            onClick={() => setFilter('lose')}
          >
            Thua
          </button>
        </div>
      </div>

      <div className="matches-container">
        {loading ? (
          <div className="loading-state">Đang tải...</div>
        ) : filteredMatches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎮</div>
            <p className="empty-text">Chưa có lịch sử đấu</p>
            <p className="empty-hint">Hãy tham gia một ván đấu để xem lịch sử!</p>
          </div>
        ) : (
          <div className="matches-list">
            {filteredMatches.map((match, index) => (
              <div
                key={index}
                className={`match-card ${match.resultType === 'win' ? 'win' : match.resultType === 'lose' ? 'lose' : ''}`}
                onClick={() => setSelected(match)}
                style={{ cursor: 'pointer' }}
              >
                <div className="match-header">
                  <span className={`match-result ${match.resultType}`}>
                    {match.resultType === 'win' ? '🏆 Thắng' : match.resultType === 'lose' ? '❌ Thua' : '🔷 Hòa'}
                  </span>
                  <span className="match-date">{formatDate(match.time)}</span>
                </div>
                <div className="match-details">
                  <div className="match-info">
                    <span className="match-label">Bàn:</span>
                    <span className="match-value">{match.table_id}</span>
                  </div>
                  <div className="match-info">
                    <span className="match-label">ELO thay đổi:</span>
                    <span className={`match-value ${match.myElo > 0 ? 'positive' : (match.myElo < 0 ? 'negative' : '')}`}>
                      {match.myElo > 0 ? '+' : ''}{match.myElo}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details modal */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-white text-black rounded-lg p-4 z-50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold">Chi tiết trận đấu</h4>
              <button onClick={() => setSelected(null)} className="px-2">✕</button>
            </div>
            <div className="text-sm mb-3">Bàn: <strong>{selected.table_id}</strong> — Thời gian: <strong>{formatDate(selected.time)}</strong></div>
            <div className="divide-y">
                {selected.result_ids.map((id, i) => {
                  const avatarBase = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
                  const avatarUrl = `${avatarBase}/avatar/${id}`;
                  return (
                    <div key={i} className={`py-2 flex justify-between items-center ${id === myId ? 'font-semibold' : ''}`}>
                      <div className="flex items-center space-x-3">
                        <img
                          src={avatarUrl}
                          alt={selected.result_usernames[i] || id}
                          onError={(e) => { e.target.onerror = null; e.target.src = `${avatarBase}/avatar/default.png`; }}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div>{selected.result_usernames[i] || id}</div>
                          <div className="text-xs text-gray-600">ID: {id}</div>
                        </div>
                      </div>
                      <div className={`${selected.elo_changes[i] > 0 ? 'text-green-600' : selected.elo_changes[i] < 0 ? 'text-red-600' : ''}`}>
                        {selected.elo_changes[i] > 0 ? '+' : ''}{selected.elo_changes[i]}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchHistoryTab;
