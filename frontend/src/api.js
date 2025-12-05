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

async function apiCreatePaymentUrl({ amount, orderDescription, bankCode }) {
  // Avoid global modal here; UI will handle local error
  return apiPost('/payment/create_payment_url', { amount, orderDescription, bankCode }, { showErrorModal: false });
}

// 🆕 Get transaction history
async function apiGetTransactionHistory() {
  return apiGet('/payment/history', { showErrorModal: false });
}

export {
  apiGet,
  apiPost,
  apiCreateRoom,
  apiFindAndJoinRoom,
  apiCreatePaymentUrl,
  apiGetTransactionHistory
};
