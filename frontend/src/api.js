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
