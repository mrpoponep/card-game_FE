const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
console.log('API Base URL:', API_BASE);
async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export { apiGet, apiPost };

export async function fetchTotalPlayers() {
  const data = await apiGet('/api/admin/total-players');
  return data.totalPlayers; // Chỉ trả về con số
}

export async function fetchTotalBannedPlayers() {
  const data = await apiGet('/api/admin/total-banned-players');
  return data.totalBannedPlayers; // Chỉ trả về con số
}

/**
 * @param {string} type - "public" hoặc "private"
 */
export async function fetchTables(type = "public") {
  const data = await apiGet(`/api/room/list?type=${type}`);
  return data.tables; // Trả về mảng các phòng
}

export async function fetchTableMetrics() {
  const data = await apiGet('/api/room/table-metrics');
  return data; // Trả về đối tượng metrics
}


 // Lấy số người chơi đang online (real-time)
export async function fetchOnlinePlayers() {
  // Gọi API: GET /api/admin/online-players
  const data = await apiGet('/api/admin/online-players');
  return data.onlinePlayers; // Chỉ trả về con số
}

// ... (các hàm fetch cũ: fetchTotalPlayers, fetchTableMetrics...)

/**
 * Lấy thống kê Coin theo khoảng thời gian
 * @param {string} fromDate - 'YYYY-MM-DD'
 * @param {string} toDate - 'YYYY-MM-DD'
 * @returns {Promise<object>} Object chứa totalVolume, transactionCount, averageTransaction
 */
export async function fetchCoinStats(fromDate, toDate) {
  // Gọi API: GET /api/admin/coin-stats?from=YYYY-MM-DD&to=YYYY-MM-DD
  // API trả về: { success: true, stats: { totalVolume: ..., ... } }
  const data = await apiGet(`/api/admin/coin-stats?from=${fromDate}&to=${toDate}`);
  return data.stats; // Trả về object stats
}

/**
 * Lấy thống kê Người chơi theo khoảng thời gian
 * @param {string} fromDate - 'YYYY-MM-DD'
 * @param {string} toDate - 'YYYY-MM-DD'
 * @returns {Promise<object>} Object chứa totalRegistered, activeByTx, ...
 */
export async function fetchPlayerStats(fromDate, toDate) {
  // Gọi API: GET /api/admin/player-stats?from=...&to=...
  const data = await apiGet(`/api/admin/player-stats?from=${fromDate}&to=${toDate}`);
  return data.stats; // Trả về object stats
}