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