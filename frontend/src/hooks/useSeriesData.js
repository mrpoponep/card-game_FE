// hooks/useSeriesData.js
import { useState } from "react";
import {
  fetchCoinStats,
  fetchPlayerStats,
  fetchTotalGames,
  fetchCoinSeries,
  fetchActivePlayersSeries,
  fetchMatchesSeries,
  fetchActiveTablesSeries,      
  fetchTotalActiveTables        
} from "../api";
import { parseISO } from "../utils/dateUtils";

export function useSeriesData() {
  const [coinStats, setCoinStats] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [matchesTotal, setMatchesTotal] = useState(null);
  const [tablesTotal, setTablesTotal] = useState(null); 

  const [loadingCoinStats, setLoadingCoinStats] = useState(false);
  const [loadingPlayerStats, setLoadingPlayerStats] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false); 
  const [loadingSeries, setLoadingSeries] = useState(false);

  const [errorCoinStats, setErrorCoinStats] = useState(null);
  const [errorPlayerStats, setErrorPlayerStats] = useState(null);
  const [errorMatches, setErrorMatches] = useState(null);
  const [errorTables, setErrorTables] = useState(null); 
  const [errorSeries, setErrorSeries] = useState(null);

  const [seriesData, setSeriesData] = useState(null);

  async function onView(type, from, to) {
    setCoinStats(null); setPlayerStats(null); setMatchesTotal(null); setTablesTotal(null);
    setSeriesData(null);
    setErrorCoinStats(null); setErrorPlayerStats(null); setErrorMatches(null);
    setErrorTables(null); setErrorSeries(null);

    setLoadingSeries(true);
    try {
      let series = [];

      if (type === "coin") {
        setLoadingCoinStats(true);
        const stats = await fetchCoinStats(from, to);
        setCoinStats(stats);
        setLoadingCoinStats(false);

        series = await fetchCoinSeries(from, to);
        series = series.map(d => ({ date: d.date, value: d.totalVolume }));

      } else if (type === "players") {
        setLoadingPlayerStats(true);
        const stats = await fetchPlayerStats(from, to);
        setPlayerStats(stats);
        setLoadingPlayerStats(false);

        series = await fetchActivePlayersSeries(from, to);
        series = series.map(d => ({ date: d.date, value: d.activeByTx }));

      } else if (type === "matches") {
        setLoadingMatches(true);
        const total = await fetchTotalGames(from, to);
        setMatchesTotal(Number(total) || 0);
        setLoadingMatches(false);

        series = await fetchMatchesSeries(from, to);
        series = series.map(d => ({ date: d.date, value: d.totalGames }));

      } else if (type === "tables") {
        setLoadingTables(true); 
        const total = await fetchTotalActiveTables(from, to);
        setTablesTotal(total);
        setLoadingTables(false); 

        series = await fetchActiveTablesSeries(from, to);
        series = series.map(d => ({ date: d.date, value: d.activeTables }));
      }

      const days = [];
      let cur = parseISO(from);
      const end = parseISO(to);
      while (cur <= end) {
        days.push(cur.toISOString().split("T")[0]);
        cur = new Date(cur);
        cur.setDate(cur.getDate() + 1);
      }
      const map = Object.fromEntries(series.map(s => [s.date, s.value]));
      const normalized = days.map(date => ({ date, value: Number(map[date] || 0) }));
      setSeriesData(normalized);

    } catch (err) {
      console.error("Lỗi onView:", err);
      setErrorSeries("Không thể tải dữ liệu biểu đồ.");
    } finally {
      setLoadingSeries(false);
    }
  }

  const isLoading = loadingCoinStats || loadingPlayerStats || loadingMatches || loadingTables || loadingSeries;

  return {
    // Dữ liệu
    coinStats,
    playerStats,
    matchesTotal,
    tablesTotal,       

    // Loading
    loadingCoinStats,
    loadingPlayerStats,
    loadingMatches,
    loadingTables,     
    loadingSeries,
    isLoading,

    // Error
    errorCoinStats,
    errorPlayerStats,
    errorMatches,
    errorTables,        
    errorSeries,

    // Chart
    seriesData,
    onView,
  };
}