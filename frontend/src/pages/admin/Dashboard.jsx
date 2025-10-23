import React, { useMemo, useState, useEffect } from "react";
import { fetchTotalBannedPlayers, fetchTotalPlayers, fetchOnlinePlayers, fetchCoinStats, fetchPlayerStats } from "../../api";
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

 TYPE_OPTS = [
  { value: "coin", label: "Coin" },
  { value: "players", label: "Người chơi (active)" },
  { value: "matches", label: "Ván chơi" },
  { value: "tables", label: "Bàn (được dùng)" },
];

const fmt = new Intl.NumberFormat("vi-VN");

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
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  const [kpi, setKpi] = useState({
    totalPlayers: 0,
    bannedPlayers: 0,
    online: 0,
    gamesToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [coinStats, setCoinStats] = useState(null); // Lưu kết quả {totalVolume, ...}
  const [loadingCoinStats, setLoadingCoinStats] = useState(false); // Loading riêng
  const [errorCoinStats, setErrorCoinStats] = useState(null);   // Lỗi riêng

  const [playerStats, setPlayerStats] = useState(null);
  const [loadingPlayerStats, setLoadingPlayerStats] = useState(false);
  const [errorPlayerStats, setErrorPlayerStats] = useState(null);

  useEffect(() => {
    if (tab === "overview") {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          setError(null);
          const [total, banned, online] = await Promise.all([
            fetchTotalPlayers(),
            fetchTotalBannedPlayers(),
            fetchOnlinePlayers()
          ]);
          setKpi((prev) => ({ ...prev, totalPlayers: total, bannedPlayers: banned, online }));
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

  const days = useMemo(() => (!from || !to) ? 1 : diffDaysInclusive(from, to), [from, to]);
  const periodLabel = useMemo(
    () => (!from || !to) ? "" : (isFullSingleMonth(from, to) ? "1T" : `${days} ngày`),
    [from, to, days]
  );

  const customStatsTotal = 0;
  const avg = useMemo(
    () => (type === "coin" && days > 0) ? Math.round(customStatsTotal / days) : null,
    [type, days, customStatsTotal]
  );

// ...
  // Bỏ const avg = useMemo(...) cũ đi, vì chúng ta sẽ hiển thị trực tiếp từ coinStats

  // Hàm xử lý khi nhấn nút "Xem thống kê"
  const onView = async () => {
    setCoinStats(null);
    setPlayerStats(null);
    setErrorCoinStats(null);
    setErrorPlayerStats(null);
    // Chỉ xử lý khi đang chọn loại 'coin'
    if (type === 'coin') {
      setLoadingCoinStats(true); // Bắt đầu loading
      setErrorCoinStats(null);   // Xóa lỗi cũ
      setCoinStats(null);      // Xóa kết quả cũ
      try {
        // Gọi API với ngày tháng đang chọn
        const stats = await fetchCoinStats(from, to);
        setCoinStats(stats); // Lưu kết quả vào state
      } catch (err) {
        console.error("Lỗi khi lấy thống kê coin:", err);
        setErrorCoinStats("Không thể tải thống kê coin."); // Hiển thị lỗi
      } finally {
        setLoadingCoinStats(false); // Dừng loading
      }}
    else if (type === 'players') {
      setLoadingPlayerStats(true);
      try {
        const stats = await fetchPlayerStats(from, to);
        setPlayerStats(stats);
      } catch (err) {
        console.error("Lỗi khi lấy thống kê người chơi:", err);
        setErrorPlayerStats("Không thể tải thống kê người chơi.");
      } finally {
        setLoadingPlayerStats(false);
      }
    } 
    else {
      // TODO: Xử lý cho matches, tables
      alert(`Chức năng thống kê cho "${type}" chưa được cài đặt.`);
    }
  };


  if (loading && tab === "overview") {
    return <div className="admin-dashboard" style={{ textAlign: "center", padding: 16 }}>Đang tải dữ liệu tổng quan...</div>;
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
            <StatCard
              label="Tổng người chơi"
              value={fmt.format(kpi.totalPlayers)}
              icon={<UserIcon className="icon-16" />}
            />
            <StatCard
              label="Đang online (realtime)"
              value={fmt.format(kpi.online)}
              icon={<SignalIcon className="icon-16" />}
            />
            <StatCard
              label="Người chơi bị ban"
              value={fmt.format(kpi.bannedPlayers)}
              icon={<ExclamationTriangleIcon className="icon-16" />}
            />
            <StatCard
              label="Ván hôm nay"
              value={fmt.format(kpi.gamesToday)}
              icon={<CalendarDaysIcon className="icon-16" />}
            />
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

              {/*<div className="stats-box__result">
                <span className="result-label">
                  {type === "coin" ? "Avg:" : "Tổng:"} {periodLabel}
                </span>
                <span className="result-value">
                  {fmt.format(type === "coin" && avg !== null ? avg : customStatsTotal)}{" "}
                  {type === "coin" ? "coin" : type === "players" ? "người" : type === "matches" ? "ván" : "bàn"}
                </span>
                {type === "coin" && <ArrowPathIcon className="icon-12" />}
              </div>*/}
            </div> 

            <div className="stats-box__actions">
              <button
                onClick={onView}
                // ✅ BỎ disabled={true} VÀ THAY BẰNG disabled={loadingCoinStats}
                disabled={loadingCoinStats} 
                // ✅ THAY class button--primary (và bỏ button--disabled nếu có)
                className="button button--primary" 
                title="Xem thống kê Coin" // Cập nhật title
              >
                <ChartBarIcon className="icon-16" />
                {/* Hiển thị chữ "Đang tải..." khi loading */}
                <span>{loadingCoinStats ? 'Đang tải...' : 'Xem thống kê'}</span> 
              </button>
            </div>
{/* 🌟 KHU VỰC HIỂN THỊ KẾT QUẢ MỚI 🌟 */}
            {/* Hiển thị lỗi nếu có */}
            {errorCoinStats && (
              <div className="error-message mt-4">{errorCoinStats}</div>
            )}
            {/* Hiển thị kết quả nếu có (và type là coin) */}
            {type === 'coin' && coinStats && !loadingCoinStats && !errorCoinStats && (
              <div className="mt-6 border-t pt-4 space-y-2 text-sm"> {/* Thêm style */}
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
{/* 🌟 HIỂN THỊ LỖI PLAYER STATS 🌟 */}
            {errorPlayerStats && (
              <div className="error-message mt-4">{errorPlayerStats}</div>
            )}
            {/* 🌟 HIỂN THỊ KẾT QUẢ PLAYER STATS 🌟 */}
            {type === 'players' && playerStats && !loadingPlayerStats && !errorPlayerStats && (
              <div className="mt-6 border-t pt-4 space-y-2 text-sm">
                <h3 className="font-semibold text-gray-600">Kết quả ({periodLabel}):</h3>
                {/* Các chỉ số không theo ngày */}
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
                 {/* Các chỉ số theo ngày */}
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

            {/* Placeholder biểu đồ */}
            {/* <div className="chart-placeholder">...</div> */}
          </div>
        </>
      ) : (
        <PublicTables from={from} to={to} />
      )}
    </div>
  );
}