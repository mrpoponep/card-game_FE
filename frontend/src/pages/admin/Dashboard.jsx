import React from "react";
import "./Dashboard.css";

import PublicTables from "../../pages/admin/PublicTables";
import DashboardHeader from "../../components/admin/DashboardHeader";
import KpiOverview from "../../components/admin/KpiOverview";
import StatsForm from "../../components/admin/StatsForm";
import ResultBlocks from "../../components/admin/ResultBlocks";
import SeriesChart from "../../components/admin/SeriesChart";

import { TYPE_OPTS, numberFmt as fmt } from "./constants";
import { useTimeRange } from "../../hooks/useTimeRange";
import { useKpiOverview } from "../../hooks/useKpiOverview";
import { useOnlineSocket } from "../../hooks/useOnlineSocket";
import { useSeriesData } from "../../hooks/useSeriesData";

export default function Dashboard() {
  const [tab, setTab]   = React.useState("overview");
  const [type, setType] = React.useState("coin");

  const { from, to, setFrom, setTo, periodLabel } = useTimeRange(1);
  const { kpi, setKpi, loading, error } = useKpiOverview(tab);

  useOnlineSocket((count) => setKpi(prev => ({ ...prev, online: count })));

  const {
    coinStats, playerStats, matchesTotal, tablesTotal,
    loadingCoinStats, loadingPlayerStats, loadingMatches, loadingTables, loadingSeries,
    errorCoinStats, errorPlayerStats, errorMatches, errorTables, errorSeries,
    seriesData, onView, isLoading
  } = useSeriesData();

  if (loading && tab === "overview") {
    return (
      <div className="admin-dashboard" style={{ textAlign: "center", padding: 16 }}>
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <DashboardHeader tab={tab} onChange={setTab} />

      {error && (
        <div className="error-message">
          <strong className="font-bold">Lỗi!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {tab === "overview" ? (
        <>
          <KpiOverview kpi={kpi} />

          <div className="stats-box">
            <div className="stats-box__title">Thống kê tuỳ chọn</div>

            <StatsForm
              type={type}
              setType={setType}
              TYPE_OPTS={TYPE_OPTS}
              from={from}
              to={to}
              setFrom={setFrom}
              setTo={setTo}
              onView={onView}
              isLoading={isLoading}
            />

            <ResultBlocks
              type={type}
              periodLabel={periodLabel}
              coinStats={coinStats}
              playerStats={playerStats}
              matchesTotal={matchesTotal}
              tablesTotal={tablesTotal}
              loadingCoinStats={loadingCoinStats}
              loadingPlayerStats={loadingPlayerStats}
              loadingMatches={loadingMatches}
              loadingTables={loadingTables}
              errorCoinStats={errorCoinStats}
              errorPlayerStats={errorPlayerStats}
              errorMatches={errorMatches}
              errorTables={errorTables}
            />

            <SeriesChart
              type={type}
              data={seriesData}
              loadingSeries={loadingSeries}
              errorSeries={errorSeries}
            />
          </div>
        </>
      ) : (
        <PublicTables from={from} to={to} />
      )}
    </div>
  );
}
