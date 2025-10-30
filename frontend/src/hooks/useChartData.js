// src/hooks/useChartData.js
import { useState, useCallback } from 'react';
import { 
  fetchDailyCoinStats, 
  fetchDailyActivePlayers, 
  fetchDailyGamesPlayed 
} from '../api.js'; // Đảm bảo đường dẫn đúng
import { parseISO } from '../utils/dateUtils.js'; // Giả sử bạn tách hàm parseISO ra utils

// Options lấy từ Dashboard hoặc định nghĩa lại ở đây nếu cần
const TYPE_OPTS = [
    { value: "coin", label: "Coin" },
    { value: "players", label: "Người chơi (active)" },
    { value: "matches", label: "Ván chơi" },
    // ...
];

export function useChartData() {
  // State cho dữ liệu biểu đồ và trạng thái loading/error
  const [chartData, setChartData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [errorChart, setErrorChart] = useState(null);

  // Hàm fetch dữ liệu (dùng useCallback để tránh tạo lại không cần thiết)
  const fetchChartData = useCallback(async (type, from, to, periodLabel) => {
    setChartData(null); // Reset chart cũ
    setErrorChart(null);
    setLoadingChart(true);

    try {
      let dailyData;
      let apiLabel = TYPE_OPTS.find(o => o.value === type)?.label || type;

      // Gọi API hàng ngày dựa trên 'type'
      if (type === 'coin') {
        dailyData = await fetchDailyCoinStats(from, to);
        apiLabel = 'Volume Coin Hàng Ngày';
      } else if (type === 'players') {
        dailyData = await fetchDailyActivePlayers(from, to);
        apiLabel = 'Người Chơi Hoạt Động Hàng Ngày';
      } else if (type === 'matches') {
        dailyData = await fetchDailyGamesPlayed(from, to);
        apiLabel = 'Số Ván Chơi Hàng Ngày';
      } else {
        alert(`Chức năng thống kê biểu đồ cho "${apiLabel}" chưa được cài đặt.`);
        throw new Error("Unsupported type");
      }

      // Xử lý dữ liệu cho Chart.js
      if (dailyData && dailyData.length > 0) {
        const labels = dailyData.map(item => {
            const dateObj = parseISO(item.date); // Sử dụng hàm parseISO đã import
            return !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'Invalid Date';
        });
        const dataPoints = dailyData.map(item => {
            if (type === 'coin') return item.totalVolume;
            if (type === 'players') return item.activePlayers;
            if (type === 'matches') return item.gamesPlayed;
            return 0;
        });

        // Cập nhật state chartData
        setChartData({
          labels,
          datasets: [{
              label: `${apiLabel} (${periodLabel})`,
              data: dataPoints,
              borderColor: 'rgb(79, 70, 229)',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              tension: 0.1, fill: true, pointRadius: 2, pointHoverRadius: 4,
          }],
        });
        setErrorChart(null);
      } else {
         setChartData(null);
         setErrorChart(`Không có dữ liệu ${apiLabel.toLowerCase()} nào trong khoảng ${periodLabel} này.`);
      }

    } catch (err) {
      console.error(`Lỗi khi lấy dữ liệu ${type} hàng ngày:`, err);
      if (err.message !== "Unsupported type") {
        setErrorChart(`Không thể tải dữ liệu biểu đồ cho ${type}.`);
      }
      setChartData(null);
    } finally {
      setLoadingChart(false);
    }
  }, []); // useCallback không có dependency vì các hàm API ổn định

  // Trả về dữ liệu, trạng thái và hàm fetch
  return { chartData, loadingChart, errorChart, fetchChartData };
}