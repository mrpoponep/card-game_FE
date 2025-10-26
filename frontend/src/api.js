const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

let accessToken = null;
let showErrorModalCallback = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function getAccessToken() {
  return accessToken;
}

export function setErrorModalCallback(callback) {
  showErrorModalCallback = callback;
}

async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
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
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

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
  const { showErrorModal = true, ...rest } = options;
  return request(path, { method: 'GET', ...rest }, true, showErrorModal);
}

async function apiPost(path, body, options = {}) {
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
  return apiPost('/room/create', roomData); 
}

// 🔹 HÀM MỚI CHO TÌM PHÒNG
async function apiFindAndJoinRoom(code) {
  // route 'find/:code' này là từ file 'findRoomRoute.js'
  return apiGet(`/room/find/${code}`);
}

// 🔹 CẬP NHẬT EXPORT
export { 
  apiGet, 
  apiPost, 
  apiCreateRoom, 
  apiFindAndJoinRoom 
};