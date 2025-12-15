const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

const TOKEN_KEY = 'access_token';
let showErrorModalCallback = null;

/* =========================
   TOKEN HELPERS
========================= */

export function setAccessToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch (_) { }
}

export function getAccessToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch (_) {
    return null;
  }
}

export function setErrorModalCallback(callback) {
  showErrorModalCallback = callback;
}

/* =========================
   REFRESH TOKEN
========================= */

async function refreshAccessToken() {
  try {
    const sid =
      sessionStorage.getItem('session_id') ||
      localStorage.getItem('session_id');

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: sid ? { 'X-Session-Id': sid } : undefined
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data?.success && data?.accessToken) {
      setAccessToken(data.accessToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

/* =========================
   CORE REQUEST
========================= */

async function request(
  path,
  options = {},
  retryOn401 = true,
  showErrorModal = true
) {
  const {
    skipAuth = false,
    noThrow = false,   // 🆕 rất quan trọng cho API public
    headers: customHeaders,
    ...rest
  } = options;

  const headers = new Headers(customHeaders || {});
  if (rest.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token && !skipAuth) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers,
      ...rest
    });
  } catch (networkError) {
    if (!noThrow) throw networkError;
    return { success: false, message: 'Network error' };
  }

  // Retry 401 (trừ auth APIs)
  const isAuthAPI = path.startsWith('/auth/');
  if (res.status === 401 && retryOn401 && !skipAuth && !isAuthAPI) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request(path, options, false, showErrorModal);
    }
  }

  // Parse response an toàn
  let data = {};
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  // Nếu API public → KHÔNG THROW
  if (noThrow) {
    return data;
  }

  // Xử lý lỗi chung
  if (!res.ok || data?.success === false) {
    const message = data?.message || 'Đã xảy ra lỗi';

    if (showErrorModal && showErrorModalCallback) {
      showErrorModalCallback(message, res.status === 401);
    }

    if (!noThrow) {
      throw new Error(message);
    }
  }

  return data;
}

export async function fetchTotalPlayers() {
  const data = await apiGet('/admin/total-players');
  return data.totalPlayers; 
}

export async function fetchTotalBannedPlayers() {
  const data = await apiGet('/admin/total-banned-players');
  return data.totalBannedPlayers; 
}

/**
 * Tạo báo cáo vi phạm
 * @param {{reportedId:number, reason:string, chatHistory?:string}} payload
 */
export async function createBannedReport(payload) {
  const data = await apiPost('/ban/', payload);
  return data; // { message, report, user }
}

/** Lấy danh sách báo cáo */
export async function listBannedReports({ limit = 100, offset = 0 } = {}) {
  const data = await apiGet(`/ban/?limit=${limit}&offset=${offset}`);
  return data; // array of reports
}

/** Lấy báo cáo theo user */
export async function getBannedReportsByUser(userId, limit = 50) {
  const data = await apiGet(`/ban/user/${userId}?limit=${limit}`);
  return data; // array
}

/** Lấy báo cáo theo id */
export async function getBannedReportById(reportId) {
  const data = await apiGet(`/ban/${reportId}`);
  return data; // single report object
}

/**
 * Gọi AI để phân tích hội thoại và (nếu có vi phạm) lưu báo cáo
 * @param {{reportedId:number, conversation: Array}} payload
 */
export async function analyzeAndSaveAI(payload) {
  const data = await apiPost('/ban/ai/analyze-and-save', payload);
  return data; // { message, violations, report?, user? }
}

/** @param {"public"|"private"} type */
export async function fetchTables(type = "public") {
  const data = await apiGet(`/listRoom/list?type=${type}`);
  return data.tables;
}

export async function fetchTableMetrics() {
  const data = await apiGet('/listRoom/table-metrics');
  return data; 
}
export async function fetchTableDetail(tableId) {
  const data = await apiGet(`/listRoom/table/${tableId}`);
  return data.table;
}

async function apiPatch(path, body, options = {}) {
  const { showErrorModal = true, ...rest } = options;
  return request(
    path, 
    { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, ...rest }, 
    true, 
    showErrorModal
  );
}

export async function updateTable(tableId, payload) {
  const data = await apiPatch(`/listRoom/table/${tableId}`, payload);
  return data.table;
}

export async function fetchOnlinePlayers() {
  const data = await apiGet('/admin/online-players');
  return typeof data.online === 'number' 
     ? data.online 
     : (typeof data.onlinePlayers === 'number' ? data.onlinePlayers : 0);
}

/**
 * Lấy thống kê Coin theo khoảng thời gian
 * @param {string} fromDate - 'YYYY-MM-DD'
 * @param {string} toDate - 'YYYY-MM-DD'
 * @returns {Promise<object>} Object chứa totalVolume, transactionCount, averageTransaction
 */
