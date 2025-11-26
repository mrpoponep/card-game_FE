// src/hooks/useKpiData.js
import { useState, useEffect } from 'react';
import { 
  fetchTotalPlayers, 
  fetchTotalBannedPlayers, 
  fetchOnlinePlayers, 
  fetchGamesToday 
} from '../api.js'; // Đảm bảo đường dẫn đúng

export function useKpiData(tab) {
  // State cho dữ liệu KPI và trạng thái loading/error
  const [kpi, setKpi] = useState({ totalPlayers: 0, bannedPlayers: 0, online: 0, gamesToday: 0 });
  const [loadingKpi, setLoadingKpi] = useState(true);
  const [errorKpi, setErrorKpi] = useState(null);

  // Fetch dữ liệu KPI khi tab là 'overview'
  useEffect(() => {
    // Chỉ fetch khi tab là 'overview' và chưa fetch xong (tránh gọi lại liên tục)
    if (tab === "overview") {
      const fetchDashboardData = async () => {
        setLoadingKpi(true); 
        setErrorKpi(null);
        try {
          // Gọi đồng thời các API
          const [total, banned, online, games] = await Promise.all([
            fetchTotalPlayers(),
            fetchTotalBannedPlayers(),
            fetchOnlinePlayers(),
            fetchGamesToday()
          ]);
          // Cập nhật state
          setKpi({ totalPlayers: total, bannedPlayers: banned, online: online, gamesToday: games });
        } catch (err) {
          setErrorKpi("Không thể tải được dữ liệu KPI.");
          console.error("Lỗi useKpiData:", err);
        } finally {
          setLoadingKpi(false);
        }
      };
      fetchDashboardData();
    } else {
        // Reset loading nếu chuyển sang tab khác không phải overview
        setLoadingKpi(false); 
    }
  }, [tab]); // Phụ thuộc vào tab

  return { kpi, loadingKpi, errorKpi };
}