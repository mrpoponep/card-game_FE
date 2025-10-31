import React, { useMemo, useState, useEffect } from "react";
import {
  fetchTotalBannedPlayers,
  fetchTotalPlayers,
  fetchOnlinePlayers,
  fetchCoinStats,
  fetchPlayerStats,
  fetchTotalGames,           // KPI hôm nay + tab matches (tổng theo khoảng)
  fetchCoinSeries,           // timeseries cho chart
  fetchActivePlayersSeries,  // timeseries cho chart
  fetchMatchesSeries,        // timeseries cho chart
} from "../../api";
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
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const TYPE_OPTS = [
  { value: "coin",     label: "Coin" },
  { value: "players",  label: "Người chơi (active)" },
  { value: "matches",  label: "Ván chơi" },
  { value: "tables",   label: "Bàn (được dùng)" },
];

const fmt = new Intl.NumberFormat("vi-VN");
const todayStr = () => new Date().toISOString().split("T")[0];

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
  const lastOfMonth  = new Date(f.getFullYear(), f.getMonth() + 1, 0);
  return (
    f.getFullYear() === t.getFullYear() &&
    f.getMonth()     === t.getMonth() &&
    f.getTime()      === firstOfMonth.getTime() &&
    t.getTime()      === lastOfMonth.getTime()
  );
}

