import { useEffect, useState } from "react";
import {
  fetchTotalBannedPlayers,
  fetchTotalPlayers,
  fetchOnlinePlayers,
  fetchTotalGames
} from "../api";
import { todayStr } from "../utils/dateUtils";

export function useKpiOverview(activeTab) {
  const [kpi, setKpi] = useState({
    totalPlayers: 0,
    bannedPlayers: 0,
    online: 0,
    gamesToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (activeTab !== "overview") return;
    let cancelled = false;

    const run = async () => {
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
        if (cancelled) return;
        setKpi(prev => ({
          ...prev,
          totalPlayers: total,
          bannedPlayers: banned,
          online,
          gamesToday: Number(gamesToday) || 0,
        }));
      } catch {
        if (!cancelled) setError("Không thể tải được dữ liệu từ server. Vui lòng thử lại.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();

    return () => { cancelled = true; };
  }, [activeTab]);

  return { kpi, setKpi, loading, error };
}