export async function fetchCoinStats(fromDate, toDate) {
  // Gọi API: GET /api/admin/coin-stats?from=YYYY-MM-DD&to=YYYY-MM-DD
  const data = await apiGet(`/admin/coin-stats?from=${fromDate}&to=${toDate}`);
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
  const data = await apiGet(`/admin/player-stats?from=${fromDate}&to=${toDate}`);
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
  const data = await apiGet(`/admin/total-games?from=${fromDate}&to=${toDate}`);
  return data.totalGames; 
}
// === Timeseries cho biểu đồ ===
export async function fetchCoinSeries(fromDate, toDate) {
  const data = await apiGet(`/admin/series/coin?from=${fromDate}&to=${toDate}`);
  return data.series; 
}

export async function fetchActivePlayersSeries(fromDate, toDate) {
  const data = await apiGet(`/admin/series/active-players?from=${fromDate}&to=${toDate}`);
  return data.series; 
}

export async function fetchTotalActivePlayers(fromDate, toDate) {
  const data = await apiGet(`/admin/total-active-players?from=${fromDate}&to=${toDate}`);
  return data.totalActivePlayers; 
}

export async function fetchMatchesSeries(fromDate, toDate) {
  const data = await apiGet(`/admin/series/matches?from=${fromDate}&to=${toDate}`);
  return data.series; 
}
async function apiGet(path, options = {}) {
  const { showErrorModal = true, ...rest } = options;
  return request(path, { method: 'GET', ...rest }, true, showErrorModal);
}

async function apiPost(path, body, options = {}) {
  const { showErrorModal = true, ...rest } = options;
  const isAuthAPI = path.includes('/auth/login') || path.includes('/auth/refresh') || path.includes('/auth/logout') || path.includes('/auth/register') || path.includes('/auth/send-email-verification-otp') || path.includes('/auth/verify-email-otp');
  return request(
    path,
    {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options
    }
  );
}

/* =========================
   BUSINESS APIs
========================= */

// ROOM
export async function apiCreateRoom(data) {
  return apiPost('/room', data);
}

export async function apiFindAndJoinRoom(code) {
  return apiGet(`/room/${code}`);
}

// PAYMENT
export async function apiCreatePaymentUrl(data) {
  return apiPost('/payment/create_payment_url', data, {
    showErrorModal: false
  });
}

async function fetchActiveTablesSeries(fromDate, toDate) {
  const data = await apiGet(`/admin/series/table-usage?from=${fromDate}&to=${toDate}`);
  return data.series;
}

async function fetchTotalActiveTables(fromDate, toDate) {
  const data = await apiGet(`/admin/total-active-tables?from=${fromDate}&to=${toDate}`);
  return data.totalActiveTables;
}

/** Lấy số lần bị báo cáo của user */
export async function getUserViolationCount(userId) {
  const data = await apiGet(`/user/${userId}/violation-count`);
  return data.violation_count;}
// 🆕 Get transaction history
async function apiGetTransactionHistory() {
  return apiGet('/payment/history', { showErrorModal: false });
}

/** Lấy danh sách Report từ bảng Report (thay vì Banned_Player) */
async function listAllReports() {
  const data = await apiGet('/reports/'); 
  // Lưu ý: route trong server.js của bạn có thể là app.use('/api/reports', reportRoutes)
  // Nếu chưa có, hãy đảm bảo server.js đã mount route này.
  return data.data; 
}
/** Cập nhật trạng thái đánh giá của báo cáo */
async function updateReportVerdict(reportId, verdict) {
  // verdict: 'violation_detected' | 'clean' | 'pending'
  const data = await apiPatch(`/reports/${reportId}/verdict`, { verdict });
  return data;
}

  async function deleteBannedReport(reportId) {
  // Đổi endpoint từ `/ban/${reportId}` thành `/reports/${reportId}`
  const data = await request(`/reports/${reportId}`, { method: 'DELETE' });
  return data; 
}

// TABLE
export async function apiGetPublicTables(level = 'all') {
  return apiGet(`/tables/list?level=${level}`);
}

export async function apiJoinTable(roomCode, buyInAmount = null) {
  return apiPost('/tables/join', { roomCode, buyInAmount });
}

export async function apiCreateTable(level, maxPlayers = 6) {
  return apiPost('/tables/create', { level, maxPlayers });
}

/* =========================
   🆕 REFERRAL (PUBLIC SAFE)
========================= */

export async function apiTrackReferralClick(refCode) {
  return request(
    '/referral/track-click',
    {
      method: 'POST',
      body: JSON.stringify({ refCode }),
      skipAuth: true,
      noThrow: true,
      showErrorModal: false
    }
  );
}

export {
  apiGet,
  apiPost,
 // apiCreateRoom,
  //apiFindAndJoinRoom,
  //apiCreatePaymentUrl,
  apiPatch,
  fetchActiveTablesSeries,
  fetchTotalActiveTables,
  apiGetTransactionHistory,
  listAllReports,
  updateReportVerdict,
  deleteBannedReport,
  request
}