/** 📈 Biểu đồ đường SVG thuần, gọn + không bị khuất label */
function LineChart({ data, width = 720, height = 220, label = "", unit = "" }) {
  if (!data || data.length === 0) {
    return <div className="mt-6 text-sm text-gray-500">Không có dữ liệu để vẽ biểu đồ.</div>;
  }

  const pad = { top: 16, right: 12, bottom: 28, left: 40 };
  const innerW = width  - pad.left - pad.right;
  const innerH = height - pad.top  - pad.bottom;

  const values = data.map(d => Number(d.value || 0));
  const minY   = Math.min(0, Math.min(...values));
  const maxY   = Math.max(...values);
  const yRange = (maxY - minY) || 1;

  const xScale = i => (i / Math.max(1, (data.length - 1))) * innerW;
  const yScale = v => innerH - ((v - minY) / yRange) * innerH;

  const linePath = data
    .map((d, i) => {
      const x = pad.left + xScale(i);
      const y = pad.top  + yScale(d.value);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const yTicks = 5;
  const xFirst = 0;
  const xMid   = Math.floor(data.length / 2);
  const xLast  = data.length - 1;

  const pointLabelSize = 9;   // nhỏ để không chồng
  const axisLabelSize  = 10;

  return (
    <div className="linechart-card">
      <div className="linechart-header">
        <div className="linechart-title">{label}</div>
        <div className="linechart-badge">{data.length} ngày</div>
      </div>

      <div className="linechart chart-wrap" role="img" aria-label={label}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* trục */}
          <line x1={pad.left} y1={pad.top}          x2={pad.left}      y2={pad.top + innerH} stroke="#e5e7eb" />
          <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} stroke="#e5e7eb" />

          {/* lưới ngang + nhãn Y */}
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const t = i / yTicks;
            const v = minY + (1 - t) * yRange;
            const y = pad.top + (t * innerH);
            return (
              <g key={i}>
                <line x1={pad.left} y1={y} x2={pad.left + innerW} y2={y} stroke="#f3f4f6" />
                <text
                  x={pad.left - 8}
                  y={y}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fontSize={axisLabelSize}
                  fill="#6b7280"
                >
                  {Math.round(v)} {unit}
                </text>
              </g>
            );
          })}

          {/* đường */}
          <path
            d={linePath}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* điểm + nhãn */}
          {data.map((d, i) => {
            const cx = pad.left + xScale(i);
            const cy = pad.top  + yScale(d.value);
            return (
              <g key={d.date || i}>
                <circle cx={cx} cy={cy} r="3.5" fill="#ef4444" />
                <text x={cx} y={cy - 8} textAnchor="middle" fontSize={pointLabelSize} fill="#6b7280">
                  {Math.round(d.value)}
                </text>
              </g>
            );
          })}

          {/* nhãn trục X: đầu - giữa - cuối */}
          {[xFirst, xMid, xLast].map((idx, i) => {
            const x = pad.left + xScale(idx);
            const y = pad.top + innerH;
            const labelText = data[idx]?.date || `${idx + 1}`;
            return (
              <g key={i}>
                <line x1={x} y1={y} x2={x} y2={y + 4} stroke="#9ca3af" />
                <text x={x} y={y + 16} textAnchor="middle" fontSize={axisLabelSize} fill="#6b7280">
                  {labelText}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab]   = useState("overview");
  const [type, setType] = useState("coin");

  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => todayStr());

  const [kpi, setKpi] = useState({
    totalPlayers: 0,
    bannedPlayers: 0,
    online: 0,
    gamesToday: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Coin stats
  const [coinStats, setCoinStats]                 = useState(null);
  const [loadingCoinStats, setLoadingCoinStats]   = useState(false);
  const [errorCoinStats, setErrorCoinStats]       = useState(null);

  // Player stats
  const [playerStats, setPlayerStats]             = useState(null);
  const [loadingPlayerStats, setLoadingPlayerStats] = useState(false);
  const [errorPlayerStats, setErrorPlayerStats]   = useState(null);

  // Matches (tổng theo khoảng)
  const [matchesTotal, setMatchesTotal]           = useState(null);
  const [loadingMatches, setLoadingMatches]       = useState(false);
  const [errorMatches, setErrorMatches]           = useState(null);

  // Series cho biểu đồ
  const [seriesData, setSeriesData]               = useState(null);
  const [loadingSeries, setLoadingSeries]         = useState(false);
  const [errorSeries, setErrorSeries]             = useState(null);

  // KPI tổng quan + games hôm nay
  useEffect(() => {
    if (tab !== "overview") return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = todayStr();
        const [total, banned, online, gamesToday] = await Promise.all([
          fetchTotalPlayers(),
          fetchTotalBannedPlayers(),
          fetchOnlinePlayers(),
          fetchTotalGames(today, today),
        ]);

        setKpi(prev => ({
          ...prev,
          totalPlayers: total,
          bannedPlayers: banned,
          online,
          gamesToday: Number(gamesToday) || 0,
        }));
      } catch (err) {
        console.error(err);
        setError("Không thể tải được dữ liệu từ server. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [tab]);

  const days = useMemo(() => (!from || !to ? 1 : diffDaysInclusive(from, to)), [from, to]);

  const periodLabel = useMemo(
    () => (!from || !to ? "" : isFullSingleMonth(from, to) ? "1T" : `${days} ngày`),
    [from, to, days]
  );

  const isLoading =
    type === "coin"    ? (loadingCoinStats || loadingSeries)
  : type === "players" ? (loadingPlayerStats || loadingSeries)
  : type === "matches" ? (loadingMatches || loadingSeries)
  : false;

  const btnLabel = isLoading ? "Đang tải..." : "Xem thống kê";

  const onView = async () => {
    // reset
    setCoinStats(null); setErrorCoinStats(null); setLoadingCoinStats(false);
    setPlayerStats(null); setErrorPlayerStats(null); setLoadingPlayerStats(false);
    setMatchesTotal(null); setErrorMatches(null); setLoadingMatches(false);
    setSeriesData(null); setErrorSeries(null);

    // chart series (theo type)
    setLoadingSeries(true);
    try {
      let series = [];
      if (type === "coin") {
        setLoadingCoinStats(true);
        const stats = await fetchCoinStats(from, to);
        setCoinStats(stats);
        setLoadingCoinStats(false);

        series = await fetchCoinSeries(from, to);               // [{date, totalVolume, ...}]
        series = series.map(d => ({ date: d.date, value: d.totalVolume }));
      } else if (type === "players") {
        setLoadingPlayerStats(true);
        const stats = await fetchPlayerStats(from, to);
        setPlayerStats(stats);
        setLoadingPlayerStats(false);

        series = await fetchActivePlayersSeries(from, to);      // [{date, activeByTx}]
        series = series.map(d => ({ date: d.date, value: d.activeByTx }));
      } else if (type === "matches") {
        setLoadingMatches(true);
        const total = await fetchTotalGames(from, to);
        setMatchesTotal(Number(total) || 0);
        setLoadingMatches(false);

        series = await fetchMatchesSeries(from, to);            // [{date, totalGames}]
        series = series.map(d => ({ date: d.date, value: d.totalGames }));
      }

      // đảm bảo tất cả ngày đều có (0 nếu trống)
      const daysArr = [];
      for (
        let d = parseISO(from);
        d <= parseISO(to);
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
      ) {
        daysArr.push(d.toISOString().split("T")[0]);
      }
      const map = Object.fromEntries(series.map(s => [s.date, s.value]));
      const normalized = daysArr.map(ds => ({ date: ds, value: Number(map[ds] || 0) }));
      setSeriesData(normalized);
    } catch (err) {
      console.error(err);
      setErrorSeries("Không thể tải dữ liệu chuỗi thời gian.");
    } finally {
      setLoadingSeries(false);
    }
  };

  if (loading && tab === "overview") {
    return (
      <div className="admin-dashboard" style={{ textAlign: "center", padding: 16 }}>
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <TabSwitch
          tabs={[
            { value: "overview", label: "Tổng quan" },
            { value: "public",   label: "Bản public / Tables" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {error && (
        <div className="error-message">
          <strong className="font-bold">Lỗi!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {tab === "overview" ? (
        <>
          <div className="kpi-overview">
            <StatCard label="Tổng người chơi" value={fmt.format(kpi.totalPlayers)} icon={<UserIcon className="icon-16" />} />
            <StatCard label="Đang online (realtime)" value={fmt.format(kpi.online)} icon={<SignalIcon className="icon-16" />} />
            <StatCard label="Người chơi bị ban" value={fmt.format(kpi.bannedPlayers)} icon={<ExclamationTriangleIcon className="icon-16" />} />
            <StatCard label="Ván hôm nay" value={fmt.format(kpi.gamesToday)} icon={<CalendarDaysIcon className="icon-16" />} />
          </div>

          <div className="stats-box">
            <div className="stats-box__title">Thống kê tuỳ chọn</div>

            <div className="stats-box__form">
              <div className="form-group">
                <label htmlFor="type-select" className="form-label">Loại thống kê</label>
                <Select id="type-select" value={type} onChange={setType} options={TYPE_OPTS} />
              </div>

              <div className="form-group">
                <label htmlFor="from-date" className="form-label">Từ ngày</label>
                <input id="from-date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="form-input" />
              </div>

              <div className="form-group">
                <label htmlFor="to-date" className="form-label">Đến ngày</label>
                <input id="to-date" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="form-input" />
              </div>
            </div>

            <div className="stats-box__actions">
              <button
                onClick={onView}
                disabled={isLoading}
                className="button button--primary"
                title={`Xem thống kê ${type}`}
              >
                <ChartBarIcon className="icon-16" />
                <span>{btnLabel}</span>
              </button>
            </div>

            {/* COIN */}
            {type === "coin" && errorCoinStats && <div className="error-message mt-4">{errorCoinStats}</div>}
            {type === "coin" && coinStats && !loadingCoinStats && !errorCoinStats && (
              <div className="mt-6 border-t pt-4 space-y-2 text-sm">
                <h3 className="font-semibold text-gray-600">Kết quả ({periodLabel}):</h3>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tổng Volume Giao Dịch:</span>
                  <span className="font-medium text-gray-800">{fmt.format(coinStats.totalVolume)} coin</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số Lượng Giao Dịch:</span>
                  <span className="font-medium text-gray-800">{fmt.format(coinStats.transactionCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Trung Bình / Giao Dịch:</span>
                  <span className="font-medium text-gray-800">{fmt.format(Math.round(coinStats.averageTransaction))} coin</span>
                </div>
              </div>
            )}

            {/* PLAYERS */}
            {type === "players" && errorPlayerStats && <div className="error-message mt-4">{errorPlayerStats}</div>}
            {type === "players" && playerStats && !loadingPlayerStats && !errorPlayerStats && (
              <div className="mt-6 border-t pt-4 space-y-2 text-sm">
                <h3 className="font-semibold text-gray-600">Kết quả ({periodLabel}):</h3>
                <div className="flex justify-between border-b pb-1 mb-1">
                  <span className="text-gray-500">Tổng đăng ký (không bị ban):</span>
                  <span className="font-medium text-gray-800">{fmt.format(playerStats.totalRegistered)}</span>
                </div>
                <div className="flex justify-between border-b pb-1 mb-1">
                  <span className="text-gray-500">Tổng số bị ban:</span>
                  <span className="font-medium text-gray-800">{fmt.format(playerStats.totalBanned)}</span>
                </div>
                <div className="flex justify-between border-b pb-1 mb-1">
                  <span className="text-gray-500">Đang online (hiện tại):</span>
                  <span className="font-medium text-gray-800">{fmt.format(playerStats.currentlyOnline)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500">Hoạt động (Giao dịch):</span>
                  <span className="font-medium text-gray-800">{fmt.format(playerStats.activeByTx)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hoạt động (Thắng game):</span>
                  <span className="font-medium text-gray-800">{fmt.format(playerStats.activeByWin)}</span>
                </div>
              </div>
            )}

            {/* MATCHES */}
            {type === "matches" && errorMatches && <div className="error-message mt-4">{errorMatches}</div>}
            {type === "matches" && matchesTotal !== null && !loadingMatches && !errorMatches && (
              <div className="mt-6 border-t pt-4 space-y-2 text-sm">
                <h3 className="font-semibold text-gray-600">Kết quả ({periodLabel}):</h3>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tổng số ván chơi:</span>
                  <span className="font-medium text-gray-800">{fmt.format(matchesTotal)}</span>
                </div>
              </div>
            )}

            {/* ===== BIỂU ĐỒ (DƯỚI CÙNG) ===== */}
            {seriesData && seriesData.length > 0 && !loadingSeries && !errorSeries && (
              <LineChart
                data={seriesData}
                label={
                  type === "coin"
                    ? `Biểu đồ Coin theo ngày (${periodLabel})`
                    : type === "players"
                    ? `Người chơi active theo ngày (${periodLabel})`
                    : `Ván chơi theo ngày (${periodLabel})`
                }
                unit={type === "coin" ? "coin" : type === "players" ? "người" : "ván"}
              />
            )}
            {errorSeries && <div className="error-message mt-4">{errorSeries}</div>}
          </div>
        </>
      ) : (
        <PublicTables from={from} to={to} />
      )}
    </div>
  );
}
