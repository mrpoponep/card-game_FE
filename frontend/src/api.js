const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'; // 🔹 Đổi port thành 8000 (hoặc port server của bạn)
console.log('API Base URL:', API_BASE);

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(errorBody); // Ném lỗi dưới dạng text (JSON string)
  }
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(errorBody); // Ném lỗi dưới dạng text (JSON string)
  }
  return res.json();
}

// 🔹 HÀM MỚI CHO ĐĂNG KÝ
async function apiRegister(username, password) {
  return apiPost('/api/auth/register', { username, password });
}

// 🔹 HÀM MỚI CHO ĐĂNG NHẬP (sẽ dùng sau)
async function apiLogin(username, password) {
  return apiPost('/api/auth/login', { username, password });
}

async function apiCreateRoom(roomData) {
  // route 'create' này là từ file 'createRoomRoute.js'
  return apiPost('/api/room/create', roomData); 
}

// 🔹 HÀM MỚI CHO TÌM PHÒNG
async function apiFindAndJoinRoom(code, userId) {
  // route 'find/:code' này là từ file 'findRoomRoute.js'
  return apiGet(`/api/room/find/${code}?userId=${userId}`);
}

// 🔹 CẬP NHẬT EXPORT
export { 
  apiGet, 
  apiPost, 
  apiRegister, 
  apiLogin, 
  apiCreateRoom, 
  apiFindAndJoinRoom 
};