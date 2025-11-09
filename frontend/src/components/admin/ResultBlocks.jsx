import React from "react";
import { numberFmt as fmt } from "../../pages/admin/constants";

export default function ResultBlocks({
  type, periodLabel,
  coinStats, playerStats, matchesTotal, tablesTotal,
  loadingCoinStats, loadingPlayerStats, loadingMatches, loadingTables,
  errorCoinStats, errorPlayerStats, errorMatches, errorTables
}) {
  // COIN
  if (type === "coin") {
    if (errorCoinStats) return <div className="error-message mt-4">{errorCoinStats}</div>;
    if (!coinStats || loadingCoinStats) return null;
    return (
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
    );
  }

  // PLAYERS
  if (type === "players") {
    if (errorPlayerStats) return <div className="error-message mt-4">{errorPlayerStats}</div>;
    if (!playerStats || loadingPlayerStats) return null;
    const value =
      playerStats?.activePlayersInPeriod ??
      playerStats?.totalActive ??
      playerStats?.activeByTx ??
      playerStats?.activeByWin ??
      playerStats?.active ?? 0;
    return (
      <div className="mt-6 border-t pt-4 space-y-2 text-sm">
        <h3 className="font-semibold text-gray-600">Kết quả ({periodLabel}):</h3>
        <div className="flex justify-between">
          <span className="text-gray-500">Người chơi active (tổng):</span>
          <span className="font-medium text-gray-800">{fmt.format(value)}</span>
        </div>
      </div>
    );
  }

  // MATCHES
  if (type === "matches") {
    if (errorMatches) return <div className="error-message mt-4">{errorMatches}</div>;
    if (matchesTotal === null || loadingMatches) return null;
    return (
      <div className="mt-6 border-t pt-4 space-y-2 text-sm">
        <h3 className="font-semibold text-gray-600">Kết quả ({periodLabel}):</h3>
        <div className="flex justify-between">
          <span className="text-gray-500">Tổng số ván chơi:</span>
          <span className="font-medium text-gray-800">{fmt.format(matchesTotal)}</span>
        </div>
      </div>
    );
  }

  // TABLES
  if (type === "tables") {
    if (errorTables) return <div className="error-message mt-4">{errorTables}</div>;
    if (tablesTotal === null || loadingTables) return null;
    return (
      <div className="mt-6 border-t pt-4 space-y-2 text-sm">
        <h3 className="font-semibold text-gray-600">Kết quả ({periodLabel}):</h3>
        <div className="flex justify-between">
          <span className="text-gray-500">Tổng bàn được dùng :</span>
          <span className="font-medium text-gray-800">{fmt.format(tablesTotal)} bàn</span>
        </div>
      </div>
    );
  }

  return null;
}
