// src/utils/dateUtils.js

export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Hàm parseISO: Tạo Date object trong múi giờ UTC từ chuỗi YYYY-MM-DD
export function parseISO(d) {
    if (!d || typeof d !== 'string') return new Date(NaN);
    const parts = d.split("-");
    if (parts.length !== 3) return new Date(NaN);
    const [y, m, day] = parts.map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(day) || m < 1 || m > 12 || day < 1 || day > 31) {
        return new Date(NaN);
    }
    return new Date(Date.UTC(y, m - 1, day));
}

// Hàm diffDaysInclusive
export function diffDaysInclusive(from, to) {
    const fromDate = parseISO(from); 
    const toDate = parseISO(to);  
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return 1;
    const ms = toDate.getTime() - fromDate.getTime();
    return Math.max(Math.floor(ms / (1000 * 60 * 60 * 24)) + 1, 1);
}

// Hàm isFullSingleMonth
export function isFullSingleMonth(from, to) {
    const f = parseISO(from);
    const t = parseISO(to);
    if (isNaN(f.getTime()) || isNaN(t.getTime())) return false;

    const firstOfMonth = new Date(Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), 1));
    const lastOfMonth = new Date(Date.UTC(f.getUTCFullYear(), f.getUTCMonth() + 1, 0));

    return (
        f.getUTCFullYear() === t.getUTCFullYear() &&
        f.getUTCMonth() === t.getUTCMonth() &&
        f.getTime() === firstOfMonth.getTime() &&
        t.getTime() === lastOfMonth.getTime()
    );
}