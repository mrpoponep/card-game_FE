import React, { useMemo, useState, useCallback } from "react";
import "./PublicTables.css";
import MetricsCards from "../../components/admin/MetricsCards";
import TableRow from "../../components/admin/TableRow";
import EditRow from "../../components/admin/EditRow";
import Toolbar from "../../components/admin/Toolbar";
import RoomModal from "../../components/RoomModal/CreateRoomModal";
import { usePublicTablesData } from "../../hooks/usePublicTablesData";

export default function PublicTables() {
  const {
    rows,
    loadingList,
    listError,
    reloadList,
    metrics,
    loadingMetrics,
    metricsError,
  } = usePublicTablesData("public");

  const [hideWaiting, setHideWaiting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filtered = useMemo(() => {
    if (!hideWaiting) return rows;
    return rows.filter((r) => r.status !== "waiting");
  }, [rows, hideWaiting]);

  const onSaved = useCallback(() => {
    setEditingId(null);
    reloadList();
  }, [reloadList]);

  const handleModalClose = (created = false) => {
    setShowCreateModal(false);
    if (created) reloadList();
  };

  return (
    <div className="public-tables">
      {/* ===== Metrics ===== */}
      <div className="public-metrics-title">
        <h3 className="text-lg font-semibold">Số liệu bàn (Public / Private / Active)</h3>
      </div>

      {metricsError ? (
        <div className="error-message">{metricsError}</div>
      ) : loadingMetrics ? (
        <div className="loading-placeholder">Đang tải số liệu bàn...</div>
      ) : (
        <MetricsCards metrics={metrics} />
      )}

      {/* ===== Toolbar ===== */}
      <Toolbar
        hideWaiting={hideWaiting}
        setHideWaiting={setHideWaiting}
        onReload={reloadList}
        loadingList={loadingList}
        onCreate={() => setShowCreateModal(true)}
      />

      {/* ===== Table ===== */}
      <div className="table-container">
        <div className="table-scroll-wrapper">
          {listError ? (
            <div className="error-message">{listError}</div>
          ) : loadingList ? (
            <div className="loading-placeholder">Đang tải danh sách...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Loại</th>
                  <th>Min/Max</th>
                  <th>Blind</th>
                  <th>Buy-in</th>
                  <th>Rake</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) =>
                  row.table_id === editingId ? (
                    <EditRow
                      key={row.table_id}
                      row={row}
                      onCancel={() => setEditingId(null)}
                      onSaved={onSaved}
                    />
                  ) : (
                    <TableRow key={row.table_id} row={row} onEdit={setEditingId} />
                  )
                )}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6" style={{ textAlign: "center", color: "#6b7280" }}>
                      Không có bàn phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <RoomModal isOpen={showCreateModal} onClose={() => handleModalClose(false)} />
    </div>
  );
}
