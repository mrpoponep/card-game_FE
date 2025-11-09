const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

// Use sessionStorage to keep access token per-tab (not shared across tabs).
// sessionStorage is preferable here to keep per-tab tokens while still
// using httpOnly refresh cookie for secure refresh flows.
const TOKEN_KEY = 'access_token';
let showErrorModalCallback = null;

export function setAccessToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    // ignore sessionStorage errors (e.g., disabled storage)
  }
}

export function getAccessToken() {
  // Prefer reading from sessionStorage to avoid stale module variable
  try {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored) return stored;
  } catch (e) {
    return null;
  }
}

export function setErrorModalCallback(callback) {
  showErrorModalCallback = callback;
}

async function refreshAccessToken() {
  try {
    // Include X-Session-Id header when available so server can select per-session cookie
  const sid = (() => { try { return sessionStorage.getItem('session_id') || localStorage.getItem('session_id'); } catch (e) { return null; } })();
    const headers = sid ? { 'X-Session-Id': sid } : undefined;
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success && data?.accessToken) {
      setAccessToken(data.accessToken);
      return data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function request(path, options = {}, retryOn401 = true, showErrorModal = true) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  const tokenForRequest = getAccessToken();
  if (tokenForRequest) headers.set('Authorization', `Bearer ${tokenForRequest}`);

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers
  });

  // Không retry 401 cho các API auth (vì 401 ở đây là lỗi nghiệp vụ, không phải token hết hạn)
  const isAuthAPI = path.includes('/auth/login') || path.includes('/auth/refresh') || path.includes('/auth/logout') || path.includes('/auth/register') || path.includes('/auth/send-email-verification-otp') || path.includes('/auth/verify-email-otp');
  
  if (res.status === 401 && retryOn401 && !isAuthAPI) {
    const refreshed = await refreshAccessToken();
    if (refreshed?.accessToken) {
      return request(path, options, false, showErrorModal);
    }
  }

  // Parse JSON trước, vì server có thể trả JSON kể cả khi !res.ok
  let data;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  // Với các API auth, luôn trả data (kể cả khi !res.ok) để caller xử lý success/message
  if (isAuthAPI) {
    return data;
  }

  // Với các API khác, nếu !res.ok hoặc success=false, hiển thị modal (nếu được bật)
  if (!res.ok || data?.success === false) {
    const errorMsg = data?.message || 'Đã xảy ra lỗi';
    if (showErrorModal && showErrorModalCallback) {
      // Truyền thêm flag is401 để App.jsx biết cần redirect
      showErrorModalCallback(errorMsg, res.status === 401);
    }
    // Throw để caller biết có lỗi (nếu cần xử lý thêm)
    if (!res.ok) {
      throw new Error(errorMsg);
    }
  }

  return data;
}

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

/**
 * Lấy tổng số ván chơi trong khoảng thời gian
 * @param {string} fromDate - 'YYYY-MM-DD'
 * @param {string} toDate - 'YYYY-MM-DD'
 * @returns {Promise<number>} Tổng số ván chơi
 */
export async function fetchTotalGames(fromDate, toDate) {
  // Gọi API: GET /api/admin/total-games?from=YYYY-MM-DD&to=YYYY-MM-DD
  const data = await apiGet(`/api/admin/total-games?from=${fromDate}&to=${toDate}`);
  return data.totalGames; // Chỉ trả về con số
}
// === Timeseries cho biểu đồ ===
export async function fetchCoinSeries(fromDate, toDate) {
  const data = await apiGet(`/api/admin/series/coin?from=${fromDate}&to=${toDate}`);
  return data.series; // [{date, totalVolume, transactionCount, averageTransaction}]
}

export async function fetchActivePlayersSeries(fromDate, toDate) {
  const data = await apiGet(`/api/admin/series/active-players?from=${fromDate}&to=${toDate}`);
  return data.series; // [{date, activeByTx}]
}

export async function fetchMatchesSeries(fromDate, toDate) {
  const data = await apiGet(`/api/admin/series/matches?from=${fromDate}&to=${toDate}`);
  return data.series; // [{date, totalGames}]
}
async function apiGet(path, options = {}) {
  console.log(getAccessToken());
  const { showErrorModal = true, ...rest } = options;
  return request(path, { method: 'GET', ...rest }, true, showErrorModal);
}

async function apiPost(path, body, options = {}) {
  console.log(getAccessToken());
  const { showErrorModal = true, ...rest } = options;
  // Các API auth không hiển thị modal
  const isAuthAPI = path.includes('/auth/login') || path.includes('/auth/refresh') || path.includes('/auth/logout') || path.includes('/auth/register') || path.includes('/auth/send-email-verification-otp') || path.includes('/auth/verify-email-otp');
  return request(
    path, 
    { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...rest }, 
    true, 
    isAuthAPI ? false : showErrorModal
  );
}

async function apiCreateRoom(roomData) {
  // route 'create' này là từ file 'createRoomRoute.js'
  // REST-style: POST /api/room
  return apiPost('/room', roomData); 
}

async function apiFindAndJoinRoom(code) {
  // route 'find/:code' này là từ file 'findRoomRoute.js'
  // REST-style: GET /api/room/:code
  return apiGet(`/room/${code}`);
}

export { 
  apiGet, 
  apiPost, 
  apiCreateRoom, 
  apiFindAndJoinRoom 
};
