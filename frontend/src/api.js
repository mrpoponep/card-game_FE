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

/* =========================
   SHORTCUT METHODS
========================= */

export async function apiGet(path, options = {}) {
  return request(path, { method: 'GET', ...options });
}

export async function apiPost(path, body, options = {}) {
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

export async function apiGetTransactionHistory() {
  return apiGet('/payment/history', { showErrorModal: false });
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
