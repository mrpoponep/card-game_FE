import React, { useMemo, useState, useEffect} from "react";
import { fetchTotalBannedPlayers, fetchTotalPlayers } from "../../api";
import "./Dashboard.css";

import Select from "../../components/admin/Select";
import StatCard from "../../components/admin/StatCard";
import TabSwitch from "../../components/admin/TabSwitch";
import PublicTables from "./PublicTables";

import {
  UserIcon,
  SignalIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const TYPE_OPTS = [
  { value: "coin", label: "Coin" },
  { value: "players", label: "Người chơi (active)" },
  { value: "matches", label: "Ván chơi" },
  { value: "tables", label: "Bàn (được dùng)" },
];

const fmt = new Intl.NumberFormat("vi-VN");

// ===== Date helpers (giữ lại cho UI tính “Avg”/nhãn kỳ)
function parseISO(d) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}
function diffDaysInclusive(from, to) {
  const ms = parseISO(to) - parseISO(from);
  return Math.max(Math.floor(ms / (1000 * 60 * 60 * 24)) + 1, 1);
}
function isFullSingleMonth(from, to) {
  const f = parseISO(from);
  const t = parseISO(to);
  const firstOfMonth = new Date(f.getFullYear(), f.getMonth(), 1);
  const lastOfMonth = new Date(f.getFullYear(), f.getMonth() + 1, 0);
  return (
    f.getFullYear() === t.getFullYear() &&
    f.getMonth() === t.getMonth() &&
    f.getTime() === firstOfMonth.getTime() &&
    t.getTime() === lastOfMonth.getTime()
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [type, setType] = useState("coin");
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  // KPI (giữ UI, chưa nối API => số mặc định)
  const [kpi, setKpi] = useState({
    totalPlayers: 0,
    bannedPlayers: 0,
    online: 0,
    gamesToday: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tab === "overview") {
      const fetchDashboardData = async () => {
        try {
          setLoading(true); 
          setError(null);  
          
          const [total, banned] = await Promise.all([
            fetchTotalPlayers(),
            fetchTotalBannedPlayers(),
          ]);

          setKpi(prevKpi => ({
            ...prevKpi, 
            totalPlayers: total,
            bannedPlayers: banned,
          }));

        } catch (err) {
          setError("Không thể tải được dữ liệu từ server. Vui lòng thử lại.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [tab]);

  const days = useMemo(
    () => (!from || !to) ? 1 : diffDaysInclusive(from, to),
    [from, to]
  );
  const periodLabel = useMemo(
    () => (!from || !to) ? "" : (isFullSingleMonth(from, to) ? "1T" : `${days} ngày`),
    [from, to, days]
  );

  const customStatsTotal = 0;
  const avg = useMemo(
    () => (type === "coin" && days > 0) ? Math.round(customStatsTotal / days) : null,
    [type, days, customStatsTotal]
  );

  const onView = () => {
    // Chưa nối API nên chưa thực hiện gì cả.
    // Để trống cho lần tích hợp backend sau này.
  };

  if (loading && tab === "overview") {
    return <div className="admin-dashboard text-center p-4">Đang tải dữ liệu tổng quan...</div>;
  }

  return (
    <div className="admin-dashboard space-y-6 p-4 min-h-screen bg-gray-50">
      {/* Header Tabs */}
      <div className="flex items-center justify-between">
        <TabSwitch
          tabs={[
            { value: "overview", label: "Tổng quan" },
            { value: "public", label: "Bản public / Tables" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {/* Error Box (không dùng nhưng giữ khung sẵn) */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Lỗi!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {tab === "overview" ? (
        <>
          {/* KPI OVERVIEW */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="Tổng người chơi"
              value={fmt.format(kpi.totalPlayers)}
              icon={<UserIcon className="stat-icon icon-16 text-gray-400" />}
            />
            <StatCard
              label="Đang online (realtime)"
              value={fmt.format(kpi.online)}
              icon={<SignalIcon className="stat-icon icon-16 text-gray-400" />}
            />
            <StatCard
              label="Người chơi bị ban"
              value={fmt.format(kpi.bannedPlayers)}
              icon={<ExclamationTriangleIcon className="stat-icon icon-16 text-gray-400" />}
            />
            <StatCard
              label="Ván hôm nay"
              value={fmt.format(kpi.gamesToday)}
              icon={<CalendarDaysIcon className="stat-icon icon-16 text-gray-400" />}
            />
          </div>

          {/* CUSTOM STATS BOX */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 text-lg font-semibold">Thống kê tuỳ chọn</div>

            <div className="grid gap-4 md:grid-cols-4 md:items-end">
              <div>
                <label htmlFor="type-select" className="mb-1 block text-sm text-gray-600">
                  Loại thống kê
                </label>
                <Select
                  id="type-select"
                  value={type}
                  onChange={setType}
                  options={TYPE_OPTS}
                />
              </div>

              <div>
                <label htmlFor="from-date" className="mb-1 block text-sm text-gray-600">
                  Từ ngày
                </label>
                <input
                  id="from-date"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              <div>
                <label htmlFor="to-date" className="mb-1 block text-sm text-gray-600">
                  Đến ngày
                </label>
                <input
                  id="to-date"
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              {/* Tổng/Average hiển thị theo lựa chọn và kỳ thời gian */}
              <div className="flex h-10 items-center gap-2 rounded-xl border bg-white px-3 text-sm shadow-sm mt-6 md:mt-0">
                <span className="rounded-full border px-1.5 py-0.5 text-xs text-gray-600">
                  {type === "coin" ? "Avg:" : "Tổng:"} {periodLabel}
                </span>
                <span className="font-semibold">
                  {fmt.format(type === "coin" && avg !== null ? avg : customStatsTotal)}{" "}
                  {type === "coin"
                    ? "coin"
                    : type === "players"
                    ? "người"
                    : type === "matches"
                    ? "ván"
                    : "bàn"}
                </span>
                {type === "coin" && <ArrowPathIcon className="btn-icon icon-12 text-gray-400" />}
              </div>
            </div>

            <div className="mt-4 flex items-end gap-3">
              <button
                onClick={onView}
                disabled={true}
                className="flex h-10 items-center gap-2 rounded-xl bg-gray-300 px-4 text-sm font-medium text-white cursor-not-allowed"
                title="Chưa kết nối API"
              >
                <ChartBarIcon className="btn-icon icon-16" />
                <span>Xem thống kê</span>
              </button>
            </div>

            {/* Khu vực biểu đồ: để trống, chờ nối backend sau */}
          </div>
        </>
      ) : (
        // PublicTables: nếu component này hiện vẫn fetch, bạn có thể tạm thời đổi bên trong nó.
        <PublicTables from={from} to={to} />
      )}
    </div>
  );
}
