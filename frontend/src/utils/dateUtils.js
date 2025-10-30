// src/utils/dateUtils.js

// Hàm parseISO
export function parseISO(d) {
    if (!d || typeof d !== 'string') return new Date(NaN);
    const parts = d.split("-");
    if (parts.length !== 3) return new Date(NaN);
    const [y, m, day] = parts.map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(day) || m < 1 || m > 12 || day < 1 || day > 31) {
        return new Date(NaN);
    }
    return new Date(y, m - 1, day);
}

// Hàm diffDaysInclusive
export function diffDaysInclusive(from, to) {
    const fromDate = parseISO(from);
    const toDate = parseISO(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return 1;
    const ms = toDate - fromDate;
    return Math.max(Math.floor(ms / (1000 * 60 * 60 * 24)) + 1, 1);
}

// Hàm isFullSingleMonth
export function isFullSingleMonth(from, to) {
    const f = parseISO(from);
    const t = parseISO(to);
    if (isNaN(f.getTime()) || isNaN(t.getTime())) return false;
    const firstOfMonth = new Date(f.getFullYear(), f.getMonth(), 1);
    const lastOfMonth = new Date(f.getFullYear(), f.getMonth() + 1, 0);
    return (
        f.getFullYear() === t.getFullYear() &&
        f.getMonth() === t.getMonth() &&
        f.getTime() === firstOfMonth.getTime() &&
        t.getTime() === lastOfMonth.getTime()
    );
}