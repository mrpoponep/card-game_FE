// src/components/admin/CustomStats.jsx
import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import Select from './Select'; // Đảm bảo đường dẫn đúng
import { useChartData } from '../../hooks/useChartData'; // Import hook
import { diffDaysInclusive, isFullSingleMonth } from '../../utils/dateUtils.js'; // Import date helpers
import { ChartBarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const TYPE_OPTS = [
    { value: "coin", label: "Coin" },
    { value: "players", label: "Người chơi (active)" },
    { value: "matches", label: "Ván chơi" },
    { value: "tables", label: "Bàn (được dùng)" }, // API chưa có
];
const fmt = new Intl.NumberFormat("vi-VN");

function CustomStats() {
  // State cho form
  const [type, setType] = useState("coin");
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  // Sử dụng hook để quản lý dữ liệu chart và fetch
  const { chartData, loadingChart, errorChart, fetchChartData } = useChartData();

  // Tính toán nhãn thời gian
  const days = useMemo(() => diffDaysInclusive(from, to), [from, to]);
  const periodLabel = useMemo(() => isFullSingleMonth(from, to) ? "1 Tháng" : `${days} ngày`, [from, to, days]);

  // Hàm xử lý khi nhấn nút "Xem thống kê"
  const handleView = () => {
    // Gọi hàm fetch từ hook với state hiện tại
    fetchChartData(type, from, to, periodLabel); 
  };

  return (
    <div className="stats-box">
      <h2 className="stats-box__title">Thống kê tuỳ chọn & Biểu đồ</h2>

      {/* Form */}
      <div className="stats-box__form">
        <div className="form-group">
          <label htmlFor="type-select-custom" className="form-label">Loại thống kê</label>
          <Select id="type-select-custom" value={type} onChange={setType} options={TYPE_OPTS} />
        </div>
        <div className="form-group">
          <label htmlFor="from-date-custom" className="form-label">Từ ngày</label>
          <input id="from-date-custom" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="to-date-custom" className="form-label">Đến ngày</label>
          <input id="to-date-custom" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="form-input" />
        </div>
        <div className="stats-box__actions">
          <button
            onClick={handleView} // Gọi handleView
            disabled={loadingChart}
            className={`button button--primary ${loadingChart ? 'button--loading' : ''}`}
            title={`Xem thống kê & biểu đồ ${TYPE_OPTS.find(o => o.value === type)?.label || type}`}
          >
            <ChartBarIcon className="icon-16" />
            <span>{loadingChart ? 'Đang tải...' : 'Xem thống kê'}</span>
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="chart-container">
        {loadingChart ? (
            <div className="loading-placeholder">Đang tải dữ liệu biểu đồ...</div>
        ) : errorChart ? (
            <div className="error-message">{errorChart}</div>
        ) : chartData ? (
            <Line
              options={{ /* ... chart options ... */ 
                responsive: true, maintainAspectRatio: false, 
                plugins: { legend: { display: true, position: 'bottom' } }, 
                scales: { y: { beginAtZero: true } } 
              }}
              data={chartData}
              height={300}
            />
        ) : (
           <div className="no-chart-data">Chọn loại thống kê và nhấn "Xem" để hiển thị biểu đồ.</div>
        )}
      </div>
    </div>
  );
}

export default CustomStats;