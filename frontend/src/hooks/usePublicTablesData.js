// usePublicTablesData.js
import { useCallback, useEffect, useState } from "react";
import { fetchTables, fetchTableMetrics } from "../api";

export function usePublicTablesData(defaultType = "public") {
  const [type] = useState(defaultType);
  const [rows, setRows] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [metrics, setMetrics] = useState({
    totalTables: 0,
    publicTables: 0,
    privateTables: 0,
    activeTables: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  const loadList = useCallback(async () => {
    try {
      setLoadingList(true);
      setListError(null);
      const tablesData = await fetchTables(type);
      setRows(tablesData);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setListError("Lỗi khi tải danh sách bàn.");
    } finally {
      setLoadingList(false);
    }
  }, [type]);

  const loadMetrics = useCallback(async () => {
    try {
      setLoadingMetrics(true);
      setMetricsError(null);
      const data = await fetchTableMetrics();
      setMetrics({
        totalTables: data.totalTables,
        publicTables: data.publicTables,
        privateTables: data.privateTables,
        activeTables: data.activeTables, 
      });
    } catch (err) {
      console.error("Lỗi tải metrics:", err);
      setMetricsError("Không thể tải số liệu bàn.");
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  return {
    rows, setRows,
    loadingList, listError,
    reloadList: loadList,

    metrics,
    loadingMetrics, metricsError,
    reloadMetrics: loadMetrics,
  };
}
